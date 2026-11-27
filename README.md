# 音标起步 · Phonics Start

一个纯原生 HTML / CSS / JavaScript 的英语音标学习 MVP，包含 48 个国际音标：
20 个元音 + 28 个辅音。

## 功能

- 48 张音标卡片，每张都带内联 SVG 口型示意图
- 每个音标 6 个示例词，共 288 个示例
- 示例词包含英文、中文释义和 IPA 音标
- 音标表支持按元音、辅音、清辅音、浊辅音筛选
- 详情弹窗：发音要点、常见错误、口型图、示例词
- 练习：随机抽题、四选一、判对错、下一题
- 进度：已学数量、掌握率、已学列表、重置
- 学习进度保存在 localStorage
- 本地 WAV 音频：48 个音标录音 + 示例词录音
- 无框架、无 CDN、无外部图片

## 使用

直接双击 `index.html` 即可浏览。页面当前实际加载 `app-v6.js`，
它和 `app.js` 内容一致；使用带版本号的文件名是为了避开浏览器本地缓存。

如需通过本地服务器访问：

```powershell
python -m http.server 8000
```

然后打开 <http://localhost:8000>。

## 音频

`phonemes/` 和 `words/` 中已包含生成好的本地 WAV 音频。
音标按钮会播放该音标的第一个示例词，示例词按钮会播放对应单词。
如果某个音频缺失，页面会尝试使用浏览器英文语音代读。

## 文件

- `index.html`：页面入口
- `app.js` / `app-v6.js`：完整数据和交互逻辑
- `style.css`：样式
- `data/phonemes.json`：数据示例文件
- `generate_audio.py`：可选的 OpenAI TTS 批量音频生成脚本
- `phonemes/`、`words/`：本地音频

## 技术栈

原生 HTML、CSS、JavaScript，无第三方框架或 CDN。

## 许可证

本项目采用 [MIT License](LICENSE) 开源。

版本：V6
