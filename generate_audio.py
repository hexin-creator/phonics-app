#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
英语音标学习页 —— 批量生成音标与示例单词音频

准备工作（在项目根目录执行）：
    python -m pip install requests

    # Windows PowerShell（只对当前窗口生效）
    $env:OPENAI_API_KEY = "sk-你的密钥"

    # macOS / Linux
    export OPENAI_API_KEY="sk-你的密钥"

运行：
    python generate_audio.py
    python generate_audio.py --force     # 覆盖已经存在的 mp3

可选配置（兼容 OpenAI TTS 接口的服务）：
    OPENAI_TTS_BASE_URL   默认 https://api.openai.com/v1
    OPENAI_TTS_MODEL      默认 gpt-4o-mini-tts（也可以设为 tts-1）
    OPENAI_TTS_VOICE      默认 alloy
    OPENAI_TTS_FORMAT     默认 mp3

脚本会读取 data/phonemes.json，生成：
    phonemes/{安全文件名}.mp3   —— 单个音标发音
    words/{单词}.mp3            —— 示例单词发音

文件名规则：
    音标 id 中的 IPA 特殊字符会转换成 ASCII 安全代号，例如：
    iː -> i-long，ɪ -> i-short，θ -> theta，ʃ -> esh。
    如果 data/phonemes.json 已经使用安全 id，则文件名保持不变。
    脚本启动时会打印「文件名映射表」，可直接与 JSON 中的 audioPath 核对。

没有检测到 OPENAI_API_KEY 时，脚本只打印提示并正常退出，不会报错。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
import unicodedata
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parent
PHONEMES_FILE = PROJECT_ROOT / "data" / "phonemes.json"

# 只有 gpt-4o-mini-tts 等新模型支持 instructions 参数。
BASE_URL = os.environ.get("OPENAI_TTS_BASE_URL", "https://api.openai.com/v1").rstrip("/")
MODEL = os.environ.get("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
VOICE = os.environ.get("OPENAI_TTS_VOICE", "alloy")
RESPONSE_FORMAT = os.environ.get("OPENAI_TTS_FORMAT", "mp3")

# 尽量覆盖常见 IPA 字符；多字符规则放在单字符规则前面。
IPA_SLUGS: tuple[tuple[str, str], ...] = (
    ("iː", "i-long"),
    ("uː", "oo-long"),
    ("ɑː", "ah-long"),
    ("ɔː", "aw-long"),
    ("ɜː", "er-long"),
    ("ɪ", "i-short"),
    ("ʊ", "uh"),
    ("ə", "schwa"),
    ("ɜ", "er"),
    ("ɔ", "aw"),
    ("ɑ", "ah"),
    ("ɒ", "o-short"),
    ("æ", "ae"),
    ("ʌ", "uh-open"),
    ("θ", "theta"),
    ("ð", "eth"),
    ("ʃ", "esh"),
    ("ʒ", "ezh"),
    ("ŋ", "ng"),
    ("ɡ", "g"),
    ("ː", "long"),
    ("ˑ", "half-long"),
    ("ˈ", ""),
    ("ˌ", ""),
    ("ʰ", ""),
    ("̃", ""),
    ("/", ""),
    ("[", ""),
    ("]", ""),
)

# TTS 输入使用更容易被引擎读准的拼写；自定义 id 会回退到 symbol。
PHONEME_PROMPTS: dict[str, dict[str, str]] = {
    "i-long": {
        "input": "ee",
        "instructions": (
            "Pronounce only the long English vowel /iː/, as in the word see. "
            "Hold the sound for about one second. Do not say any extra words."
        ),
    },
    "i-short": {
        "input": "ih",
        "instructions": (
            "Pronounce only the short English vowel /ɪ/, as in the word sit. "
            "Keep it short and relaxed. Do not say any extra words."
        ),
    },
    "theta": {
        "input": "th",
        "instructions": (
            "Pronounce only the voiceless dental fricative /θ/, as in the word think. "
            "Put the tongue tip lightly between the teeth and let air pass. "
            "Do not say any extra words."
        ),
    },
    "esh": {
        "input": "sh",
        "instructions": (
            "Pronounce only the voiceless postalveolar fricative /ʃ/, as in the word she. "
            "Round the lips slightly and let air pass. Do not say any extra words."
        ),
    },
}


def safe_component(value: str, fallback: str = "item") -> str:
    """把任意 id / 单词转换为小写 ASCII 文件名（不含扩展名）。"""
    original = str(value).strip()
    text = original
    for ipa, slug in IPA_SLUGS:
        text = text.replace(ipa, slug)

    # 把带重音符号的拉丁字母等尽量转成 ASCII。
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    text = re.sub(r"-{2,}", "-", text)

    if not text:
        digest = hashlib.sha1(original.encode("utf-8")).hexdigest()[:8]
        text = f"{fallback}-{digest}"
    return text


def load_phonemes() -> list[dict[str, Any]]:
    if not PHONEMES_FILE.exists():
        raise FileNotFoundError(f"找不到数据文件：{PHONEMES_FILE}")
    try:
        data = json.loads(PHONEMES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"data/phonemes.json 不是合法的 JSON：{exc}") from exc

    if not isinstance(data, list) or not data:
        raise ValueError("data/phonemes.json 应当是一个非空数组。")
    return data


def resolve_project_path(relative_path: str) -> Path:
    """将 JSON 中的相对路径安全地定位到项目目录内。"""
    candidate = (PROJECT_ROOT / relative_path).resolve()
    if candidate != PROJECT_ROOT and PROJECT_ROOT not in candidate.parents:
        raise ValueError(f"路径超出项目目录：{relative_path}")
    if candidate.suffix.lower() != ".mp3":
        raise ValueError(f"音频路径必须以 .mp3 结尾：{relative_path}")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", candidate.stem):
        raise ValueError(
            f"文件名不是安全格式：{relative_path}。"
            "请把 audioPath / exampleAudios 改成小写英文、数字或连字符。"
        )
    return candidate


def phoneme_audio_rel(phoneme: dict[str, Any], safe_id: str) -> str:
    value = phoneme.get("audioPath")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return f"phonemes/{safe_id}.mp3"


def make_tasks(phonemes: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    tasks: list[dict[str, Any]] = []
    rows: list[dict[str, str]] = []
    seen_destinations: dict[Path, str] = {}

    for phoneme in phonemes:
        raw_id = str(phoneme.get("id", "")).strip()
        if not raw_id:
            raise ValueError("存在缺少 id 的音标数据。")

        safe_id = safe_component(raw_id, "phoneme")
        audio_rel = phoneme_audio_rel(phoneme, safe_id)
        audio_dest = resolve_project_path(audio_rel)

        symbol = str(phoneme.get("symbol", raw_id)).strip()
        prompt = PHONEME_PROMPTS.get(safe_id, {})
        tts_text = prompt.get("input") or symbol.strip("/[] ") or raw_id
        instructions = prompt.get("instructions", "")

        tasks.append(
            {
                "kind": "phoneme",
                "label": symbol,
                "input": tts_text,
                "instructions": instructions,
                "dest": audio_dest,
                "relative": audio_rel.replace("\\", "/"),
            }
        )
        rows.append(
            {
                "原始 id": raw_id,
                "安全 id": safe_id,
                "音频文件": audio_rel.replace("\\", "/"),
                "状态": "无需替换" if raw_id == safe_id else "已替换特殊字符",
            }
        )

        examples = phoneme.get("examples", [])
        example_audios = phoneme.get("exampleAudios", [])
        if not isinstance(examples, list) or not isinstance(example_audios, list):
            raise ValueError(f"音标 {raw_id} 的 examples / exampleAudios 必须是数组。")

        for index, word in enumerate(examples):
            word_text = str(word).strip()
            if not word_text:
                continue
            if index < len(example_audios) and str(example_audios[index]).strip():
                word_rel = str(example_audios[index]).strip()
            else:
                word_rel = f"words/{safe_component(word_text, 'word')}.mp3"

            word_dest = resolve_project_path(word_rel)
            if word_dest in seen_destinations:
                if seen_destinations[word_dest] != word_text:
                    print(
                        f"[提示] 音频 {word_rel} 同时对应 "
                        f"{seen_destinations[word_dest]!r} 和 {word_text!r}，保留第一个。"
                    )
                continue
            seen_destinations[word_dest] = word_text
            tasks.append(
                {
                    "kind": "word",
                    "label": word_text,
                    "input": word_text,
                    "instructions": "",
                    "dest": word_dest,
                    "relative": word_rel.replace("\\", "/"),
                }
            )

    return tasks, rows


def print_mapping(rows: list[dict[str, str]], tasks: list[dict[str, Any]]) -> None:
    print("\n文件名映射表（请与 data/phonemes.json 中的路径核对）")
    print("-" * 78)
    print(f"{'音标 id':<14}{'安全 id':<16}{'生成的音频文件':<28}状态")
    print("-" * 78)
    for row in rows:
        print(
            f"{row['原始 id']:<14}{row['安全 id']:<16}"
            f"{row['音频文件']:<28}{row['状态']}"
        )

    word_tasks = [task for task in tasks if task["kind"] == "word"]
    if word_tasks:
        print("\n示例单词音频：")
        for task in word_tasks:
            print(f"  {task['label']:<12} -> {task['relative']}")
    print("-" * 78 + "\n")


def request_speech(session: Any, task: dict[str, Any]) -> bytes:
    """调用兼容 OpenAI 的 /audio/speech 接口，返回 mp3 字节。"""
    url = f"{BASE_URL}/audio/speech"
    payload: dict[str, Any] = {
        "model": MODEL,
        "voice": VOICE,
        "input": task["input"],
        "response_format": RESPONSE_FORMAT,
    }
    if task.get("instructions") and MODEL.startswith("gpt-4o"):
        payload["instructions"] = task["instructions"]

    headers = {
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
        "Content-Type": "application/json",
    }

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = session.post(url, headers=headers, json=payload, timeout=90)
            # 一些兼容服务不支持 instructions，去掉后重试一次。
            if response.status_code in (400, 422) and "instructions" in payload:
                payload.pop("instructions", None)
                response = session.post(url, headers=headers, json=payload, timeout=90)

            if response.status_code == 429:
                wait_seconds = 2 * (attempt + 1)
                print(f"    请求受限，{wait_seconds} 秒后重试……")
                time.sleep(wait_seconds)
                continue

            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "")
            if "application/json" in content_type:
                snippet = response.text[:300]
                raise RuntimeError(f"服务返回了 JSON 而不是音频：{snippet}")
            if len(response.content) < 512:
                raise RuntimeError(
                    f"返回内容过小（{len(response.content)} 字节），可能不是有效音频。"
                )
            return response.content
        except Exception as exc:  # noqa: BLE001 - 单条失败不应中断整批任务
            last_error = exc
            if attempt < 2:
                time.sleep(1 + attempt)

    raise RuntimeError(str(last_error) if last_error else "未知网络错误")


def main() -> int:
    parser = argparse.ArgumentParser(description="批量生成音标与示例单词 MP3。")
    parser.add_argument("--force", action="store_true", help="覆盖已存在的音频文件")
    args = parser.parse_args()

    try:
        phonemes = load_phonemes()
        tasks, rows = make_tasks(phonemes)
    except (OSError, ValueError) as exc:
        print(f"[错误] {exc}")
        return 1

    print_mapping(rows, tasks)

    if not os.environ.get("OPENAI_API_KEY"):
        print("未检测到 OPENAI_API_KEY，跳过音频生成")
        print("配置密钥后重新运行：python generate_audio.py")
        return 0

    try:
        import requests
    except ImportError:
        print("[错误] 缺少 requests 依赖，请先运行：python -m pip install requests")
        return 1

    for directory in sorted({task["dest"].parent for task in tasks}):
        directory.mkdir(parents=True, exist_ok=True)

    print(f"开始生成 {len(tasks)} 个音频（模型：{MODEL}，音色：{VOICE}）")
    success = 0
    skipped = 0
    failed: list[tuple[str, str]] = []

    with requests.Session() as session:
        for index, task in enumerate(tasks, start=1):
            destination: Path = task["dest"]
            prefix = f"[{index}/{len(tasks)}] {task['relative']}"
            if destination.exists() and destination.stat().st_size > 0 and not args.force:
                print(f"{prefix} 已存在，跳过（使用 --force 可覆盖）")
                skipped += 1
                continue

            print(f"{prefix} 正在生成……")
            try:
                audio_bytes = request_speech(session, task)
                temp_path = destination.with_name(destination.name + ".part")
                temp_path.write_bytes(audio_bytes)
                temp_path.replace(destination)
                success += 1
                print(f"    完成，{len(audio_bytes):,} 字节")
            except Exception as exc:  # noqa: BLE001 - 汇总所有失败后继续
                failed.append((task["relative"], str(exc)))
                print(f"    失败：{exc}")

    print("\n" + "=" * 60)
    print(f"生成结束：成功 {success}，跳过 {skipped}，失败 {len(failed)}")
    if failed:
        print("失败列表：")
        for path, reason in failed:
            print(f"  - {path}: {reason}")
        print("可以稍后重新运行脚本，已生成的文件会自动跳过。")
        return 1
    print("现在可以启动本地服务器，在网页中试听音频了。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
