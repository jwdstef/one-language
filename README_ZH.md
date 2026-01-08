# One-Language - 沉浸式语言学习助手

<div align="center">
<img src="public/icon/128.png" width="100" height="100"  />
</div>

> 基于"可理解输入"理论的浏览器扩展，将日常网页浏览转化为自然的语言学习体验。

简体中文 | [English](./README.md)

## ✨ 核心理念

One-Language 基于著名的 **"i+1"** 理论，通过智能地将网页上的部分词语替换为目标语言，创造略高于当前水平的可理解输入环境。让你在沉浸式的阅读中，不知不觉地提升词汇量和语感。

## 🚀 主要功能

### 🎯 智能翻译引擎
- **智能语言检测**: AI自动识别网页源语言
- **精确替换控制**: 可控制翻译比例（1%-100%）
- **多语言支持**: 支持20+种语言的智能翻译
- **上下文感知**: 根据语境选择最合适的翻译词汇

### 🔊 发音学习系统
- **交互式悬浮框**: 鼠标悬停查看音标、词义和朗读
- **多TTS服务**: 有道TTS + Web Speech API
- **AI词义解释**: 实时生成中文词义解释
- **音频缓存**: 智能缓存，提升响应速度

### 🎨 丰富视觉体验
- **7种翻译样式**: 默认、微妙、粗体、斜体、下划线、高亮、学习模式
- **学习模式**: 模糊显示，悬停清晰化
- **主题适配**: 自适应深色/浅色主题
- **悬浮工具球**: 快速访问常用功能

### ⚙️ 高度可配置
- **用户水平适配**: 5个级别，AI智能调整词汇难度
- **触发模式**: 自动触发或手动触发
- **API集成**: 支持OpenAI、Google Gemini等多种AI服务
- **网站管理**: 黑名单/白名单功能

## 🏗️ 项目架构

- **浏览器扩展**: Vue 3 + TypeScript + WXT框架
- **后端服务**: Express.js + Prisma + MySQL
- **管理后台**: Vue 3 + Pinia + Chart.js

## 🌐 浏览器支持

| 浏览器 | 支持状态 |
|-------|--------|
| Chrome | ✅ 完全支持 |
| Edge | ✅ 完全支持 |
| Firefox | ✅ 支持 |
| Safari | ⚠️ 部分支持 |

## 🛠️ 快速开始

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd one-language
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境
```bash
cp .env.example .env
# 编辑 .env 文件，添加你的 API Key
```

### 4. 构建扩展
```bash
# Chrome/Edge
npm run build && npm run zip

# Firefox
npm run build:firefox && npm run zip:firefox
```

### 5. 加载到浏览器
- Chrome/Edge: 打开扩展管理页面，加载 `.output/chrome-mv3` 文件夹
- Firefox: 访问 `about:debugging`，临时加载 `.output/firefox-mv2/manifest.json`

## 📝 开发命令

```bash
npm run dev              # 开发模式 (Chrome)
npm run dev:firefox      # 开发模式 (Firefox)
npm run build            # 生产构建
npm run lint             # 代码检查
npm run format           # 代码格式化
```

## ❓ 常见问题

**Q: 为什么需要API密钥？**
A: 扩展使用AI进行智能翻译，需要调用API服务。支持OpenAI或兼容格式的第三方服务。

**Q: 会收集我的浏览数据吗？**
A: 不会。所有处理都在本地进行，只发送需要翻译的文本片段到API服务。

**Q: 如何控制翻译效果？**
A: 可以通过用户水平、翻译比例、显示样式等多个维度精确控制。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📜 许可证

[MIT License](./LICENSE) - 可自由使用、修改和分发。

---

<div align="center">
  <p>⭐ 如果项目对您有帮助，请给个Star！</p>
</div>