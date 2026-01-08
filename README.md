# One-Language - 沉浸式语言学习助手

<div align="center">
<img src="public/icon/logo.png" width="100" height="100"  />
</div>

> 基于"可理解输入"理论的浏览器扩展，将日常网页浏览转化为自然的语言学习体验。

## ✨ 核心理念

One-Language 基于著名的 **"i+1"** 理论，通过智能地将网页上的部分词语替换为目标语言，创造略高于当前水平的可理解输入环境。让你在沉浸式的阅读中，不知不觉地提升词汇量和语感。

**🎯 项目亮点**: 集成完整的发音学习生态系统和智能多语言翻译功能，包括自动语言检测、音标显示、AI词义解释、双TTS语音合成和交互式悬浮框，提供从智能翻译到发音学习的一站式沉浸式体验。

## 🏗️ 项目架构

本项目采用 Monorepo 架构，包含三个主要模块：

### 📦 浏览器扩展（根目录）
提供沉浸式语言学习功能的主扩展程序：
- 智能翻译引擎，支持AI驱动的语言检测
- 发音学习生态系统，配备交互式悬浮框
- 视觉体验系统，提供多种翻译样式
- 配置管理系统，支持智能设置
- 网站管理功能，支持黑名单/白名单

### 🔧 后端服务 (`backend/`)
提供云端功能的API服务：
- **用户认证**: 注册、登录，支持JWT令牌认证
- **词汇管理**: 保存、分类和跟踪词汇掌握度
- **学习记录**: 跟踪学习活动和统计数据
- **复习系统**: 基于掌握度的智能复习推荐
- **统计分析**: 全面的学习数据分析
- **数据导出**: 支持JSON、CSV或Anki格式导出

### 📊 管理后台 (`admin/`)
为用户提供的管理界面：
- **用户仪表板**: 学习概览，快速访问功能
- **词汇管理**: 列表、搜索、筛选、编辑和删除词汇
- **复习系统**: 支持卡片/列表模式的复习队列
- **统计分析**: 学习趋势、词汇增长、活动分析
- **数据导出**: 导出设置和下载管理

## 🚀 核心功能

### 🎯 智能翻译引擎
- **智能语言检测**: AI自动识别网页源语言，无需手动指定
- **智能文本处理**: 使用大语言模型分析内容，智能选择适合用户水平的词汇
- **精确替换控制**: 可精确控制翻译比例（1%-100%），支持字符级计算
- **上下文感知**: 考虑语境和用户水平，选择最合适的翻译词汇
- **多语言支持**: 支持20+种语言的智能翻译
- **懒加载翻译**: 滚动到段落时才进行翻译，减少资源消耗

### 🔊 发音学习生态系统
- **交互式悬浮框**: 鼠标悬停翻译词汇即可查看音标、AI词义和朗读功能
- **双层学习体验**: 短语显示可交互的单词列表，点击单个单词查看详细信息
- **多TTS服务支持**: 集成有道TTS（高质量）和Web Speech API（备用）
- **智能音标获取**: 自动获取Dictionary API音标数据，24小时TTL缓存
- **AI词义解释**: 实时调用AI生成中文词义解释，理解更准确
- **渐进式加载**: 先显示基础信息，再异步加载详细内容
- **音频缓存**: 内存级TTS音频缓存，同一单词无需重复生成语音

### 🎨 丰富的视觉体验
- **7种翻译样式**: 默认、微妙、粗体、斜体、下划线、高亮、学习模式（模糊效果）
- **学习模式**: 翻译词汇初始模糊显示，鼠标悬停时清晰化，增强记忆效果
- **辉光动画**: 新翻译词汇出现时的柔和提示效果，不干扰阅读体验
- **响应式设计**: 自适应深色/浅色主题，智能悬浮框定位
- **悬浮工具球**: 可配置的悬浮工具球，快速访问常用功能

### ⚙️ 高度可配置性
- **智能翻译模式**: 用户只需选择目标语言，AI自动检测源语言并翻译
- **用户水平适配**: 从初级到精通5个级别，AI智能调整词汇难度和选择策略
- **触发模式**: 支持自动触发（页面加载时处理）和手动触发两种工作方式
- **原文显示控制**: 可选择显示、隐藏或学习模式（模糊效果）显示被翻译的原文
- **段落长度控制**: 自定义AI单次处理的最大文本长度
- **发音功能开关**: 可独立控制发音悬浮框功能的启用状态
- **多API配置**: 支持配置多个API服务，可灵活切换不同的翻译服务提供商

### 🔌 开放式API集成
- **兼容OpenAI API**: 支持任何兼容 OpenAI 格式的AI服务（ChatGPT、Claude、豆包等国产大模型）
- **Google Gemini支持**: 集成Google Gemini API，提供更多AI服务选择
- **灵活配置**: 自定义API Key、Endpoint、模型名称、Temperature参数
- **智能提示词**: 根据翻译方向和用户水平动态生成最优提示词
- **错误处理**: 完善的API错误处理和重试机制
- **多API支持**: 支持配置多个API服务并灵活切换

### 🚀 性能与优化
- **智能缓存**: 翻译结果、音标数据、TTS音频多级缓存策略
- **增量处理**: 只处理新增内容，避免重复翻译
- **DOM安全**: 使用Range API确保DOM结构完整性
- **内存管理**: 及时清理监听器，优化内存使用
- **懒加载优化**: 滚动时按需翻译，减少初始加载时间

## 💻 技术架构

### 浏览器扩展
- **框架**: [WXT](https://wxt.dev/) - 现代WebExtension开发框架
- **前端**: Vue 3 + TypeScript + Vite
- **UI库**: Tailwind CSS + Lucide Icons + Reka UI
- **构建**: ESLint + Prettier + TypeScript编译
- **API集成**: OpenAI兼容接口 + Google Gemini + Dictionary API + 有道TTS
- **跨浏览器兼容**: 支持Chrome、Edge、Firefox，部分支持Safari

### 后端服务
- **框架**: Express.js + TypeScript
- **数据库**: MySQL + Prisma ORM
- **认证**: JWT（访问令牌 + 刷新令牌）
- **API**: RESTful API
- **安全**: Helmet、CORS、bcrypt密码加密
- **验证**: Zod请求验证

### 管理后台
- **框架**: Vue 3 + TypeScript + Vite
- **UI库**: Tailwind CSS + Reka UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **图表**: Chart.js + vue-chartjs

## 🌐 浏览器兼容性

| 浏览器 | 支持状态 | 特殊说明 |
|-------|--------|----------|
| Chrome | ✅ 完全支持 | 推荐环境，所有功能可用 |
| Edge | ✅ 完全支持 | 基于Chromium，完整兼容 |
| Firefox | ✅ 支持 | 需配置addon ID |
| Safari | ⚠️ 部分支持 | 需要额外配置 |

## 🛠️ 快速开始

### 环境要求
- [Node.js](https://nodejs.org/) (版本 18 或更高)
- [npm](https://nodejs.org/) 或其他包管理器

### 安装步骤

#### 1. 克隆仓库
```bash
git clone <your-repository-url>
cd one-language
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 配置环境
```bash
cp .env.example .env
```

编辑 `.env` 文件，至少需要提供一个有效的 API Key：
```env
VITE_WXT_DEFAULT_API_KEY="sk-your-real-api-key"
VITE_WXT_DEFAULT_API_ENDPOINT="https://api.openai.com/v1/chat/completions"
VITE_WXT_DEFAULT_MODEL="gpt-3.5-turbo"
VITE_WXT_DEFAULT_TEMPERATURE="0.2"
```

#### 4. 构建扩展

**Chrome/Edge构建**
```bash
npm run build
npm run zip
```

**Firefox构建**
```bash
npm run build:firefox
npm run zip:firefox
```

#### 5. 加载扩展

**Chrome/Edge安装**
1. 打开浏览器扩展管理页面（`chrome://extensions` 或 `edge://extensions`）
2. 打开"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录下的 `.output/chrome-mv3` 文件夹

**Firefox安装**
1. 在Firefox地址栏输入 `about:debugging#/runtime/this-firefox`
2. 点击"临时加载附加组件..."
3. 选择 `.output/firefox-mv2/manifest.json` 文件

### 后端服务设置（可选）

如果需要使用云端功能：

#### 1. 进入后端目录
```bash
cd backend
```

#### 2. 安装依赖并配置
```bash
npm install
cp .env.example .env
```

#### 3. 配置数据库
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

#### 4. 启动服务
```bash
npm run dev
```

### 管理后台设置（可选）

#### 1. 进入管理后台目录
```bash
cd admin
```

#### 2. 安装依赖并启动
```bash
npm install
npm run dev
```

## 📝 开发命令

### 扩展开发
```bash
npm run dev              # 开发服务器 (Chrome)
npm run dev:firefox      # 开发服务器 (Firefox)
npm run build            # 生产构建 (Chrome)
npm run build:firefox    # 生产构建 (Firefox)
npm run zip              # 打包扩展 (Chrome)
npm run zip:firefox      # 打包扩展 (Firefox)
npm run zip:all          # 打包所有浏览器
```

### 代码质量
```bash
npm run lint             # 运行 ESLint
npm run lint:fix         # ESLint 自动修复
npm run format           # Prettier 格式化
npm run check            # 格式化 + lint修复
npm run compile          # TypeScript 检查
```

## ❓ 常见问题

### 为什么需要提供API密钥？
本扩展使用AI技术进行智能文本翻译，需要调用API服务。您可以使用 OpenAI 的API密钥，或任何兼容 OpenAI API格式的第三方服务。

### 发音功能如何工作？
发音系统提供完整的学习体验：
- **音标显示**: 自动获取Dictionary API音标数据
- **AI词义**: 实时调用AI获取中文释义解释
- **双TTS支持**: 有道TTS（高质量）+ Web Speech API（备用）
- **交互悬浮框**: 鼠标悬停查看，支持英美发音切换

### 扩展会收集我的浏览数据吗？
不会。本扩展在本地处理所有网页内容，只将需要翻译的文本片段发送到配置的API服务。发音功能的音标和词义数据也会本地缓存，保护您的隐私。

### 我可以控制翻译比例吗？
可以。扩展提供了精确的翻译控制：
- **语言水平**: 5个级别从初级到精通，AI智能调整词汇难度
- **替换比例**: 1%-100%精确控制，支持按字符数计算
- **原文显示**: 可选择显示、隐藏或学习模式（模糊效果）

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 开发指南
- **架构原则**: 遵循Provider模式和模块化设计
- **代码规范**: TypeScript严格模式，ESLint + Prettier格式化
- **测试要求**: 确保新功能在多种浏览器和网站上正常工作
- **性能考虑**: 注意DOM操作效率、内存管理和缓存策略

## 📜 开源许可

本项目基于 [MIT License](./LICENSE) 开源。您可以自由使用、修改和分发此代码，包括用于商业目的。

---

<div align="center">
  <p>⭐ 如果这个项目对您有帮助，请给我们一个Star！</p>
  <p>🔄 欢迎Fork并贡献您的改进！</p>
</div>