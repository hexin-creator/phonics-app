"use strict";

/* =========================================================
   音标起步 · 交互逻辑
   48 个音标数据内置在下方 phonemeData（20 元音 + 28 辅音）。
   学习进度保存在 localStorage。
   ========================================================= */

/* 兼容部分旧版 Chromium：补齐 append()，避免旧浏览器直接报错。 */
(function () {
  function addNodes(parent, args) {
    for (let index = 0; index < args.length; index += 1) {
      const node = args[index];
      parent.appendChild(
        typeof node === "string" ? document.createTextNode(node) : node,
      );
    }
  }

  if (typeof Element !== "undefined" && !Element.prototype.append) {
    Element.prototype.append = function () {
      addNodes(this, arguments);
    };
  }

  if (
    typeof DocumentFragment !== "undefined" &&
    !DocumentFragment.prototype.append
  ) {
    DocumentFragment.prototype.append = function () {
      addNodes(this, arguments);
    };
  }
})();

const STORAGE_KEY = "phonics-learned-v1";
const VIEW_NAMES = ["phonemes", "practice", "progress"];
const OPTION_LETTERS = ["A", "B", "C", "D"];
const VIEW_TITLES = {
  phonemes: "音标表 · 音标起步",
  practice: "练习 · 音标起步",
  progress: "学习进度 · 音标起步",
};

const FILTERS = {
  all: () => true,
  vowel: (phoneme) => phoneme.type === "vowel",
  consonant: (phoneme) => phoneme.type === "consonant",
  unvoiced: (phoneme) => phoneme.type === "consonant" && phoneme.subtype === "清辅音",
  voiced: (phoneme) => phoneme.type === "consonant" && phoneme.subtype === "浊辅音",
};

const phonemeData = [
  {
    "symbol": "/iː/",
    "category": "元音",
    "tip": "长元音。嘴角向两边展开，像微笑；舌前部抬高靠近上颚，声音饱满并适当拉长。",
    "examples": [
      {
        "word": "see",
        "translation": "看见",
        "ipa": "/siː/"
      },
      {
        "word": "tea",
        "translation": "茶",
        "ipa": "/tiː/"
      },
      {
        "word": "green",
        "translation": "绿色",
        "ipa": "/ɡriːn/"
      },
      {
        "word": "meet",
        "translation": "遇见",
        "ipa": "/miːt/"
      },
      {
        "word": "key",
        "translation": "钥匙",
        "ipa": "/kiː/"
      },
      {
        "word": "free",
        "translation": "自由的",
        "ipa": "/friː/"
      }
    ]
  },
  {
    "symbol": "/ɪ/",
    "category": "元音",
    "tip": "短元音。嘴唇和下巴放松，开口比 /iː/ 稍大；舌前部抬起但不要过高，声音短而轻。",
    "examples": [
      {
        "word": "sit",
        "translation": "坐",
        "ipa": "/sɪt/"
      },
      {
        "word": "big",
        "translation": "大的",
        "ipa": "/bɪɡ/"
      },
      {
        "word": "fish",
        "translation": "鱼",
        "ipa": "/fɪʃ/"
      },
      {
        "word": "ship",
        "translation": "船",
        "ipa": "/ʃɪp/"
      },
      {
        "word": "milk",
        "translation": "牛奶",
        "ipa": "/mɪlk/"
      },
      {
        "word": "win",
        "translation": "赢",
        "ipa": "/wɪn/"
      }
    ]
  },
  {
    "symbol": "/e/",
    "category": "元音",
    "tip": "短元音。开口中等，舌前部稍抬起，嘴角自然展开；注意收住声音，不要拖成 /eɪ/。",
    "examples": [
      {
        "word": "bed",
        "translation": "床",
        "ipa": "/bed/"
      },
      {
        "word": "pen",
        "translation": "钢笔",
        "ipa": "/pen/"
      },
      {
        "word": "red",
        "translation": "红色",
        "ipa": "/red/"
      },
      {
        "word": "ten",
        "translation": "十",
        "ipa": "/ten/"
      },
      {
        "word": "friend",
        "translation": "朋友",
        "ipa": "/frend/"
      },
      {
        "word": "egg",
        "translation": "鸡蛋",
        "ipa": "/eɡ/"
      }
    ]
  },
  {
    "symbol": "/æ/",
    "category": "元音",
    "tip": "短元音。嘴张大、下巴放低，舌前部位置较低，声音扁平而短促。",
    "examples": [
      {
        "word": "cat",
        "translation": "猫",
        "ipa": "/kæt/"
      },
      {
        "word": "map",
        "translation": "地图",
        "ipa": "/mæp/"
      },
      {
        "word": "bad",
        "translation": "坏的",
        "ipa": "/bæd/"
      },
      {
        "word": "hand",
        "translation": "手",
        "ipa": "/hænd/"
      },
      {
        "word": "apple",
        "translation": "苹果",
        "ipa": "/ˈæpəl/"
      },
      {
        "word": "black",
        "translation": "黑色的",
        "ipa": "/blæk/"
      }
    ]
  },
  {
    "symbol": "/ɑː/",
    "category": "元音",
    "tip": "长元音。口腔张大，舌位低并靠后，声带振动，声音拉长，类似汉语“啊”但更靠后。",
    "examples": [
      {
        "word": "car",
        "translation": "汽车",
        "ipa": "/kɑː/"
      },
      {
        "word": "far",
        "translation": "远的",
        "ipa": "/fɑː/"
      },
      {
        "word": "park",
        "translation": "公园",
        "ipa": "/pɑːk/"
      },
      {
        "word": "heart",
        "translation": "心脏",
        "ipa": "/hɑːt/"
      },
      {
        "word": "father",
        "translation": "父亲",
        "ipa": "/ˈfɑːðə/"
      },
      {
        "word": "start",
        "translation": "开始",
        "ipa": "/stɑːt/"
      }
    ]
  },
  {
    "symbol": "/ɒ/",
    "category": "元音",
    "tip": "短元音。双唇略圆，开口较大，舌后部位置低，发音短促，常见于英式英语。",
    "examples": [
      {
        "word": "hot",
        "translation": "热的",
        "ipa": "/hɒt/"
      },
      {
        "word": "dog",
        "translation": "狗",
        "ipa": "/dɒɡ/"
      },
      {
        "word": "shop",
        "translation": "商店",
        "ipa": "/ʃɒp/"
      },
      {
        "word": "box",
        "translation": "盒子",
        "ipa": "/bɒks/"
      },
      {
        "word": "clock",
        "translation": "时钟",
        "ipa": "/klɒk/"
      },
      {
        "word": "job",
        "translation": "工作",
        "ipa": "/dʒɒb/"
      }
    ]
  },
  {
    "symbol": "/ɔː/",
    "category": "元音",
    "tip": "长元音。双唇收圆并稍向前突，舌后部抬起，声音拉长，口型保持圆润。",
    "examples": [
      {
        "word": "saw",
        "translation": "看见（过去式）",
        "ipa": "/sɔː/"
      },
      {
        "word": "door",
        "translation": "门",
        "ipa": "/dɔː/"
      },
      {
        "word": "four",
        "translation": "四",
        "ipa": "/fɔː/"
      },
      {
        "word": "talk",
        "translation": "谈话",
        "ipa": "/tɔːk/"
      },
      {
        "word": "ball",
        "translation": "球",
        "ipa": "/bɔːl/"
      },
      {
        "word": "more",
        "translation": "更多",
        "ipa": "/mɔː/"
      }
    ]
  },
  {
    "symbol": "/ʊ/",
    "category": "元音",
    "tip": "短元音。双唇略圆，舌后部抬起，发音短而松弛，不要拉成长元音 /uː/。",
    "examples": [
      {
        "word": "book",
        "translation": "书",
        "ipa": "/bʊk/"
      },
      {
        "word": "good",
        "translation": "好的",
        "ipa": "/ɡʊd/"
      },
      {
        "word": "look",
        "translation": "看",
        "ipa": "/lʊk/"
      },
      {
        "word": "foot",
        "translation": "脚",
        "ipa": "/fʊt/"
      },
      {
        "word": "put",
        "translation": "放置",
        "ipa": "/pʊt/"
      },
      {
        "word": "full",
        "translation": "满的",
        "ipa": "/fʊl/"
      }
    ]
  },
  {
    "symbol": "/uː/",
    "category": "元音",
    "tip": "长元音。双唇收圆并向前突出，舌后部抬高，声音饱满、拉长。",
    "examples": [
      {
        "word": "food",
        "translation": "食物",
        "ipa": "/fuːd/"
      },
      {
        "word": "blue",
        "translation": "蓝色",
        "ipa": "/bluː/"
      },
      {
        "word": "school",
        "translation": "学校",
        "ipa": "/skuːl/"
      },
      {
        "word": "moon",
        "translation": "月亮",
        "ipa": "/muːn/"
      },
      {
        "word": "two",
        "translation": "二",
        "ipa": "/tuː/"
      },
      {
        "word": "true",
        "translation": "真实的",
        "ipa": "/truː/"
      }
    ]
  },
  {
    "symbol": "/ʌ/",
    "category": "元音",
    "tip": "短元音。开口中等，双唇自然放松，舌头居中偏后，声音短而有力。",
    "examples": [
      {
        "word": "cup",
        "translation": "杯子",
        "ipa": "/kʌp/"
      },
      {
        "word": "bus",
        "translation": "公共汽车",
        "ipa": "/bʌs/"
      },
      {
        "word": "sun",
        "translation": "太阳",
        "ipa": "/sʌn/"
      },
      {
        "word": "love",
        "translation": "爱",
        "ipa": "/lʌv/"
      },
      {
        "word": "money",
        "translation": "钱",
        "ipa": "/ˈmʌni/"
      },
      {
        "word": "luck",
        "translation": "运气",
        "ipa": "/lʌk/"
      }
    ]
  },
  {
    "symbol": "/ɜː/",
    "category": "元音",
    "tip": "长元音。舌中部抬起，双唇自然放松，声音拉长，不要卷舌过度。",
    "examples": [
      {
        "word": "bird",
        "translation": "鸟",
        "ipa": "/bɜːd/"
      },
      {
        "word": "girl",
        "translation": "女孩",
        "ipa": "/ɡɜːl/"
      },
      {
        "word": "work",
        "translation": "工作",
        "ipa": "/wɜːk/"
      },
      {
        "word": "nurse",
        "translation": "护士",
        "ipa": "/nɜːs/"
      },
      {
        "word": "learn",
        "translation": "学习",
        "ipa": "/lɜːn/"
      },
      {
        "word": "first",
        "translation": "第一",
        "ipa": "/fɜːst/"
      }
    ]
  },
  {
    "symbol": "/ə/",
    "category": "元音",
    "tip": "弱读中央元音。嘴唇和舌头完全放松，声音轻而短，通常出现在非重读音节。",
    "examples": [
      {
        "word": "about",
        "translation": "关于",
        "ipa": "/əˈbaʊt/"
      },
      {
        "word": "teacher",
        "translation": "老师",
        "ipa": "/ˈtiːtʃə/"
      },
      {
        "word": "sofa",
        "translation": "沙发",
        "ipa": "/ˈsəʊfə/"
      },
      {
        "word": "banana",
        "translation": "香蕉",
        "ipa": "/bəˈnɑːnə/"
      },
      {
        "word": "again",
        "translation": "再次",
        "ipa": "/əˈɡen/"
      },
      {
        "word": "doctor",
        "translation": "医生",
        "ipa": "/ˈdɒktə/"
      }
    ]
  },
  {
    "symbol": "/eɪ/",
    "category": "元音",
    "tip": "合口双元音。从 /e/ 滑向 /ɪ/，前长后短，口型由半开逐渐收窄。",
    "examples": [
      {
        "word": "day",
        "translation": "天",
        "ipa": "/deɪ/"
      },
      {
        "word": "name",
        "translation": "名字",
        "ipa": "/neɪm/"
      },
      {
        "word": "make",
        "translation": "制作",
        "ipa": "/meɪk/"
      },
      {
        "word": "rain",
        "translation": "雨",
        "ipa": "/reɪn/"
      },
      {
        "word": "eight",
        "translation": "八",
        "ipa": "/eɪt/"
      },
      {
        "word": "play",
        "translation": "玩",
        "ipa": "/pleɪ/"
      }
    ]
  },
  {
    "symbol": "/aɪ/",
    "category": "元音",
    "tip": "合口双元音。从 /a/ 滑向 /ɪ/，口型由大变小，前一个音更重、更长。",
    "examples": [
      {
        "word": "my",
        "translation": "我的",
        "ipa": "/maɪ/"
      },
      {
        "word": "time",
        "translation": "时间",
        "ipa": "/taɪm/"
      },
      {
        "word": "bike",
        "translation": "自行车",
        "ipa": "/baɪk/"
      },
      {
        "word": "light",
        "translation": "光",
        "ipa": "/laɪt/"
      },
      {
        "word": "five",
        "translation": "五",
        "ipa": "/faɪv/"
      },
      {
        "word": "night",
        "translation": "夜晚",
        "ipa": "/naɪt/"
      }
    ]
  },
  {
    "symbol": "/ɔɪ/",
    "category": "元音",
    "tip": "合口双元音。从 /ɔ/ 滑向 /ɪ/，双唇由圆变展，前重后轻。",
    "examples": [
      {
        "word": "boy",
        "translation": "男孩",
        "ipa": "/bɔɪ/"
      },
      {
        "word": "toy",
        "translation": "玩具",
        "ipa": "/tɔɪ/"
      },
      {
        "word": "coin",
        "translation": "硬币",
        "ipa": "/kɔɪn/"
      },
      {
        "word": "voice",
        "translation": "声音",
        "ipa": "/vɔɪs/"
      },
      {
        "word": "join",
        "translation": "加入",
        "ipa": "/dʒɔɪn/"
      },
      {
        "word": "enjoy",
        "translation": "享受",
        "ipa": "/ɪnˈdʒɔɪ/"
      }
    ]
  },
  {
    "symbol": "/aʊ/",
    "category": "元音",
    "tip": "合口双元音。从 /a/ 滑向 /ʊ/，口型由大变小并逐渐收圆，前重后轻。",
    "examples": [
      {
        "word": "now",
        "translation": "现在",
        "ipa": "/naʊ/"
      },
      {
        "word": "house",
        "translation": "房子",
        "ipa": "/haʊs/"
      },
      {
        "word": "cow",
        "translation": "奶牛",
        "ipa": "/kaʊ/"
      },
      {
        "word": "town",
        "translation": "城镇",
        "ipa": "/taʊn/"
      },
      {
        "word": "out",
        "translation": "外面",
        "ipa": "/aʊt/"
      },
      {
        "word": "down",
        "translation": "向下",
        "ipa": "/daʊn/"
      }
    ]
  },
  {
    "symbol": "/əʊ/",
    "category": "元音",
    "tip": "合口双元音。从 /ə/ 滑向 /ʊ/，双唇逐渐收圆，前长后短。",
    "examples": [
      {
        "word": "go",
        "translation": "去",
        "ipa": "/ɡəʊ/"
      },
      {
        "word": "home",
        "translation": "家",
        "ipa": "/həʊm/"
      },
      {
        "word": "nose",
        "translation": "鼻子",
        "ipa": "/nəʊz/"
      },
      {
        "word": "boat",
        "translation": "船",
        "ipa": "/bəʊt/"
      },
      {
        "word": "know",
        "translation": "知道",
        "ipa": "/nəʊ/"
      },
      {
        "word": "open",
        "translation": "打开",
        "ipa": "/ˈəʊpən/"
      }
    ]
  },
  {
    "symbol": "/ɪə/",
    "category": "元音",
    "tip": "集中双元音。从 /ɪ/ 滑向 /ə/，前重后轻，口腔逐渐放松。",
    "examples": [
      {
        "word": "ear",
        "translation": "耳朵",
        "ipa": "/ɪə/"
      },
      {
        "word": "here",
        "translation": "这里",
        "ipa": "/hɪə/"
      },
      {
        "word": "near",
        "translation": "近的",
        "ipa": "/nɪə/"
      },
      {
        "word": "clear",
        "translation": "清晰的",
        "ipa": "/klɪə/"
      },
      {
        "word": "beer",
        "translation": "啤酒",
        "ipa": "/bɪə/"
      },
      {
        "word": "idea",
        "translation": "想法",
        "ipa": "/aɪˈdɪə/"
      }
    ]
  },
  {
    "symbol": "/eə/",
    "category": "元音",
    "tip": "集中双元音。从 /e/ 滑向 /ə/，口腔逐渐放松，前重后轻。",
    "examples": [
      {
        "word": "air",
        "translation": "空气",
        "ipa": "/eə/"
      },
      {
        "word": "hair",
        "translation": "头发",
        "ipa": "/heə/"
      },
      {
        "word": "care",
        "translation": "关心",
        "ipa": "/keə/"
      },
      {
        "word": "where",
        "translation": "哪里",
        "ipa": "/weə/"
      },
      {
        "word": "bear",
        "translation": "熊",
        "ipa": "/beə/"
      },
      {
        "word": "chair",
        "translation": "椅子",
        "ipa": "/tʃeə/"
      }
    ]
  },
  {
    "symbol": "/ʊə/",
    "category": "元音",
    "tip": "集中双元音。从 /ʊ/ 滑向 /ə/，双唇由圆逐渐放松，前重后轻。",
    "examples": [
      {
        "word": "tour",
        "translation": "旅行",
        "ipa": "/tʊə/"
      },
      {
        "word": "poor",
        "translation": "贫穷的",
        "ipa": "/pʊə/"
      },
      {
        "word": "sure",
        "translation": "确定的",
        "ipa": "/ʃʊə/"
      },
      {
        "word": "cure",
        "translation": "治愈",
        "ipa": "/kjʊə/"
      },
      {
        "word": "pure",
        "translation": "纯净的",
        "ipa": "/pjʊə/"
      },
      {
        "word": "tourist",
        "translation": "游客",
        "ipa": "/ˈtʊərɪst/"
      }
    ]
  },
  {
    "symbol": "/p/",
    "category": "辅音",
    "tip": "清辅音。双唇闭合后突然放开，气流爆破而出，声带不振动。",
    "examples": [
      {
        "word": "pen",
        "translation": "钢笔",
        "ipa": "/pen/"
      },
      {
        "word": "pig",
        "translation": "猪",
        "ipa": "/pɪɡ/"
      },
      {
        "word": "map",
        "translation": "地图",
        "ipa": "/mæp/"
      },
      {
        "word": "happy",
        "translation": "快乐的",
        "ipa": "/ˈhæpi/"
      },
      {
        "word": "stop",
        "translation": "停止",
        "ipa": "/stɒp/"
      },
      {
        "word": "open",
        "translation": "打开",
        "ipa": "/ˈəʊpən/"
      }
    ]
  },
  {
    "symbol": "/b/",
    "category": "辅音",
    "tip": "浊辅音。双唇闭合后突然放开，气流爆破而出，声带振动。",
    "examples": [
      {
        "word": "book",
        "translation": "书",
        "ipa": "/bʊk/"
      },
      {
        "word": "bag",
        "translation": "包",
        "ipa": "/bæɡ/"
      },
      {
        "word": "big",
        "translation": "大的",
        "ipa": "/bɪɡ/"
      },
      {
        "word": "job",
        "translation": "工作",
        "ipa": "/dʒɒb/"
      },
      {
        "word": "baby",
        "translation": "婴儿",
        "ipa": "/ˈbeɪbi/"
      },
      {
        "word": "table",
        "translation": "桌子",
        "ipa": "/ˈteɪbəl/"
      }
    ]
  },
  {
    "symbol": "/t/",
    "category": "辅音",
    "tip": "清辅音。舌尖抵住上齿龈后迅速放开，气流爆破而出，声带不振动。",
    "examples": [
      {
        "word": "tea",
        "translation": "茶",
        "ipa": "/tiː/"
      },
      {
        "word": "ten",
        "translation": "十",
        "ipa": "/ten/"
      },
      {
        "word": "cat",
        "translation": "猫",
        "ipa": "/kæt/"
      },
      {
        "word": "water",
        "translation": "水",
        "ipa": "/ˈwɔːtə/"
      },
      {
        "word": "stop",
        "translation": "停止",
        "ipa": "/stɒp/"
      },
      {
        "word": "time",
        "translation": "时间",
        "ipa": "/taɪm/"
      }
    ]
  },
  {
    "symbol": "/d/",
    "category": "辅音",
    "tip": "浊辅音。舌尖抵住上齿龈后迅速放开，气流爆破而出，声带振动。",
    "examples": [
      {
        "word": "dog",
        "translation": "狗",
        "ipa": "/dɒɡ/"
      },
      {
        "word": "door",
        "translation": "门",
        "ipa": "/dɔː/"
      },
      {
        "word": "bed",
        "translation": "床",
        "ipa": "/bed/"
      },
      {
        "word": "day",
        "translation": "天",
        "ipa": "/deɪ/"
      },
      {
        "word": "red",
        "translation": "红色",
        "ipa": "/red/"
      },
      {
        "word": "hand",
        "translation": "手",
        "ipa": "/hænd/"
      }
    ]
  },
  {
    "symbol": "/k/",
    "category": "辅音",
    "tip": "清辅音。舌后部抵住软腭后突然放开，气流爆破而出，声带不振动。",
    "examples": [
      {
        "word": "cat",
        "translation": "猫",
        "ipa": "/kæt/"
      },
      {
        "word": "key",
        "translation": "钥匙",
        "ipa": "/kiː/"
      },
      {
        "word": "book",
        "translation": "书",
        "ipa": "/bʊk/"
      },
      {
        "word": "school",
        "translation": "学校",
        "ipa": "/skuːl/"
      },
      {
        "word": "make",
        "translation": "制作",
        "ipa": "/meɪk/"
      },
      {
        "word": "back",
        "translation": "后面",
        "ipa": "/bæk/"
      }
    ]
  },
  {
    "symbol": "/ɡ/",
    "category": "辅音",
    "tip": "浊辅音。舌后部抵住软腭后突然放开，气流爆破而出，声带振动。",
    "examples": [
      {
        "word": "go",
        "translation": "去",
        "ipa": "/ɡəʊ/"
      },
      {
        "word": "girl",
        "translation": "女孩",
        "ipa": "/ɡɜːl/"
      },
      {
        "word": "bag",
        "translation": "包",
        "ipa": "/bæɡ/"
      },
      {
        "word": "big",
        "translation": "大的",
        "ipa": "/bɪɡ/"
      },
      {
        "word": "green",
        "translation": "绿色",
        "ipa": "/ɡriːn/"
      },
      {
        "word": "dog",
        "translation": "狗",
        "ipa": "/dɒɡ/"
      }
    ]
  },
  {
    "symbol": "/f/",
    "category": "辅音",
    "tip": "清辅音。上齿轻触下唇，气流从缝隙摩擦而出，声带不振动。",
    "examples": [
      {
        "word": "fish",
        "translation": "鱼",
        "ipa": "/fɪʃ/"
      },
      {
        "word": "five",
        "translation": "五",
        "ipa": "/faɪv/"
      },
      {
        "word": "coffee",
        "translation": "咖啡",
        "ipa": "/ˈkɒfi/"
      },
      {
        "word": "laugh",
        "translation": "笑",
        "ipa": "/lɑːf/"
      },
      {
        "word": "phone",
        "translation": "电话",
        "ipa": "/fəʊn/"
      },
      {
        "word": "office",
        "translation": "办公室",
        "ipa": "/ˈɒfɪs/"
      }
    ]
  },
  {
    "symbol": "/v/",
    "category": "辅音",
    "tip": "浊辅音。上齿轻触下唇，气流从缝隙摩擦而出，声带振动。",
    "examples": [
      {
        "word": "very",
        "translation": "非常",
        "ipa": "/ˈveri/"
      },
      {
        "word": "five",
        "translation": "五",
        "ipa": "/faɪv/"
      },
      {
        "word": "love",
        "translation": "爱",
        "ipa": "/lʌv/"
      },
      {
        "word": "village",
        "translation": "村庄",
        "ipa": "/ˈvɪlɪdʒ/"
      },
      {
        "word": "seven",
        "translation": "七",
        "ipa": "/ˈsevən/"
      },
      {
        "word": "save",
        "translation": "拯救",
        "ipa": "/seɪv/"
      }
    ]
  },
  {
    "symbol": "/θ/",
    "category": "辅音",
    "tip": "清辅音。舌尖轻轻伸到上下门齿之间，气流从舌尖与牙齿的缝隙摩擦送出，声带不振动。",
    "examples": [
      {
        "word": "think",
        "translation": "想",
        "ipa": "/θɪŋk/"
      },
      {
        "word": "three",
        "translation": "三",
        "ipa": "/θriː/"
      },
      {
        "word": "bath",
        "translation": "洗澡",
        "ipa": "/bɑːθ/"
      },
      {
        "word": "math",
        "translation": "数学",
        "ipa": "/mæθ/"
      },
      {
        "word": "healthy",
        "translation": "健康的",
        "ipa": "/ˈhelθi/"
      },
      {
        "word": "thick",
        "translation": "厚的",
        "ipa": "/θɪk/"
      }
    ]
  },
  {
    "symbol": "/ð/",
    "category": "辅音",
    "tip": "浊辅音。舌尖轻轻伸到上下门齿之间，气流摩擦而出，声带振动。",
    "examples": [
      {
        "word": "this",
        "translation": "这个",
        "ipa": "/ðɪs/"
      },
      {
        "word": "that",
        "translation": "那个",
        "ipa": "/ðæt/"
      },
      {
        "word": "mother",
        "translation": "母亲",
        "ipa": "/ˈmʌðə/"
      },
      {
        "word": "brother",
        "translation": "兄弟",
        "ipa": "/ˈbrʌðə/"
      },
      {
        "word": "weather",
        "translation": "天气",
        "ipa": "/ˈweðə/"
      },
      {
        "word": "they",
        "translation": "他们",
        "ipa": "/ðeɪ/"
      }
    ]
  },
  {
    "symbol": "/s/",
    "category": "辅音",
    "tip": "清辅音。舌尖靠近齿龈，气流从窄缝摩擦而出，声带不振动。",
    "examples": [
      {
        "word": "sun",
        "translation": "太阳",
        "ipa": "/sʌn/"
      },
      {
        "word": "see",
        "translation": "看见",
        "ipa": "/siː/"
      },
      {
        "word": "bus",
        "translation": "公共汽车",
        "ipa": "/bʌs/"
      },
      {
        "word": "city",
        "translation": "城市",
        "ipa": "/ˈsɪti/"
      },
      {
        "word": "school",
        "translation": "学校",
        "ipa": "/skuːl/"
      },
      {
        "word": "mouse",
        "translation": "老鼠",
        "ipa": "/maʊs/"
      }
    ]
  },
  {
    "symbol": "/z/",
    "category": "辅音",
    "tip": "浊辅音。舌尖靠近齿龈，气流从窄缝摩擦而出，声带振动。",
    "examples": [
      {
        "word": "zoo",
        "translation": "动物园",
        "ipa": "/zuː/"
      },
      {
        "word": "zero",
        "translation": "零",
        "ipa": "/ˈzɪərəʊ/"
      },
      {
        "word": "nose",
        "translation": "鼻子",
        "ipa": "/nəʊz/"
      },
      {
        "word": "easy",
        "translation": "容易的",
        "ipa": "/ˈiːzi/"
      },
      {
        "word": "music",
        "translation": "音乐",
        "ipa": "/ˈmjuːzɪk/"
      },
      {
        "word": "jazz",
        "translation": "爵士乐",
        "ipa": "/dʒæz/"
      }
    ]
  },
  {
    "symbol": "/ʃ/",
    "category": "辅音",
    "tip": "清辅音。双唇稍向前收圆，舌前部靠近齿龈后部，气流摩擦而出，声带不振动。",
    "examples": [
      {
        "word": "she",
        "translation": "她",
        "ipa": "/ʃiː/"
      },
      {
        "word": "shop",
        "translation": "商店",
        "ipa": "/ʃɒp/"
      },
      {
        "word": "fish",
        "translation": "鱼",
        "ipa": "/fɪʃ/"
      },
      {
        "word": "wash",
        "translation": "洗",
        "ipa": "/wɒʃ/"
      },
      {
        "word": "station",
        "translation": "车站",
        "ipa": "/ˈsteɪʃən/"
      },
      {
        "word": "sugar",
        "translation": "糖",
        "ipa": "/ˈʃʊɡə/"
      }
    ]
  },
  {
    "symbol": "/ʒ/",
    "category": "辅音",
    "tip": "浊辅音。双唇稍向前收圆，舌前部靠近齿龈后部，气流摩擦而出，声带振动。",
    "examples": [
      {
        "word": "measure",
        "translation": "测量",
        "ipa": "/ˈmeʒə/"
      },
      {
        "word": "vision",
        "translation": "视力",
        "ipa": "/ˈvɪʒən/"
      },
      {
        "word": "pleasure",
        "translation": "快乐",
        "ipa": "/ˈpleʒə/"
      },
      {
        "word": "usual",
        "translation": "通常的",
        "ipa": "/ˈjuːʒuəl/"
      },
      {
        "word": "garage",
        "translation": "车库",
        "ipa": "/ˈɡærɑːʒ/"
      },
      {
        "word": "television",
        "translation": "电视",
        "ipa": "/ˈtelɪvɪʒən/"
      }
    ]
  },
  {
    "symbol": "/h/",
    "category": "辅音",
    "tip": "清辅音。口腔自然打开，气流从喉部轻轻呼出，声带不振动。",
    "examples": [
      {
        "word": "hat",
        "translation": "帽子",
        "ipa": "/hæt/"
      },
      {
        "word": "hand",
        "translation": "手",
        "ipa": "/hænd/"
      },
      {
        "word": "hot",
        "translation": "热的",
        "ipa": "/hɒt/"
      },
      {
        "word": "home",
        "translation": "家",
        "ipa": "/həʊm/"
      },
      {
        "word": "happy",
        "translation": "快乐的",
        "ipa": "/ˈhæpi/"
      },
      {
        "word": "behind",
        "translation": "在后面",
        "ipa": "/bɪˈhaɪnd/"
      }
    ]
  },
  {
    "symbol": "/tʃ/",
    "category": "辅音",
    "tip": "清辅音。舌前部抵住齿龈后部，突然放开形成摩擦爆破，声带不振动。",
    "examples": [
      {
        "word": "chair",
        "translation": "椅子",
        "ipa": "/tʃeə/"
      },
      {
        "word": "cheese",
        "translation": "奶酪",
        "ipa": "/tʃiːz/"
      },
      {
        "word": "teacher",
        "translation": "老师",
        "ipa": "/ˈtiːtʃə/"
      },
      {
        "word": "watch",
        "translation": "手表",
        "ipa": "/wɒtʃ/"
      },
      {
        "word": "lunch",
        "translation": "午餐",
        "ipa": "/lʌntʃ/"
      },
      {
        "word": "church",
        "translation": "教堂",
        "ipa": "/tʃɜːtʃ/"
      }
    ]
  },
  {
    "symbol": "/dʒ/",
    "category": "辅音",
    "tip": "浊辅音。舌前部抵住齿龈后部，突然放开形成摩擦爆破，声带振动。",
    "examples": [
      {
        "word": "job",
        "translation": "工作",
        "ipa": "/dʒɒb/"
      },
      {
        "word": "judge",
        "translation": "法官",
        "ipa": "/dʒʌdʒ/"
      },
      {
        "word": "bridge",
        "translation": "桥",
        "ipa": "/brɪdʒ/"
      },
      {
        "word": "age",
        "translation": "年龄",
        "ipa": "/eɪdʒ/"
      },
      {
        "word": "orange",
        "translation": "橙子",
        "ipa": "/ˈɒrɪndʒ/"
      },
      {
        "word": "large",
        "translation": "大的",
        "ipa": "/lɑːdʒ/"
      }
    ]
  },
  {
    "symbol": "/tr/",
    "category": "辅音",
    "tip": "清辅音。舌尖抵住齿龈后部，气流冲出时带卷舌动作，声带不振动。",
    "examples": [
      {
        "word": "tree",
        "translation": "树",
        "ipa": "/triː/"
      },
      {
        "word": "train",
        "translation": "火车",
        "ipa": "/treɪn/"
      },
      {
        "word": "try",
        "translation": "尝试",
        "ipa": "/traɪ/"
      },
      {
        "word": "travel",
        "translation": "旅行",
        "ipa": "/ˈtrævəl/"
      },
      {
        "word": "truck",
        "translation": "卡车",
        "ipa": "/trʌk/"
      },
      {
        "word": "street",
        "translation": "街道",
        "ipa": "/striːt/"
      }
    ]
  },
  {
    "symbol": "/dr/",
    "category": "辅音",
    "tip": "浊辅音。舌尖抵住齿龈后部，气流冲出时带卷舌动作，声带振动。",
    "examples": [
      {
        "word": "dream",
        "translation": "梦想",
        "ipa": "/driːm/"
      },
      {
        "word": "drive",
        "translation": "驾驶",
        "ipa": "/draɪv/"
      },
      {
        "word": "dress",
        "translation": "连衣裙",
        "ipa": "/dres/"
      },
      {
        "word": "draw",
        "translation": "画",
        "ipa": "/drɔː/"
      },
      {
        "word": "drink",
        "translation": "喝",
        "ipa": "/drɪŋk/"
      },
      {
        "word": "children",
        "translation": "孩子们",
        "ipa": "/ˈtʃɪldrən/"
      }
    ]
  },
  {
    "symbol": "/ts/",
    "category": "辅音",
    "tip": "清辅音。舌尖先抵住齿龈，随后快速放开，气流摩擦而出，声带不振动。",
    "examples": [
      {
        "word": "cats",
        "translation": "猫（复数）",
        "ipa": "/kæts/"
      },
      {
        "word": "hats",
        "translation": "帽子（复数）",
        "ipa": "/hæts/"
      },
      {
        "word": "sits",
        "translation": "坐（第三人称单数）",
        "ipa": "/sɪts/"
      },
      {
        "word": "boats",
        "translation": "船（复数）",
        "ipa": "/bəʊts/"
      },
      {
        "word": "seats",
        "translation": "座位（复数）",
        "ipa": "/siːts/"
      },
      {
        "word": "students",
        "translation": "学生（复数）",
        "ipa": "/ˈstjuːdənts/"
      }
    ]
  },
  {
    "symbol": "/dz/",
    "category": "辅音",
    "tip": "浊辅音。舌尖先抵住齿龈，随后快速放开，气流摩擦而出，声带振动。",
    "examples": [
      {
        "word": "beds",
        "translation": "床（复数）",
        "ipa": "/bedz/"
      },
      {
        "word": "hands",
        "translation": "手（复数）",
        "ipa": "/hændz/"
      },
      {
        "word": "cards",
        "translation": "卡片（复数）",
        "ipa": "/kɑːdz/"
      },
      {
        "word": "needs",
        "translation": "需要（第三人称单数）",
        "ipa": "/niːdz/"
      },
      {
        "word": "friends",
        "translation": "朋友（复数）",
        "ipa": "/frendz/"
      },
      {
        "word": "roads",
        "translation": "路（复数）",
        "ipa": "/rəʊdz/"
      }
    ]
  },
  {
    "symbol": "/m/",
    "category": "辅音",
    "tip": "浊辅音。双唇闭合，气流从鼻腔通过，声带振动。",
    "examples": [
      {
        "word": "man",
        "translation": "男人",
        "ipa": "/mæn/"
      },
      {
        "word": "map",
        "translation": "地图",
        "ipa": "/mæp/"
      },
      {
        "word": "milk",
        "translation": "牛奶",
        "ipa": "/mɪlk/"
      },
      {
        "word": "moon",
        "translation": "月亮",
        "ipa": "/muːn/"
      },
      {
        "word": "time",
        "translation": "时间",
        "ipa": "/taɪm/"
      },
      {
        "word": "family",
        "translation": "家庭",
        "ipa": "/ˈfæməli/"
      }
    ]
  },
  {
    "symbol": "/n/",
    "category": "辅音",
    "tip": "浊辅音。舌尖抵住上齿龈，气流从鼻腔通过，声带振动。",
    "examples": [
      {
        "word": "no",
        "translation": "不",
        "ipa": "/nəʊ/"
      },
      {
        "word": "name",
        "translation": "名字",
        "ipa": "/neɪm/"
      },
      {
        "word": "nose",
        "translation": "鼻子",
        "ipa": "/nəʊz/"
      },
      {
        "word": "sun",
        "translation": "太阳",
        "ipa": "/sʌn/"
      },
      {
        "word": "hand",
        "translation": "手",
        "ipa": "/hænd/"
      },
      {
        "word": "night",
        "translation": "夜晚",
        "ipa": "/naɪt/"
      }
    ]
  },
  {
    "symbol": "/ŋ/",
    "category": "辅音",
    "tip": "浊辅音。舌后部抵住软腭，气流从鼻腔通过，声带振动。",
    "examples": [
      {
        "word": "sing",
        "translation": "唱歌",
        "ipa": "/sɪŋ/"
      },
      {
        "word": "long",
        "translation": "长的",
        "ipa": "/lɒŋ/"
      },
      {
        "word": "king",
        "translation": "国王",
        "ipa": "/kɪŋ/"
      },
      {
        "word": "ring",
        "translation": "戒指",
        "ipa": "/rɪŋ/"
      },
      {
        "word": "bank",
        "translation": "银行",
        "ipa": "/bæŋk/"
      },
      {
        "word": "English",
        "translation": "英语",
        "ipa": "/ˈɪŋɡlɪʃ/"
      }
    ]
  },
  {
    "symbol": "/l/",
    "category": "辅音",
    "tip": "浊辅音。舌尖抵住上齿龈，气流从舌头两侧通过，声带振动。",
    "examples": [
      {
        "word": "lip",
        "translation": "嘴唇",
        "ipa": "/lɪp/"
      },
      {
        "word": "leg",
        "translation": "腿",
        "ipa": "/leɡ/"
      },
      {
        "word": "light",
        "translation": "光",
        "ipa": "/laɪt/"
      },
      {
        "word": "love",
        "translation": "爱",
        "ipa": "/lʌv/"
      },
      {
        "word": "lake",
        "translation": "湖",
        "ipa": "/leɪk/"
      },
      {
        "word": "school",
        "translation": "学校",
        "ipa": "/skuːl/"
      }
    ]
  },
  {
    "symbol": "/r/",
    "category": "辅音",
    "tip": "浊辅音。舌尖向上齿龈后部靠近，舌身略卷，声带振动；英式发音不要卷舌过度。",
    "examples": [
      {
        "word": "red",
        "translation": "红色",
        "ipa": "/red/"
      },
      {
        "word": "run",
        "translation": "跑",
        "ipa": "/rʌn/"
      },
      {
        "word": "rain",
        "translation": "雨",
        "ipa": "/reɪn/"
      },
      {
        "word": "road",
        "translation": "路",
        "ipa": "/rəʊd/"
      },
      {
        "word": "right",
        "translation": "右边的",
        "ipa": "/raɪt/"
      },
      {
        "word": "story",
        "translation": "故事",
        "ipa": "/ˈstɔːri/"
      }
    ]
  },
  {
    "symbol": "/j/",
    "category": "辅音",
    "tip": "浊辅音（半元音）。舌前部抬向硬腭，迅速滑向后面的元音，声带振动。",
    "examples": [
      {
        "word": "yes",
        "translation": "是的",
        "ipa": "/jes/"
      },
      {
        "word": "yellow",
        "translation": "黄色",
        "ipa": "/ˈjeləʊ/"
      },
      {
        "word": "year",
        "translation": "年",
        "ipa": "/jɪə/"
      },
      {
        "word": "young",
        "translation": "年轻的",
        "ipa": "/jʌŋ/"
      },
      {
        "word": "music",
        "translation": "音乐",
        "ipa": "/ˈmjuːzɪk/"
      },
      {
        "word": "university",
        "translation": "大学",
        "ipa": "/ˌjuːnɪˈvɜːsəti/"
      }
    ]
  },
  {
    "symbol": "/w/",
    "category": "辅音",
    "tip": "浊辅音（半元音）。双唇收圆，迅速滑向后面的元音，声带振动。",
    "examples": [
      {
        "word": "we",
        "translation": "我们",
        "ipa": "/wiː/"
      },
      {
        "word": "wet",
        "translation": "湿的",
        "ipa": "/wet/"
      },
      {
        "word": "water",
        "translation": "水",
        "ipa": "/ˈwɔːtə/"
      },
      {
        "word": "window",
        "translation": "窗户",
        "ipa": "/ˈwɪndəʊ/"
      },
      {
        "word": "work",
        "translation": "工作",
        "ipa": "/wɜːk/"
      },
      {
        "word": "swim",
        "translation": "游泳",
        "ipa": "/swɪm/"
      }
    ]
  }
];

const VOICELESS_CONSONANTS = new Set([
  "/p/",
  "/t/",
  "/k/",
  "/f/",
  "/θ/",
  "/s/",
  "/ʃ/",
  "/h/",
  "/tʃ/",
  "/tr/",
  "/ts/"
]);

const SONORANT_CONSONANTS = new Set(["/m/", "/n/", "/ŋ/", "/l/", "/r/", "/j/", "/w/"]);

const state = {
  phonemes: [],
  byId: new Map(),
  learned: new Set(),
  activeView: "phonemes",
  activeFilter: "all",
  activePhonemeId: null,
  dataReady: false,
  loadError: false,
  practice: {
    active: false,
    current: null,
    options: [],
    answered: false,
    correctCount: 0,
    questionIndex: 0,
  },
};

const els = {};
let toastTimer = null;
let toastHideTimer = null;
let storageWarningShown = false;
let lastFocusElement = null;

/* =========================================================
   通用小工具
   ========================================================= */

function byId(id) {
  return document.getElementById(id);
}

function makeElement(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function normalizeKey(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toArray(list) {
  return Array.prototype.slice.call(list || []);
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function replaceChildrenCompat(element) {
  clearElement(element);
  for (let index = 1; index < arguments.length; index += 1) {
    if (arguments[index]) {
      element.appendChild(arguments[index]);
    }
  }
}

function closestElement(target, selector) {
  if (!target) {
    return null;
  }
  if (typeof target.closest === "function") {
    return target.closest(selector);
  }

  let node = target;
  while (node && node.nodeType === 1) {
    if (typeof node.matches === "function" && node.matches(selector)) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function safeFilenameStem(value) {
  const raw = String(value);
  const normalized =
    typeof raw.normalize === "function" ? raw.normalize("NFKD") : raw;
  const stem = normalized
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return stem || "item";
}

function shuffle(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getTypeLabel(phoneme) {
  if (phoneme.type === "vowel") {
    return "元音";
  }
  return phoneme.subtype ? `辅音 · ${phoneme.subtype}` : "辅音";
}

/* =========================================================
   音频播放统一封装
   找不到 mp3 时给出「暂未添加音频」提示，不抛未处理异常。
   ========================================================= */

const AudioController = (() => {
  const audio = new Audio();
  audio.preload = "none";

  let generation = 0;
  let activeButton = null;

  function clearButtonState(button) {
    if (!button) {
      return;
    }
    button.classList.remove("is-loading", "is-playing");
    button.removeAttribute("aria-busy");
  }

  function clearActiveButton() {
    if (activeButton) {
      clearButtonState(activeButton);
      activeButton = null;
    }
  }

  function stopSpeech() {
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        // 浏览器不支持取消朗读时忽略。
      }
    }
  }

  function speakFallback(text) {
    if (
      !text ||
      !("speechSynthesis" in window) ||
      typeof window.SpeechSynthesisUtterance !== "function"
    ) {
      return false;
    }

    try {
      stopSpeech();
      const utterance = new window.SpeechSynthesisUtterance(String(text));
      utterance.lang = "en-GB";
      utterance.rate = 0.78;
      utterance.pitch = 1;

      const voices =
        typeof window.speechSynthesis.getVoices === "function"
          ? window.speechSynthesis.getVoices()
          : [];
      for (let index = 0; index < voices.length; index += 1) {
        if (/^en(-|_)/i.test(voices[index].lang)) {
          utterance.voice = voices[index];
          break;
        }
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      return false;
    }
  }

  function beginPlaybackAttempt() {
    generation += 1;
    stopSpeech();
    audio.onplaying = null;
    audio.onerror = null;
    audio.onended = null;
    audio.pause();
    audio.removeAttribute("src");
    try {
      audio.load();
    } catch (error) {
      // 某些旧浏览器不支持重新 load，忽略即可；下一次播放仍会设置新 src。
    }
    clearActiveButton();
    return generation;
  }

  function handleMissingAudio(fallbackText) {
    const spoke = speakFallback(fallbackText);
    if (spoke) {
      showToast(
        "暂未添加音频",
        `已使用浏览器语音临时朗读「${fallbackText}」。补充 phonemes/ 或 words/ 中的音频文件即可播放标准录音。`,
        5600,
      );
    } else {
      showToast(
        "暂未添加音频",
        "没有找到对应的音频文件，请检查 phonemes/ 或 words/ 目录。",
        5200,
      );
    }
  }

  function play(src, button = null, fallbackText = "") {
    const run = beginPlaybackAttempt();

    if (button) {
      activeButton = button;
      button.classList.add("is-loading");
      button.setAttribute("aria-busy", "true");
    }

    if (!src) {
      handleMissingAudio(fallbackText);
      clearActiveButton();
      return;
    }

    let settled = false;

    const succeed = () => {
      if (settled || run !== generation) {
        return;
      }
      settled = true;
      if (button) {
        button.classList.remove("is-loading");
        button.classList.add("is-playing");
        button.setAttribute("aria-busy", "false");
      }
    };

    const fail = () => {
      if (settled || run !== generation) {
        return;
      }
      settled = true;
      audio.onplaying = null;
      audio.onerror = null;
      clearActiveButton();
      handleMissingAudio(fallbackText);
    };

    audio.onplaying = succeed;
    audio.onerror = fail;
    audio.onended = () => {
      if (run !== generation) {
        return;
      }
      clearActiveButton();
    };

    try {
      audio.src = src;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(succeed).catch(fail);
      }
    } catch (error) {
      fail();
    }
  }

  function stop() {
    beginPlaybackAttempt();
  }

  return { play, stop };
})();

/* =========================================================
   初始化与事件绑定
   ========================================================= */

function init() {
  cacheElements();
  state.learned = loadLearnedFromStorage();
  bindEvents();
  switchView("phonemes", { scroll: false });
  updatePracticeAvailability();

  try {
    initializePhonemeData();
  } catch (error) {
    console.error("音标数据初始化失败：", error);
    state.dataReady = false;
    state.loadError = true;
    renderLoadError(error);
    updatePracticeAvailability();
    updateProgress();
  }
}

function cacheElements() {
  els.navLinks = toArray(document.querySelectorAll(".nav-link"));
  els.viewPanels = toArray(document.querySelectorAll("[data-view-panel]"));
  els.filterChips = toArray(document.querySelectorAll(".filter-chip"));
  els.filterCounts = toArray(document.querySelectorAll("[data-filter-count]"));
  els.brand = document.querySelector(".brand");
  els.grid = byId("phoneme-grid");
  els.phonemeCount = byId("phoneme-count");

  els.heroProgressValue = byId("hero-progress-value");
  els.heroProgressBar = byId("hero-progress-bar");
  els.heroProgressTrack = byId("hero-progress-track");
  els.heroLearnedCount = byId("hero-learned-count");
  els.heroTotalCount = byId("hero-total-count");

  els.practiceIdle = byId("practice-idle");
  els.practiceSession = byId("practice-session");
  els.startPractice = byId("start-practice");
  els.practiceTotal = byId("practice-total");
  els.questionNumber = byId("question-number");
  els.practiceScore = byId("practice-score");
  els.playQuestion = byId("play-question");
  els.practiceOptions = byId("practice-options");
  els.practiceFeedback = byId("practice-feedback");
  els.restartPractice = byId("restart-practice");
  els.nextQuestion = byId("next-question");

  els.progressRing = byId("progress-ring");
  els.progressPercent = byId("progress-percent");
  els.progressLearned = byId("progress-learned");
  els.progressTotal = byId("progress-total");
  els.progressMessage = byId("progress-message");
  els.progressTrackLarge = byId("progress-track-large");
  els.progressBar = byId("progress-bar");
  els.resetProgress = byId("reset-progress");
  els.learnedList = byId("learned-list");
  els.learnedListCount = byId("learned-list-count");

  els.modal = byId("phoneme-modal");
  els.closeDialog = byId("close-dialog");
  els.dialogBadges = byId("dialog-badges");
  els.dialogSymbol = byId("dialog-symbol");
  els.dialogSubtitle = byId("dialog-subtitle");
  els.dialogDesc = byId("dialog-desc");
  els.dialogMistake = byId("dialog-mistake");
  els.dialogExamples = byId("dialog-examples");
  els.dialogMouthSvg = byId("dialog-mouth-svg");
  els.dialogContent = document.querySelector(".dialog-content");
  els.playPhoneme = byId("play-phoneme");
  els.toggleLearned = byId("toggle-learned");
  els.toggleLearnedLabel = byId("toggle-learned-label");

  els.toast = byId("toast");
  els.toastTitle = byId("toast-title");
  els.toastMessage = byId("toast-message");
  els.toastClose = byId("toast-close");
}

function bindEvents() {
  els.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      navigateTo(button.dataset.viewTarget);
    });
  });

  if (els.brand) {
    els.brand.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo("phonemes");
    });
  }

  els.filterChips.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  els.grid.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const card = closestElement(event.target, ".phoneme-card");
    if (card && card.dataset.phonemeId) {
      openPhonemeDetail(card.dataset.phonemeId);
    }
  });

  els.startPractice.addEventListener("click", startPractice);
  els.restartPractice.addEventListener("click", startPractice);
  els.nextQuestion.addEventListener("click", () => {
    if (state.practice.active) {
      renderPracticeQuestion({ focusPlayButton: true });
    }
  });
  els.playQuestion.addEventListener("click", playPracticeAudio);

  els.closeDialog.addEventListener("click", closePhonemeDetail);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) {
      closePhonemeDetail();
    }
  });
  document.addEventListener("keydown", handleGlobalKeydown);

  els.playPhoneme.addEventListener("click", () => {
    const phoneme = state.byId.get(state.activePhonemeId);
    if (phoneme) {
      const example = phoneme.examples[0];
      AudioController.play(
        phoneme.audioPath,
        els.playPhoneme,
        example ? example.word : "",
      );
    }
  });

  els.toggleLearned.addEventListener("click", toggleActivePhonemeLearned);
  els.resetProgress.addEventListener("click", resetProgress);

  els.toastClose.addEventListener("click", hideToast);

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const viewJump = closestElement(event.target, "[data-view-jump]");
    if (viewJump) {
      event.preventDefault();
      navigateTo(viewJump.dataset.viewJump);
    }

    const filterJump = closestElement(event.target, "[data-filter-jump]");
    if (filterJump) {
      setFilter(filterJump.dataset.filterJump);
    }
  });

  window.addEventListener("storage", handleStorageChange);
}

/* =========================================================
   视图切换
   ========================================================= */

function navigateTo(viewName) {
  if (VIEW_NAMES.indexOf(viewName) === -1) {
    return;
  }
  switchView(viewName);
}

function switchView(viewName, options) {
  const scroll = !options || options.scroll !== false;
  if (VIEW_NAMES.indexOf(viewName) === -1) {
    viewName = "phonemes";
  }

  const changed = state.activeView !== viewName;
  state.activeView = viewName;

  els.viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== viewName;
  });

  els.navLinks.forEach((button) => {
    const isActive = button.dataset.viewTarget === viewName;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  document.title = VIEW_TITLES[viewName];

  if (changed) {
    AudioController.stop();
  }

  if (viewName === "progress") {
    updateProgress();
  }

  if (scroll) {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }
}

/* =========================================================
   数据加载
   ========================================================= */

function padNumber(number) {
  return number < 10 ? `0${number}` : String(number);
}

function buildMistake(type, subtype, symbol) {
  if (type === "vowel") {
    return "注意保持口型和舌位稳定，不要用汉语近似音完全替代这个元音。";
  }
  if (SONORANT_CONSONANTS.has(symbol)) {
    return "这是浊辅音，发音时声带要持续振动，同时保持气流通道稳定。";
  }
  if (subtype === "清辅音") {
    return "发清辅音时声带不振动，注意不要误读成同部位的浊辅音。";
  }
  return "发浊辅音时声带需要振动，注意不要误读成同部位的清辅音。";
}

function buildRuntimePhonemes() {
  let vowelCount = 0;
  let consonantCount = 0;

  return phonemeData
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const symbol = normalizeKey(item.symbol);
      const category = normalizeKey(item.category);
      const type = category === "元音" ? "vowel" : category === "辅音" ? "consonant" : "";

      if (!symbol || !type) {
        console.warn("已跳过格式不完整的音标数据：", item);
        return null;
      }

      let id = "";
      if (type === "vowel") {
        vowelCount += 1;
        id = `v${padNumber(vowelCount)}`;
      } else {
        consonantCount += 1;
        id = `c${padNumber(consonantCount)}`;
      }

      const subtype =
        type === "vowel"
          ? ""
          : VOICELESS_CONSONANTS.has(symbol)
            ? "清辅音"
            : "浊辅音";

      const examples = (Array.isArray(item.examples) ? item.examples : [])
        .map((example) => {
          if (!example || typeof example !== "object") {
            return null;
          }
          const word = normalizeKey(example.word);
          if (!word) {
            return null;
          }
          return {
            word,
            translation: normalizeKey(example.translation),
            ipa: normalizeKey(example.ipa),
          };
        })
        .filter(Boolean);

      const exampleAudios = examples.map(
        (example) => `words/${safeFilenameStem(example.word)}.wav`,
      );

      return {
        id,
        symbol,
        type,
        subtype,
        category,
        desc: normalizeKey(item.tip) || "暂无发音要点。",
        mistake: buildMistake(type, subtype, symbol),
        examples,
        audioPath: `phonemes/${id}.wav`,
        exampleAudios,
        mouthSvg: "inline",
      };
    })
    .filter(Boolean);
}

function initializePhonemeData() {
  const normalized = buildRuntimePhonemes();
  if (!normalized.length) {
    throw new Error("phonemeData 中没有可用的音标数据");
  }

  state.phonemes = normalized;
  state.byId = new Map(normalized.map((phoneme) => [phoneme.id, phoneme]));
  state.dataReady = true;
  state.loadError = false;

  pruneLearnedIds();
  updateFilterCounts();
  renderGrid();
  updatePracticeAvailability();
  updateProgress();
  updateDialogLearnedState();
}

function pruneLearnedIds() {
  const validIds = new Set(state.phonemes.map((phoneme) => phoneme.id));
  let changed = false;
  state.learned.forEach((id) => {
    if (!validIds.has(id)) {
      state.learned.delete(id);
      changed = true;
    }
  });
  if (changed) {
    saveLearnedToStorage();
  }
}

function renderLoadError(error) {
  els.grid.setAttribute("aria-busy", "false");
  els.phonemeCount.textContent = "音标加载失败";
  els.filterCounts.forEach((counter) => {
    counter.textContent = "—";
  });

  const wrapper = makeElement("div", "empty-state");
  const icon = makeElement("span", "empty-state-icon", "!");
  icon.setAttribute("aria-hidden", "true");
  const heading = makeElement("h3", "", "音标数据没有成功显示");
  const detail = makeElement("p", "empty-state-detail");
  const reason = error && error.message ? `（${error.message}）` : "";
  detail.textContent = `音标数据初始化失败${reason}。请刷新页面重试；如果仍然失败，请检查 app.js 顶部的 phonemeData 数组是否完整。`;

  const retry = makeElement("button", "button button-primary", "刷新页面");
  retry.type = "button";
  retry.addEventListener("click", () => window.location.reload());

  wrapper.append(icon, heading, detail, retry);
  replaceChildrenCompat(els.grid, wrapper);
}

function updateFilterCounts() {
  const counts = {};
  Object.keys(FILTERS).forEach((key) => {
    counts[key] = state.phonemes.filter(FILTERS[key]).length;
  });

  els.filterCounts.forEach((counter) => {
    const key = counter.dataset.filterCount;
    counter.textContent = Object.prototype.hasOwnProperty.call(counts, key)
      ? String(counts[key])
      : "—";
  });
}

/* =========================================================
   音标表
   ========================================================= */

function setFilter(filterName) {
  if (!Object.prototype.hasOwnProperty.call(FILTERS, filterName)) {
    return;
  }

  state.activeFilter = filterName;
  els.filterChips.forEach((button) => {
    const isActive = button.dataset.filter === filterName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (state.dataReady) {
    renderGrid();
  }
}

function renderGrid() {
  if (!state.dataReady) {
    return;
  }

  const predicate = FILTERS[state.activeFilter] || FILTERS.all;
  const visiblePhonemes = state.phonemes.filter(predicate);
  const fragment = document.createDocumentFragment();

  if (!visiblePhonemes.length) {
    const empty = makeElement("div", "empty-state");
    const icon = makeElement("span", "empty-state-icon", "ə");
    icon.setAttribute("aria-hidden", "true");
    const heading = makeElement("h3", "", "这个分类还没有音标");
    const copy = makeElement("p", "", "目前收录的清辅音和浊辅音有限，先看看全部音标吧。");
    const resetButton = makeElement("button", "button button-secondary", "查看全部");
    resetButton.type = "button";
    resetButton.dataset.filterJump = "all";
    empty.append(icon, heading, copy, resetButton);
    fragment.append(empty);
  } else {
    visiblePhonemes.forEach((phoneme) => {
      fragment.append(createPhonemeCard(phoneme));
    });
  }

  replaceChildrenCompat(els.grid, fragment);
  els.grid.setAttribute("aria-busy", "false");
  els.phonemeCount.textContent = `共 ${visiblePhonemes.length} 个音标`;
}

function createPhonemeCard(phoneme) {
  const learned = state.learned.has(phoneme.id);
  const card = makeElement("button", `phoneme-card${learned ? " is-learned" : ""}`);
  card.type = "button";
  card.dataset.phonemeId = phoneme.id;
  card.setAttribute("aria-label", getCardAriaLabel(phoneme, learned));

  const top = makeElement("span", "card-top");
  const badge = makeElement(
    "span",
    `type-badge ${phoneme.type === "vowel" ? "type-badge--vowel" : "type-badge--consonant"}`,
    phoneme.type === "vowel" ? "元音" : phoneme.subtype || "辅音",
  );
  const status = makeElement("span", "card-status");
  setCardStatus(status, learned);
  top.append(badge, status);

  const symbolRow = makeElement("span", "card-symbol-row");
  const symbol = makeElement("span", "card-symbol", phoneme.symbol);
  const mouth = makeElement("span", "card-mouth");
  mouth.setAttribute("aria-hidden", "true");
  mouth.innerHTML = buildInlineMouthSvg(phoneme);
  symbolRow.append(symbol, mouth);

  const description = makeElement("span", "card-desc", phoneme.desc);

  const examples = makeElement("span", "card-examples");
  phoneme.examples.slice(0, 2).forEach((example) => {
    examples.append(makeElement("span", "card-example", example.word));
  });

  const footer = makeElement("span", "card-footer");
  footer.append(
    makeElement("span", "", "查看发音要点"),
    makeElement("span", "card-arrow", "↗"),
  );
  footer.lastElementChild.setAttribute("aria-hidden", "true");

  card.append(top, symbolRow, description, examples, footer);
  return card;
}

function setCardStatus(container, learned) {
  clearElement(container);

  if (learned) {
    const check = makeElement("span", "status-check", "✓");
    check.setAttribute("aria-hidden", "true");
    container.append(check, makeElement("span", "", "已学"));
  } else {
    const dot = makeElement("span", "status-dot");
    dot.setAttribute("aria-hidden", "true");
    container.append(dot, makeElement("span", "", "未学"));
  }
}

function getCardAriaLabel(phoneme, learned) {
  return `音标 ${phoneme.symbol}，${getTypeLabel(phoneme)}，${
    learned ? "已学" : "未学"
  }。点击查看发音要点和示例单词。`;
}

function refreshCardStates() {
  toArray(els.grid.querySelectorAll(".phoneme-card")).forEach((card) => {
    const phoneme = state.byId.get(card.dataset.phonemeId);
    if (!phoneme) {
      return;
    }

    const learned = state.learned.has(phoneme.id);
    card.classList.toggle("is-learned", learned);
    card.setAttribute("aria-label", getCardAriaLabel(phoneme, learned));
    const status = card.querySelector(".card-status");
    if (status) {
      setCardStatus(status, learned);
    }
  });
}

/* =========================================================
   详情弹窗
   ========================================================= */

function openPhonemeDetail(phonemeId) {
  const phoneme = state.byId.get(phonemeId);
  if (!phoneme) {
    return;
  }

  lastFocusElement = document.activeElement;
  state.activePhonemeId = phoneme.id;
  AudioController.stop();

  els.dialogSymbol.textContent = phoneme.symbol;
  els.dialogSubtitle.textContent = getTypeLabel(phoneme);
  els.dialogDesc.textContent = phoneme.desc;
  els.dialogMistake.textContent = phoneme.mistake;
  renderDialogBadges(phoneme);
  renderDialogExamples(phoneme);
  updateDialogLearnedState();
  renderInlineMouth(phoneme);
  updateDialogAudioButton();

  if (els.dialogContent) {
    els.dialogContent.scrollTop = 0;
  }

  els.modal.hidden = false;
  void els.modal.offsetWidth;
  els.modal.classList.add("is-open");
  document.documentElement.classList.add("is-dialog-open");
  els.closeDialog.focus({ preventScroll: true });
}

function closePhonemeDetail() {
  if (els.modal.hidden) {
    return;
  }

  els.modal.classList.remove("is-open");
  els.modal.hidden = true;
  document.documentElement.classList.remove("is-dialog-open");
  state.activePhonemeId = null;
  AudioController.stop();

  if (lastFocusElement && document.contains(lastFocusElement)) {
    lastFocusElement.focus({ preventScroll: true });
  }
  lastFocusElement = null;
}

function handleGlobalKeydown(event) {
  if (els.modal.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closePhonemeDetail();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = toArray(
    els.modal.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null);

  if (!focusable.length) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && (document.activeElement === first || !els.modal.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function renderDialogBadges(phoneme) {
  clearElement(els.dialogBadges);

  const mainBadge = makeElement(
    "span",
    `type-badge ${phoneme.type === "vowel" ? "type-badge--vowel" : "type-badge--consonant"}`,
    phoneme.type === "vowel" ? "元音" : "辅音",
  );
  els.dialogBadges.append(mainBadge);

  if (phoneme.type === "consonant" && phoneme.subtype) {
    els.dialogBadges.append(
      makeElement("span", "type-badge type-badge--neutral", phoneme.subtype),
    );
  }
}

function renderDialogExamples(phoneme) {
  clearElement(els.dialogExamples);

  if (!phoneme.examples.length) {
    els.dialogExamples.append(makeElement("p", "example-empty", "暂无示例单词。"));
    return;
  }

  phoneme.examples.forEach((example, index) => {
    const audioSrc = phoneme.exampleAudios[index];
    const button = makeElement("button", "example-btn");
    button.type = "button";
    button.setAttribute(
      "aria-label",
      `播放单词 ${example.word} 的发音。中文：${example.translation}。音标：${example.ipa}。`,
    );
    button.dataset.audioSrc = audioSrc || "";

    const copy = makeElement("span", "example-copy");
    copy.append(
      makeElement("span", "example-word", example.word),
      makeElement("span", "example-ipa", example.ipa || ""),
      makeElement("span", "example-translation", example.translation || ""),
    );

    const playIcon = makeElement("span", "example-play");
    playIcon.setAttribute("aria-hidden", "true");
    playIcon.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"></path><path d="M15 9a4.2 4.2 0 0 1 0 6"></path></svg>';

    button.append(copy, playIcon);
    button.addEventListener("click", () => {
      AudioController.play(audioSrc, button, example.word);
    });
    els.dialogExamples.append(button);
  });
}

const VOWEL_MOUTH_SPECS = {
  "/iː/": { open: 0.28, width: 1.03, round: 0.04, tongueTop: -0.66, tongueShift: -0.18, group: "vowel" },
  "/ɪ/": { open: 0.42, width: 0.96, round: 0.03, tongueTop: -0.43, tongueShift: -0.1, group: "vowel" },
  "/e/": { open: 0.52, width: 0.94, round: 0.02, tongueTop: -0.24, tongueShift: -0.08, group: "vowel" },
  "/æ/": { open: 0.86, width: 1.0, round: 0.0, tongueTop: 0.35, tongueShift: -0.05, group: "vowel" },
  "/ɑː/": { open: 0.94, width: 1.02, round: 0.1, tongueTop: 0.52, tongueShift: 0.1, group: "vowel" },
  "/ɒ/": { open: 0.8, width: 0.77, round: 0.76, tongueTop: 0.42, tongueShift: 0.18, group: "vowel" },
  "/ɔː/": { open: 0.66, width: 0.71, round: 0.9, tongueTop: 0.16, tongueShift: 0.25, group: "vowel" },
  "/ʊ/": { open: 0.4, width: 0.69, round: 0.88, tongueTop: -0.25, tongueShift: 0.2, group: "vowel" },
  "/uː/": { open: 0.27, width: 0.63, round: 1.0, tongueTop: -0.55, tongueShift: 0.25, group: "vowel" },
  "/ʌ/": { open: 0.58, width: 0.94, round: 0.03, tongueTop: 0.04, tongueShift: 0.02, group: "vowel" },
  "/ɜː/": { open: 0.45, width: 0.9, round: 0.08, tongueTop: -0.05, tongueShift: 0.02, group: "vowel" },
  "/ə/": { open: 0.34, width: 0.9, round: 0.05, tongueTop: 0.0, tongueShift: 0.0, group: "vowel" },
  "/eɪ/": { open: 0.55, width: 0.95, round: 0.06, tongueTop: -0.1, tongueShift: -0.1, slide: "up-left", group: "diphthong" },
  "/aɪ/": { open: 0.8, width: 1.0, round: 0.02, tongueTop: 0.4, tongueShift: -0.1, slide: "up-left", group: "diphthong" },
  "/ɔɪ/": { open: 0.62, width: 0.78, round: 0.7, tongueTop: 0.1, tongueShift: 0.2, slide: "up-left", group: "diphthong" },
  "/aʊ/": { open: 0.85, width: 0.95, round: 0.1, tongueTop: 0.45, tongueShift: 0.05, slide: "up-right", group: "diphthong" },
  "/əʊ/": { open: 0.5, width: 0.86, round: 0.3, tongueTop: 0.0, tongueShift: 0.1, slide: "up-right", group: "diphthong" },
  "/ɪə/": { open: 0.45, width: 0.92, round: 0.1, tongueTop: -0.4, tongueShift: -0.1, slide: "down-right", group: "diphthong" },
  "/eə/": { open: 0.55, width: 0.92, round: 0.1, tongueTop: -0.15, tongueShift: -0.05, slide: "down-right", group: "diphthong" },
  "/ʊə/": { open: 0.45, width: 0.7, round: 0.8, tongueTop: -0.2, tongueShift: 0.2, slide: "down-right", group: "diphthong" },
};

const CONSONANT_MOUTH_SPECS = {
  "/p/": { open: 0.1, width: 0.9, round: 0.28, tongueTop: null, burst: true, group: "stop" },
  "/b/": { open: 0.1, width: 0.9, round: 0.28, tongueTop: null, burst: true, group: "stop" },
  "/t/": { open: 0.36, width: 0.9, round: 0.03, tongueTop: -0.5, teeth: true, burst: true, group: "stop" },
  "/d/": { open: 0.36, width: 0.9, round: 0.03, tongueTop: -0.5, teeth: true, burst: true, group: "stop" },
  "/k/": { open: 0.58, width: 0.82, round: 0.03, tongueTop: -0.28, tongueShift: 0.38, burst: true, group: "stop" },
  "/ɡ/": { open: 0.58, width: 0.82, round: 0.03, tongueTop: -0.28, tongueShift: 0.38, burst: true, group: "stop" },
  "/f/": { open: 0.32, width: 0.95, round: 0.05, tongueTop: null, labiodental: true, air: true, group: "fricative" },
  "/v/": { open: 0.32, width: 0.95, round: 0.05, tongueTop: null, labiodental: true, air: true, group: "fricative" },
  "/θ/": { open: 0.42, width: 0.9, round: 0.01, dental: true, teeth: true, air: true, group: "fricative" },
  "/ð/": { open: 0.42, width: 0.9, round: 0.01, dental: true, teeth: true, air: true, group: "fricative" },
  "/s/": { open: 0.26, width: 0.96, round: 0.01, tongueTop: -0.48, teeth: true, air: true, group: "fricative" },
  "/z/": { open: 0.26, width: 0.96, round: 0.01, tongueTop: -0.48, teeth: true, air: true, group: "fricative" },
  "/ʃ/": { open: 0.34, width: 0.72, round: 0.82, tongueTop: -0.22, tongueShift: 0.26, air: true, group: "fricative" },
  "/ʒ/": { open: 0.34, width: 0.72, round: 0.82, tongueTop: -0.22, tongueShift: 0.26, air: true, group: "fricative" },
  "/h/": { open: 0.66, width: 0.9, round: 0.02, tongueTop: 0.2, air: true, group: "fricative" },
  "/tʃ/": { open: 0.32, width: 0.76, round: 0.67, tongueTop: -0.28, tongueShift: 0.22, teeth: true, air: true, burst: true, group: "affricate" },
  "/dʒ/": { open: 0.32, width: 0.76, round: 0.67, tongueTop: -0.28, tongueShift: 0.22, teeth: true, air: true, burst: true, group: "affricate" },
  "/tr/": { open: 0.36, width: 0.8, round: 0.6, tongueTop: -0.28, tongueShift: 0.25, teeth: true, air: true, burst: true, group: "affricate" },
  "/dr/": { open: 0.36, width: 0.8, round: 0.6, tongueTop: -0.28, tongueShift: 0.25, teeth: true, air: true, burst: true, group: "affricate" },
  "/ts/": { open: 0.27, width: 0.9, round: 0.1, tongueTop: -0.44, teeth: true, air: true, burst: true, group: "affricate" },
  "/dz/": { open: 0.27, width: 0.9, round: 0.1, tongueTop: -0.44, teeth: true, air: true, burst: true, group: "affricate" },
  "/m/": { open: 0.08, width: 0.9, round: 0.34, tongueTop: null, nasal: true, group: "nasal" },
  "/n/": { open: 0.36, width: 0.9, round: 0.04, tongueTop: -0.5, teeth: true, nasal: true, group: "nasal" },
  "/ŋ/": { open: 0.5, width: 0.8, round: 0.03, tongueTop: -0.18, tongueShift: 0.36, nasal: true, group: "nasal" },
  "/l/": { open: 0.36, width: 0.86, round: 0.08, tongueTop: -0.48, teeth: true, lateral: true, group: "liquid" },
  "/r/": { open: 0.3, width: 0.74, round: 0.55, tongueTop: -0.25, tongueShift: 0.2, curl: true, group: "liquid" },
  "/j/": { open: 0.28, width: 0.95, round: 0.04, tongueTop: -0.56, tongueShift: -0.1, slide: "up-left", group: "glide" },
  "/w/": { open: 0.32, width: 0.68, round: 0.95, tongueTop: -0.35, tongueShift: 0.2, slide: "up-right", group: "glide" },
};

function getMouthSpec(phoneme) {
  if (phoneme.type === "vowel") {
    return (
      VOWEL_MOUTH_SPECS[phoneme.symbol] || {
        open: 0.5,
        width: 0.95,
        round: 0.1,
        tongueTop: 0,
        tongueShift: 0,
        group: "vowel",
      }
    );
  }

  const spec =
    CONSONANT_MOUTH_SPECS[phoneme.symbol] || {
      open: 0.35,
      width: 0.9,
      round: 0.1,
      tongueTop: 0,
      group: "consonant",
    };

  return Object.assign({}, spec, {
    voiced: !VOICELESS_CONSONANTS.has(phoneme.symbol),
  });
}

function buildInlineMouthSvg(phoneme) {
  const spec = getMouthSpec(phoneme);
  const cx = 60;
  const cy = 39;
  const lipRx = 41 * spec.width;
  const lipRy = 14 + 15 * spec.open + 4 * (spec.round || 0);
  const cavityRx = lipRx * (0.66 - 0.14 * (spec.round || 0));
  const cavityRy = 5 + 16 * spec.open;
  const round = spec.round || 0;
  const teeth = spec.teeth;
  const air = spec.air;
  const voice = spec.voiced;
  const parts = [];

  parts.push('<circle class="mouth-halo" cx="60" cy="38" r="35"></circle>');

  if (round > 0.55) {
    parts.push(
      `<ellipse class="mouth-lip-ring" cx="${cx}" cy="${cy}" rx="${(
        lipRx + 7
      ).toFixed(1)}" ry="${(lipRy + 5).toFixed(1)}"></ellipse>`,
    );
  }

  parts.push(
    `<ellipse class="mouth-lip" cx="${cx}" cy="${cy}" rx="${lipRx.toFixed(
      1,
    )}" ry="${lipRy.toFixed(1)}"></ellipse>`,
  );

  parts.push(
    `<ellipse class="mouth-cavity" cx="${cx}" cy="${cy}" rx="${cavityRx.toFixed(
      1,
    )}" ry="${cavityRy.toFixed(1)}"></ellipse>`,
  );

  parts.push(
    `<path class="mouth-highlight" d="M ${(cx - lipRx * 0.72).toFixed(
      1,
    )} ${(cy - lipRy * 0.64).toFixed(1)} C ${(cx - lipRx * 0.32).toFixed(
      1,
    )} ${(cy - lipRy * 0.84).toFixed(1)}, ${(cx + lipRx * 0.32).toFixed(
      1,
    )} ${(cy - lipRy * 0.84).toFixed(1)}, ${(cx + lipRx * 0.72).toFixed(
      1,
    )} ${(cy - lipRy * 0.64).toFixed(1)}"></path>`,
  );

  if (spec.labiodental) {
    parts.push(
      `<rect class="mouth-teeth" x="${(cx - cavityRx * 0.72).toFixed(
        1,
      )}" y="${(cy - cavityRy - 1).toFixed(1)}" width="${(
        cavityRx * 1.44
      ).toFixed(1)}" height="6" rx="2"></rect>`,
    );
    parts.push(
      `<path class="mouth-detail" d="M ${(cx - cavityRx * 0.55).toFixed(
        1,
      )} ${(cy + cavityRy * 0.58).toFixed(1)} C ${(cx - cavityRx * 0.1).toFixed(
        1,
      )} ${(cy + cavityRy * 0.25).toFixed(1)}, ${(cx + cavityRx * 0.1).toFixed(
        1,
      )} ${(cy + cavityRy * 0.25).toFixed(1)}, ${(cx + cavityRx * 0.55).toFixed(
        1,
      )} ${(cy + cavityRy * 0.58).toFixed(1)}"></path>`,
    );
  }

  if (spec.dental) {
    parts.push(
      `<rect class="mouth-teeth" x="${(cx - cavityRx * 0.75).toFixed(
        1,
      )}" y="${(cy - cavityRy - 1).toFixed(1)}" width="${(
        cavityRx * 1.5
      ).toFixed(1)}" height="5" rx="2"></rect>`,
    );
    parts.push(
      `<rect class="mouth-teeth" x="${(cx - cavityRx * 0.72).toFixed(
        1,
      )}" y="${(cy + cavityRy - 5).toFixed(1)}" width="${(
        cavityRx * 1.44
      ).toFixed(1)}" height="5" rx="2"></rect>`,
    );
    parts.push(
      `<path class="mouth-tongue" d="M ${(cx - 14).toFixed(1)} ${(
        cy - 12
      ).toFixed(1)} C ${(cx - 5).toFixed(1)} ${(cy - 23).toFixed(1)}, ${(
        cx + 8
      ).toFixed(1)} ${(cy - 22).toFixed(1)}, ${(cx + 15).toFixed(1)} ${(
        cy - 9
      ).toFixed(1)} C ${(cx + 21).toFixed(1)} ${(cy + 10).toFixed(1)}, ${(
        cx + 8
      ).toFixed(1)} ${(cy + 22).toFixed(1)}, ${cx.toFixed(1)} ${(
        cy + 25
      ).toFixed(1)} C ${(cx - 12).toFixed(1)} ${(cy + 22).toFixed(1)}, ${(
        cx - 22
      ).toFixed(1)} ${(cy + 9).toFixed(1)}, ${(cx - 14).toFixed(1)} ${(
        cy - 12
      ).toFixed(1)} Z"></path>`,
    );
    parts.push(
      `<path class="mouth-highlight" d="M ${(cx - 10).toFixed(1)} ${(
        cy - 2
      ).toFixed(1)} C ${(cx - 3).toFixed(1)} ${(cy - 8).toFixed(1)}, ${(
        cx + 5
      ).toFixed(1)} ${(cy - 8).toFixed(1)}, ${(cx + 10).toFixed(1)} ${(
        cy - 2
      ).toFixed(1)}"></path>`,
    );
  } else if (spec.tongueTop !== null && spec.tongueTop !== undefined) {
    const top = cy + cavityRy * spec.tongueTop;
    const shift = cavityRx * (spec.tongueShift || 0);
    const half = cavityRx * 0.82;
    parts.push(
      `<path class="mouth-tongue" d="M ${(cx - half).toFixed(1)} ${(
        cy + cavityRy * 0.9
      ).toFixed(1)} C ${(cx - half * 0.68 + shift).toFixed(1)} ${(
        top + cavityRy * 0.35
      ).toFixed(1)}, ${(cx - half * 0.28 + shift).toFixed(1)} ${top.toFixed(
        1,
      )}, ${(cx + shift).toFixed(1)} ${top.toFixed(1)} C ${(
        cx + half * 0.42 +
        shift
      ).toFixed(1)} ${top.toFixed(1)}, ${(cx + half * 0.8 + shift).toFixed(
        1,
      )} ${(cy + cavityRy * 0.8).toFixed(1)}, ${(cx + half).toFixed(1)} ${(
        cy + cavityRy * 0.9
      ).toFixed(1)} Z"></path>`,
    );
    parts.push(
      `<path class="mouth-highlight" d="M ${(cx - half * 0.55).toFixed(1)} ${(
        top + 4
      ).toFixed(1)} C ${(cx - half * 0.2).toFixed(1)} ${(top - 2).toFixed(
        1,
      )}, ${(cx + half * 0.25).toFixed(1)} ${(top - 2).toFixed(1)}, ${(
        cx + half * 0.58
      ).toFixed(1)} ${(top + 4).toFixed(1)}"></path>`,
    );

    if (spec.curl) {
      parts.push(
        `<path class="mouth-detail" d="M ${(cx - 6).toFixed(1)} ${(
          top - 1
        ).toFixed(1)} C ${(cx + 1).toFixed(1)} ${(top - 7).toFixed(1)}, ${(
          cx + 12
        ).toFixed(1)} ${(top - 5).toFixed(1)}, ${(cx + 13).toFixed(1)} ${(
          top + 3
        ).toFixed(1)}"></path>`,
      );
    }
  }

  if (teeth && !spec.dental) {
    parts.push(
      `<rect class="mouth-teeth" x="${(cx - cavityRx * 0.76).toFixed(
        1,
      )}" y="${(cy - cavityRy - 1).toFixed(1)}" width="${(
        cavityRx * 1.52
      ).toFixed(1)}" height="5" rx="2"></rect>`,
    );
  }

  if (air) {
    const startX = Math.min(cx + lipRx + 1, 107);
    const rows = [cy - 13, cy, cy + 13];
    for (let index = 0; index < rows.length; index += 1) {
      const endX = 117;
      const endY = rows[index] - 3;
      parts.push(
        `<path class="mouth-air" d="M ${startX.toFixed(1)} ${rows[
          index
        ].toFixed(1)} C ${(startX + 7).toFixed(1)} ${(rows[index] - 4).toFixed(
          1,
        )}, ${(endX - 6).toFixed(1)} ${(endY + 4).toFixed(1)}, ${endX.toFixed(
          1,
        )} ${endY.toFixed(1)}"></path>`,
      );
      parts.push(
        `<path class="mouth-air-head" d="M ${(endX - 1).toFixed(1)} ${(
          endY - 3.4
        ).toFixed(1)} L ${(endX - 6).toFixed(1)} ${(endY - 1.8).toFixed(
          1,
        )} L ${(endX - 3).toFixed(1)} ${(endY + 2.5).toFixed(1)} Z"></path>`,
      );
    }
  }

  if (spec.burst) {
    const burstX = Math.min(cx + lipRx + 8, 108);
    parts.push(
      `<path class="mouth-burst" d="M ${burstX.toFixed(1)} ${(
        cy - 9
      ).toFixed(1)} L ${(burstX + 7).toFixed(1)} ${(cy - 14).toFixed(
        1,
      )} M ${(burstX + 2).toFixed(1)} ${(cy - 2).toFixed(1)} L ${(
        burstX + 10
      ).toFixed(1)} ${(cy - 3).toFixed(1)} M ${burstX.toFixed(1)} ${(
        cy + 6
      ).toFixed(1)} L ${(burstX + 7).toFixed(1)} ${(cy + 11).toFixed(1)}"></path>`,
    );
  }

  if (spec.nasal) {
    parts.push(
      `<path class="mouth-nasal" d="M 80 14 C 84 9, 89 19, 93 14 M 86 9 C 90 4, 95 14, 99 9"></path>`,
    );
  }

  if (spec.lateral) {
    parts.push(
      `<path class="mouth-lateral" d="M 17 31 C 10 34, 10 43, 17 46 M 103 31 C 110 34, 110 43, 103 46"></path>`,
    );
  }

  if (spec.slide) {
    const leftToRight = spec.slide !== "up-left";
    const path = leftToRight
      ? `M 43 20 C 55 10, 72 10, 85 19`
      : `M 77 19 C 64 10, 50 10, 38 20`;
    const endX = leftToRight ? 88 : 35;
    const endY = leftToRight ? 21 : 21;
    const head = leftToRight
      ? `M ${endX - 7} ${endY - 4} L ${endX + 1} ${endY - 1} L ${endX - 4} ${endY + 4} Z`
      : `M ${endX + 7} ${endY - 4} L ${endX - 1} ${endY - 1} L ${endX + 4} ${endY + 4} Z`;
    parts.push(`<path class="mouth-slide" d="${path}"></path>`);
    parts.push(`<path class="mouth-slide-head" d="${head}"></path>`);
  }

  if (voice) {
    parts.push(
      `<path class="mouth-voice" d="M 50 66 C 54 62, 54 70, 58 66 M 58 64 C 63 59, 63 71, 68 66"></path>`,
    );
  }

  return `
    <svg class="mouth-sketch mouth-sketch--${spec.group || "consonant"}" viewBox="0 0 120 76" aria-hidden="true" focusable="false">
      ${parts.join("")}
    </svg>
  `;
}

function renderInlineMouth(phoneme) {
  els.dialogMouthSvg.innerHTML = buildInlineMouthSvg(phoneme);
  els.dialogMouthSvg.setAttribute(
    "aria-label",
    `${phoneme.symbol} 的内联口型示意图。${phoneme.desc}`,
  );
}

function updateDialogAudioButton() {
  els.playPhoneme.disabled = !state.activePhonemeId;
}

function updateDialogLearnedState() {
  const phoneme = state.byId.get(state.activePhonemeId);
  if (!phoneme) {
    return;
  }

  const learned = state.learned.has(phoneme.id);
  els.toggleLearned.setAttribute("aria-pressed", String(learned));
  els.toggleLearnedLabel.textContent = learned ? "已学会 · 点击取消" : "标记为已学";
}

function toggleActivePhonemeLearned() {
  const phoneme = state.byId.get(state.activePhonemeId);
  if (!phoneme) {
    return;
  }

  const wasLearned = state.learned.has(phoneme.id);
  if (wasLearned) {
    state.learned.delete(phoneme.id);
  } else {
    state.learned.add(phoneme.id);
  }

  saveLearnedToStorage();
  refreshCardStates();
  updateProgress();
  updateDialogLearnedState();

  showToast(
    wasLearned ? "已取消已学标记" : "已标记为已学",
    wasLearned
      ? `${phoneme.symbol} 已从已学列表移出。`
      : `${phoneme.symbol} 已加入已学列表，继续保持。`,
    3200,
  );
}

/* =========================================================
   练习
   ========================================================= */

function startPractice() {
  if (!state.dataReady || !state.phonemes.length) {
    showToast("题库还没准备好", "请先确认音标数据加载成功，再开始练习。");
    return;
  }

  const quiz = state.practice;
  quiz.active = true;
  quiz.correctCount = 0;
  quiz.questionIndex = 0;
  quiz.current = null;
  quiz.options = [];
  quiz.answered = false;

  els.practiceIdle.hidden = true;
  els.practiceSession.hidden = false;
  updatePracticeScore();
  renderPracticeQuestion({ focusPlayButton: true });
}

function renderPracticeQuestion({ focusPlayButton = false } = {}) {
  const quiz = state.practice;
  if (!quiz.active || !state.phonemes.length) {
    return;
  }

  AudioController.stop();

  const previousId = quiz.current ? quiz.current.id : null;
  let pool = state.phonemes.filter((phoneme) => phoneme.id !== previousId);
  if (!pool.length) {
    pool = state.phonemes;
  }

  quiz.current = pool[Math.floor(Math.random() * pool.length)];
  quiz.questionIndex += 1;
  quiz.answered = false;

  const distractors = shuffle(
    state.phonemes.filter((phoneme) => phoneme.id !== quiz.current.id),
  ).slice(0, 3);
  quiz.options = shuffle([quiz.current, ...distractors]);

  els.questionNumber.textContent = `第 ${quiz.questionIndex} 题`;
  updatePracticeScore();
  els.nextQuestion.disabled = true;
  els.practiceFeedback.hidden = true;
  els.practiceFeedback.classList.remove("is-wrong");
  clearElement(els.practiceFeedback);

  clearElement(els.practiceOptions);
  quiz.options.forEach((phoneme, index) => {
    const option = makeElement("button", "option-btn");
    option.type = "button";
    option.dataset.optionId = phoneme.id;
    option.setAttribute(
      "aria-label",
      `选项 ${OPTION_LETTERS[index]}，${phoneme.symbol}`,
    );

    const letter = makeElement("span", "option-letter", OPTION_LETTERS[index]);
    letter.setAttribute("aria-hidden", "true");
    const symbol = makeElement("span", "option-symbol", phoneme.symbol);
    const mark = makeElement("span", "option-mark");
    mark.setAttribute("aria-hidden", "true");

    option.append(letter, symbol, mark);
    option.addEventListener("click", () => handlePracticeAnswer(phoneme.id, option));
    els.practiceOptions.append(option);
  });

  if (focusPlayButton) {
    window.setTimeout(() => {
      els.playQuestion.focus({ preventScroll: true });
    }, 60);
  }
}

function playPracticeAudio() {
  const quiz = state.practice;
  if (!quiz.active || !quiz.current) {
    return;
  }
  const example = quiz.current.examples[0];
  AudioController.play(
    quiz.current.audioPath,
    els.playQuestion,
    example ? example.word : "",
  );
}

function handlePracticeAnswer(selectedId, selectedButton) {
  const quiz = state.practice;
  if (!quiz.active || quiz.answered || !quiz.current) {
    return;
  }

  quiz.answered = true;
  const isCorrect = selectedId === quiz.current.id;
  if (isCorrect) {
    quiz.correctCount += 1;
  }
  updatePracticeScore();

  toArray(els.practiceOptions.querySelectorAll(".option-btn")).forEach((button) => {
    button.disabled = true;
    const optionId = button.dataset.optionId;
    const mark = button.querySelector(".option-mark");

    if (optionId === quiz.current.id) {
      button.classList.add("is-correct");
      if (mark) {
        mark.textContent = "✓";
      }
      button.setAttribute("aria-label", `正确答案：${quiz.current.symbol}`);
    } else if (button === selectedButton) {
      button.classList.add("is-wrong");
      if (mark) {
        mark.textContent = "×";
      }
      const wrongPhoneme = state.byId.get(optionId);
      if (wrongPhoneme) {
        button.setAttribute(
          "aria-label",
          `你选择了 ${wrongPhoneme.symbol}，回答错误`,
        );
      }
    }
  });

  renderPracticeFeedback(isCorrect, selectedId);
  els.nextQuestion.disabled = false;
  window.setTimeout(() => {
    els.nextQuestion.focus({ preventScroll: true });
  }, 80);
}

function renderPracticeFeedback(isCorrect, selectedId) {
  const quiz = state.practice;
  const selectedPhoneme = state.byId.get(selectedId);

  els.practiceFeedback.hidden = false;
  els.practiceFeedback.classList.toggle("is-wrong", !isCorrect);
  clearElement(els.practiceFeedback);

  const icon = makeElement("span", "feedback-icon", isCorrect ? "✓" : "×");
  icon.setAttribute("aria-hidden", "true");
  const copy = makeElement("div", "feedback-copy");
  const title = makeElement("strong", "", isCorrect ? "答对了！" : "再听一次。");
  const line = makeElement("p");

  if (isCorrect) {
    line.append(
      document.createTextNode("正确答案就是 "),
      makeElement("span", "feedback-answer", quiz.current.symbol),
      document.createTextNode("，你选对了。"),
    );
  } else {
    line.append(
      document.createTextNode("正确答案是 "),
      makeElement("span", "feedback-answer", quiz.current.symbol),
      document.createTextNode(
        `，你选的是 ${selectedPhoneme ? selectedPhoneme.symbol : "其他选项"}。`,
      ),
    );
  }

  copy.append(title, line);
  els.practiceFeedback.append(icon, copy);
}

function updatePracticeScore() {
  const quiz = state.practice;
  els.practiceScore.textContent = `答对 ${quiz.correctCount} 题`;
}

function updatePracticeAvailability() {
  const hasData = state.dataReady && state.phonemes.length > 0;
  els.startPractice.disabled = !hasData;
  els.practiceTotal.textContent = state.dataReady ? String(state.phonemes.length) : "—";
}

/* =========================================================
   学习进度与 localStorage
   ========================================================= */

function loadLearnedFromStorage() {
  try {
    return parseLearnedValue(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.warn("无法读取 localStorage：", error);
    return new Set();
  }
}

function parseLearnedValue(rawValue) {
  if (!rawValue) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(
      parsed
        .filter((value) => typeof value === "string" && value.trim())
        .map((value) => value.trim()),
    );
  } catch (error) {
    return new Set();
  }
}

function saveLearnedToStorage() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.learned]));
  } catch (error) {
    if (!storageWarningShown) {
      storageWarningShown = true;
      showToast(
        "进度暂时无法保存",
        "浏览器禁止了本地存储，本次学习记录在刷新后会丢失。请关闭无痕模式或检查浏览器设置。",
        6200,
      );
    }
  }
}

function updateProgress() {
  const hasData = state.dataReady;
  const total = hasData ? state.phonemes.length : 0;
  const learnedCount = hasData
    ? state.phonemes.filter((phoneme) => state.learned.has(phoneme.id)).length
    : 0;
  const percent = total > 0 ? Math.round((learnedCount / total) * 100) : 0;
  const totalLabel = hasData ? String(total) : "—";

  els.heroProgressValue.textContent = `${percent}%`;
  els.heroProgressBar.style.width = `${percent}%`;
  els.heroProgressTrack.setAttribute("aria-valuenow", String(percent));
  els.heroProgressTrack.setAttribute(
    "aria-valuetext",
    hasData ? `已学 ${learnedCount} 个，共 ${total} 个，掌握率 ${percent}%` : "数据加载中",
  );
  els.heroLearnedCount.textContent = String(learnedCount);
  els.heroTotalCount.textContent = totalLabel;

  els.progressPercent.textContent = `${percent}%`;
  els.progressLearned.textContent = String(learnedCount);
  els.progressTotal.textContent = totalLabel;
  els.progressBar.style.width = `${percent}%`;
  els.progressTrackLarge.setAttribute("aria-valuenow", String(percent));
  els.progressTrackLarge.setAttribute(
    "aria-valuetext",
    hasData ? `已学 ${learnedCount} 个，共 ${total} 个，掌握率 ${percent}%` : "数据加载中",
  );
  els.progressRing.style.setProperty("--progress", `${percent}%`);
  els.progressRing.setAttribute("aria-valuenow", String(percent));

  els.resetProgress.disabled = learnedCount === 0;

  if (!hasData) {
    els.progressMessage.textContent = state.loadError
      ? "音标数据没有成功加载，请刷新页面重试。"
      : "正在准备音标数据…";
  } else if (percent === 100) {
    els.progressMessage.textContent = `太棒了，${total} 个音标已全部掌握。可以回到练习页反复听辨，让发音变成本能。`;
  } else if (learnedCount === 0) {
    els.progressMessage.textContent =
      "从音标表挑一个音开始吧，标记「已学」后就会记录在这里。";
  } else {
    const remaining = total - learnedCount;
    els.progressMessage.textContent = `已经掌握 ${learnedCount} 个音标，再学 ${remaining} 个就集齐了。点开任意卡片继续学习吧。`;
  }

  renderLearnedList();
}

function renderLearnedList() {
  clearElement(els.learnedList);

  if (!state.dataReady) {
    els.learnedListCount.textContent = "—";
    const message = makeElement(
      "p",
      "learned-loading",
      state.loadError ? "音标加载失败，暂时无法显示已学列表。" : "正在准备音标数据…",
    );
    els.learnedList.append(message);
    return;
  }

  const learnedPhonemes = state.phonemes.filter((phoneme) =>
    state.learned.has(phoneme.id),
  );
  els.learnedListCount.textContent = `${learnedPhonemes.length} 个`;

  if (!learnedPhonemes.length) {
    const empty = makeElement("div", "learned-empty");
    const copy = makeElement(
      "p",
      "",
      "还没有标记任何音标。打开一张音标卡，点击「标记为已学」就会出现在这里。",
    );
    const goLearn = makeElement("button", "button button-secondary", "去音标表");
    goLearn.type = "button";
    goLearn.dataset.viewJump = "phonemes";
    empty.append(copy, goLearn);
    els.learnedList.append(empty);
    return;
  }

  learnedPhonemes.forEach((phoneme) => {
    const item = makeElement("button", "learned-item");
    item.type = "button";
    item.setAttribute("aria-label", `查看音标 ${phoneme.symbol} 的详情`);

    const symbol = makeElement("span", "learned-item-symbol", phoneme.symbol);
    const copy = makeElement("span", "learned-item-copy");
    const title = makeElement(
      "strong",
      "",
      phoneme.examples
        .slice(0, 3)
        .map((example) => example.word)
        .join(" · ") || "查看发音要点",
    );
    const description = makeElement("span", "", getTypeLabel(phoneme));
    const arrow = makeElement("span", "learned-item-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");

    copy.append(title, description);
    item.append(symbol, copy, arrow);
    item.addEventListener("click", () => openPhonemeDetail(phoneme.id));
    els.learnedList.append(item);
  });
}

function resetProgress() {
  if (!state.learned.size) {
    return;
  }

  const confirmed = window.confirm("确定要清空全部已学标记吗？此操作不能撤销。");
  if (!confirmed) {
    return;
  }

  state.learned.clear();
  saveLearnedToStorage();
  refreshCardStates();
  updateProgress();
  updateDialogLearnedState();
  showToast("学习进度已重置", "所有音标已恢复为未学状态，可以重新开始。", 3000);
}

function handleStorageChange(event) {
  if (event.key !== STORAGE_KEY) {
    return;
  }

  const nextLearned = parseLearnedValue(event.newValue);
  if (state.dataReady) {
    const validIds = new Set(state.phonemes.map((phoneme) => phoneme.id));
    state.learned = new Set([...nextLearned].filter((id) => validIds.has(id)));
  } else {
    state.learned = nextLearned;
  }

  refreshCardStates();
  updateProgress();
  updateDialogLearnedState();
}

/* =========================================================
   Toast 提示
   ========================================================= */

function showToast(title, message, duration = 4600) {
  window.clearTimeout(toastTimer);
  window.clearTimeout(toastHideTimer);

  els.toastTitle.textContent = title;
  els.toastMessage.textContent = message || "";
  els.toast.hidden = false;

  // 强制一次布局，让已经从隐藏切换为显示时也能正常播放进入动画。
  void els.toast.offsetWidth;
  els.toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    hideToast();
  }, duration);
}

function hideToast() {
  window.clearTimeout(toastTimer);
  window.clearTimeout(toastHideTimer);
  els.toast.classList.remove("is-visible");
  toastHideTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 220);
}

/* =========================================================
   启动
   ========================================================= */

function reportBootError(error) {
  const detail =
    error && error.message
      ? `${error.name || "Error"}: ${error.message}`
      : String(error || "未知错误");
  console.error("音标页面启动失败：", error);

  const status = document.getElementById("phoneme-count");
  if (status) {
    status.textContent = `启动失败：${detail}`;
  }

  const grid = document.getElementById("phoneme-grid");
  if (grid) {
    clearElement(grid);
    const box = document.createElement("div");
    box.className = "empty-state";
    const heading = document.createElement("h3");
    heading.textContent = "页面初始化没有完成";
    const copy = document.createElement("p");
    copy.className = "empty-state-detail";
    copy.textContent = `错误信息：${detail}。请把这段文字反馈给开发者，或尝试使用最新版 Chrome / Edge 打开。`;
    box.appendChild(heading);
    box.appendChild(copy);
    grid.appendChild(box);
    grid.setAttribute("aria-busy", "false");
  }
}

function boot() {
  try {
    init();
  } catch (error) {
    reportBootError(error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      boot();
    },
    { once: true },
  );
} else {
  boot();
}
