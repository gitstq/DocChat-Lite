<p align="center">
  <img src="https://img.shields.io/badge/DocChat--Lite-v1.0-blue?style=for-the-badge" alt="DocChat-Lite">
  <img src="https://img.shields.io/badge/Zero_Dependencies-100%25-green?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/Offline_First-IndexedDB-orange?style=flat-square" alt="Offline First">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License">
</p>

<p align="center">
  <b>DocChat-Lite</b> — 轻量级文档知识库对话引擎
</p>

<p align="center">
[简体中文](#简体中文) | [繁體中文](#繁體中文) | [English](#English)
</p>

---

## 简体中文

## 🎉 项目介绍

**DocChat-Lite** 是一款轻量级、零依赖的文档知识库对话引擎。它是一个纯前端、离线优先的 Web 应用，让你能够将本地文档转化为可对话的知识库，无需任何后端服务或数据库。

### 解决的痛点

- **隐私安全**：厌倦了将敏感文档上传到第三方云端服务？DocChat-Lite 所有数据完全存储在浏览器本地，绝不外传。
- **部署门槛**：不想搭建复杂的服务端环境？直接打开 `index.html` 即可使用，零配置、零安装。
- **依赖臃肿**：受够了动辄数百 MB 的 node_modules？整个项目没有一行 `npm install`，纯原生 JavaScript 实现。
- **离线需求**：网络不稳定或需要断网使用？IndexedDB 持久化存储 + PWA 支持，随时随地可用。

### 自研差异化亮点

- **纯前端 TF-IDF 搜索引擎**：自研实现的中英文分词与倒排索引引擎，支持字符级 bigram 中文分词、停用词过滤、TF-IDF 相关度排序，无需任何第三方搜索库。
- **RAG 对话架构**：采用检索增强生成（RAG）模式，先通过 TF-IDF 检索相关文档片段，再注入 LLM 上下文，实现基于文档的精准问答。
- **OpenAI 兼容 API 集成**：支持任何 OpenAI 兼容的 Chat Completions API（包括 DeepSeek、Ollama 等），流式响应（SSE）实时输出。
- **无 API 降级方案**：即使不配置 LLM API，也能基于 TF-IDF 搜索结果提供文档内容摘要，保证基本可用性。

### 灵感来源

DocChat-Lite 的灵感来源于"文档转知识库"的产品理念（类似 Google NotebookLM），但本项目 **100% 独立研发**，定位为更轻量、零后端的替代方案。我们相信，好的工具不一定要依赖复杂的基础设施——有时候，一个浏览器标签页就够了。

---

## ✨ 核心特性

- 🚫 **零依赖**：不依赖任何 npm 包、框架或构建工具，纯原生 HTML/CSS/JavaScript，单文件即可运行
- 📡 **离线优先**：基于 IndexedDB 的本地持久化存储，断网也能正常使用，支持 PWA 安装
- 🔍 **TF-IDF 全文检索**：自研搜索引擎，支持中英文混合分词、倒排索引、相关度排序、高亮匹配
- 📄 **多格式文档支持**：支持 TXT、Markdown、JSON、CSV、HTML 五种常见格式的解析与渲染
- 🤖 **LLM 智能对话**：集成 OpenAI 兼容 API，支持流式响应、RAG 检索增强生成、上下文注入
- 🌗 **深色/浅色主题**：内置深色与浅色两套主题，一键切换，跟随系统偏好
- 📱 **响应式设计**：完美适配桌面端与移动端，侧边栏自动折叠，触控友好
- ⌨️ **键盘快捷键**：`Ctrl+K` 搜索、`Ctrl+N` 新建对话、`Ctrl+O` 打开文件、`ESC` 关闭弹窗
- 🖱️ **拖拽上传**：支持将文件直接拖拽到上传区域或整个页面，批量导入文档
- 📦 **数据导出/导入**：一键导出所有文档与对话数据为 JSON 文件，支持备份恢复
- 🔒 **隐私优先**：API 密钥仅存储在本地浏览器中，所有文档数据不离开你的设备
- 🎨 **PWA 就绪**：内置 Web App Manifest，可添加到主屏幕，获得类原生应用体验

---

## 🚀 快速开始

### 环境要求

任何支持以下特性的现代浏览器即可：

- ES6+ (Promise, async/await, const/let)
- IndexedDB API
- Fetch API
- File API

推荐使用 **Chrome 80+**、**Firefox 78+**、**Safari 14+**、**Edge 80+** 或更新版本。

### 安装与运行

#### 方式一：直接打开（最简单）

```bash
# 克隆仓库
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 直接在浏览器中打开
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

> 注意：直接打开文件时，由于浏览器安全策略，部分功能（如 PWA）可能受限。推荐使用本地服务器方式。

#### 方式二：本地服务器

```bash
# 使用 Python 内置 HTTP 服务器
cd DocChat-Lite
python3 -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server . -p 8080

# 或使用 PHP 内置服务器
php -S localhost:8080
```

然后在浏览器中访问 `http://localhost:8080`。

#### 方式三：GitHub Pages 部署

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings > Pages**
3. Source 选择 `main` 分支，目录选择 `/ (root)`
4. 保存后等待部署完成，即可通过 `https://your-username.github.io/DocChat-Lite/` 访问

---

## 📖 详细使用指南

### 导入文档

支持以下两种方式导入文档：

**拖拽上传**
- 将文件直接拖拽到上传弹窗的拖放区域
- 也可以将文件拖拽到页面任意位置，系统会自动弹出上传窗口
- 支持批量导入多个文件

**点击上传**
- 点击侧边栏的"上传文档"按钮或欢迎页的"上传文档"按钮
- 在弹出的上传窗口中点击拖放区域，选择文件
- 支持的文件格式：`.txt`、`.md`、`.json`、`.csv`、`.html`/`.htm`

### 与文档对话

1. **新建对话**：点击侧边栏的"新建对话"按钮，或使用快捷键 `Ctrl+N`
2. **输入问题**：在底部输入框中输入你想了解的问题
3. **获取回答**：
   - 系统会自动通过 TF-IDF 搜索引擎检索相关文档内容
   - 如果已配置 LLM API，将基于检索结果生成智能回答
   - 如果未配置 API，将展示搜索到的相关文档片段
4. **查看来源**：对话过程中会显示关联的文档上下文数量

### 配置 LLM API

1. 点击侧边栏底部的齿轮图标打开设置面板
2. 在 **API 配置** 区域填写以下信息：
   - **API 地址**：OpenAI 兼容的 Chat Completions 端点（如 `https://api.openai.com/v1/chat/completions`）
   - **API 密钥**：你的 API Key（仅存储在本地浏览器中）
   - **模型名称**：如 `gpt-3.5-turbo`、`gpt-4`、`deepseek-chat` 等
3. 点击"保存设置"

> 提示：DocChat-Lite 支持任何 OpenAI 兼容的 API，包括但不限于 OpenAI、Anthropic（通过代理）、DeepSeek、Ollama 本地模型等。

### 管理文档和对话

- **查看文档**：在侧边栏"文档"标签页中点击文档名称，即可在主内容区查看文档内容
- **删除文档**：将鼠标悬停在文档项上，点击出现的删除按钮
- **查看对话**：在侧边栏"对话"标签页中点击对话标题，即可加载历史对话
- **删除对话**：将鼠标悬停在对话项上，点击出现的删除按钮

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` / `Cmd+K` | 打开全局搜索 |
| `Ctrl+N` / `Cmd+N` | 新建对话 |
| `Ctrl+O` / `Cmd+O` | 打开文件选择 |
| `Enter` | 发送消息 |
| `Shift+Enter` | 消息换行 |
| `ESC` | 关闭弹窗/模态框 |

### 数据备份与恢复

**导出数据**
1. 打开设置面板
2. 在"数据管理"区域点击"导出数据"按钮
3. 系统将下载一个包含所有文档、对话和设置的 JSON 文件

**清除数据**
1. 打开设置面板
2. 在"数据管理"区域点击"清除所有数据"按钮
3. 确认后所有文档和对话将被永久删除（不可恢复，建议先导出备份）

---

## 💡 设计思路与迭代规划

### 设计哲学

- **离线优先**：核心功能不依赖网络，所有数据本地存储，断网可用
- **零依赖**：不引入任何第三方库，保持项目极致轻量，降低安全风险
- **隐私至上**：用户数据不离开浏览器，API 密钥本地加密存储

### 技术选型及理由

| 技术 | 选型 | 理由 |
|------|------|------|
| 数据存储 | IndexedDB | 浏览器原生 API，支持大容量结构化数据存储，无需后端 |
| 搜索引擎 | 自研 TF-IDF | 零依赖，支持中英文混合分词，满足文档级检索需求 |
| 对话集成 | OpenAI 兼容 API | 生态最成熟，兼容性最广，支持流式响应 |
| UI 渲染 | 原生 DOM 操作 | 无框架依赖，极致轻量，加载速度快 |
| 样式方案 | 原生 CSS + CSS 变量 | 支持主题切换，无构建步骤，浏览器原生支持 |

### 未来规划

- [ ] **PDF 文档支持**：集成 PDF.js 实现纯前端 PDF 文本提取
- [ ] **协同编辑**：基于 CRDT 算法的多人实时协作
- [ ] **插件系统**：支持自定义文档解析器、搜索增强器和对话插件
- [ ] **更多 LLM 提供商**：原生支持 Anthropic Claude、Google Gemini 等 API
- [ ] **文档标签与分类**：为文档添加标签，支持按分类筛选
- [ ] **对话导出**：将对话记录导出为 Markdown 或 PDF 格式
- [ ] **语义搜索**：集成轻量级 Embedding 模型，提升搜索准确度

---

## 📦 打包与部署指南

DocChat-Lite 是一个纯静态项目，无需构建步骤。以下是几种常见的部署方式：

### GitHub Pages 部署

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 2. 推送到你的 GitHub 仓库
git remote set-url origin https://github.com/your-username/DocChat-Lite.git
git push -u origin main

# 3. 在 GitHub 仓库中启用 Pages
# Settings > Pages > Source: main branch, / (root)
```

部署完成后访问 `https://your-username.github.io/DocChat-Lite/`。

### Nginx 静态托管

```nginx
server {
    listen 80;
    server_name docchat.example.com;
    root /var/www/docchat-lite;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 可选：启用 gzip 压缩
    gzip on;
    gzip_types text/css application/javascript text/html;
}
```

```bash
# 将项目文件复制到 Nginx 目录
sudo cp -r DocChat-Lite/* /var/www/docchat-lite/
sudo nginx -t && sudo nginx -s reload
```

### Docker 部署（可选）

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
# 构建镜像
docker build -t docchat-lite .

# 运行容器
docker run -d -p 8080:80 --name docchat-lite docchat-lite
```

### 本地文件系统直接使用

最简单的方式——直接双击 `index.html` 在浏览器中打开即可。所有功能均可正常使用（PWA 安装除外）。

---

## 🤝 贡献指南

我们欢迎并感谢所有形式的贡献！无论是提交 Bug 报告、改进建议还是代码 PR。

### 提交 PR

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature-name`
3. 提交改动：`git commit -m 'feat: add your feature description'`
4. 推送分支：`git push origin feature/your-feature-name`
5. 提交 **Pull Request**

**PR 规范**：
- 请遵循现有的代码风格（IIFE 模块模式、中文注释）
- 每个 PR 尽量只解决一个问题
- 提交信息请使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式
- 确保不引入任何新的外部依赖

### Issue 反馈

提交 Issue 时，请尽量包含以下信息：

- **问题描述**：清晰描述遇到的问题或建议
- **复现步骤**：如何复现该问题
- **环境信息**：浏览器名称及版本、操作系统
- **截图/录屏**：如有相关截图或录屏会更有帮助

### 开发环境搭建

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 2. 启动本地服务器（任选其一）
python3 -m http.server 8080
# 或
npx http-server . -p 8080 --cors

# 3. 在浏览器中打开 http://localhost:8080
# 4. 修改代码后刷新浏览器即可看到效果
```

项目结构：

```
DocChat-Lite/
├── index.html          # 主入口页面
├── manifest.json       # PWA 配置清单
├── css/
│   └── style.css       # 全局样式
├── js/
│   ├── app.js          # 应用主控制器
│   ├── chat.js         # 对话管理模块
│   ├── parser.js       # 文档解析器
│   ├── search.js       # TF-IDF 搜索引擎
│   ├── storage.js      # IndexedDB 存储层
│   ├── ui.js           # UI 渲染模块
│   └── utils.js        # 工具函数库
├── LICENSE             # MIT 开源协议
└── README.md           # 项目说明文档
```

---

## 📄 开源协议说明

本项目基于 [MIT License](LICENSE) 开源。

```
MIT License

Copyright (c) 2024 DocChat-Lite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

你可以自由使用、修改和分发本项目，但请保留版权声明和协议文本。

---

## 繁體中文

## 🎉 項目介紹

**DocChat-Lite** 是一款輕量級、零依賴的文件知識庫對話引擎。它是一個純前端、離線優先的 Web 應用，讓你能夠將本地文件轉化為可對話的知識庫，無需任何後端服務或資料庫。

### 解決的痛點

- **隱私安全**：厭倦了將敏感文件上傳到第三方雲端服務？DocChat-Lite 所有資料完全儲存在瀏覽器本地，絕不外傳。
- **部署門檻**：不想搭建複雜的伺服端環境？直接開啟 `index.html` 即可使用，零配置、零安裝。
- **依賴臃腫**：受夠了動輒數百 MB 的 node_modules？整個專案沒有一行 `npm install`，純原生 JavaScript 實現。
- **離線需求**：網路不穩定或需要斷網使用？IndexedDB 持久化儲存 + PWA 支援，隨時隨地可用。

### 自研差異化亮點

- **純前端 TF-IDF 搜尋引擎**：自研實現的中英文分詞與倒排索引引擎，支援字元級 bigram 中文分詞、停用詞過濾、TF-IDF 相關度排序，無需任何第三方搜尋庫。
- **RAG 對話架構**：採用檢索增強生成（RAG）模式，先透過 TF-IDF 檢索相關文件片段，再注入 LLM 上下文，實現基於文件的精準問答。
- **OpenAI 相容 API 整合**：支援任何 OpenAI 相容的 Chat Completions API（包括 DeepSeek、Ollama 等），串流回應（SSE）即時輸出。
- **無 API 降級方案**：即使不配置 LLM API，也能基於 TF-IDF 搜尋結果提供文件內容摘要，保證基本可用性。

### 靈感來源

DocChat-Lite 的靈感來源於「文件轉知識庫」的產品理念（類似 Google NotebookLM），但本專案 **100% 獨立研發**，定位為更輕量、零後端的替代方案。我們相信，好的工具不一定要依賴複雜的基礎設施——有時候，一個瀏覽器分頁就夠了。

---

## ✨ 核心特性

- 🚫 **零依賴**：不依賴任何 npm 套件、框架或建置工具，純原生 HTML/CSS/JavaScript，單檔即可運行
- 📡 **離線優先**：基於 IndexedDB 的本地持久化儲存，斷網也能正常使用，支援 PWA 安裝
- 🔍 **TF-IDF 全文檢索**：自研搜尋引擎，支援中英文混合分詞、倒排索引、相關度排序、高亮匹配
- 📄 **多格式文件支援**：支援 TXT、Markdown、JSON、CSV、HTML 五種常見格式的解析與渲染
- 🤖 **LLM 智慧對話**：整合 OpenAI 相容 API，支援串流回應、RAG 檢索增強生成、上下文注入
- 🌗 **深色/淺色主題**：內建深色與淺色兩套主題，一鍵切換，跟隨系統偏好
- 📱 **響應式設計**：完美適配桌面端與行動端，側邊欄自動折疊，觸控友善
- ⌨️ **鍵盤快捷鍵**：`Ctrl+K` 搜尋、`Ctrl+N` 新建對話、`Ctrl+O` 開啟檔案、`ESC` 關閉彈窗
- 🖱️ **拖放上傳**：支援將檔案直接拖放到上傳區域或整個頁面，批次匯入文件
- 📦 **資料匯出/匯入**：一鍵匯出所有文件與對話資料為 JSON 檔案，支援備份還原
- 🔒 **隱私優先**：API 金鑰僅儲存在本地瀏覽器中，所有文件資料不離開你的裝置
- 🎨 **PWA 就緒**：內建 Web App Manifest，可新增到主畫面，獲得類原生應用體驗

---

## 🚀 快速開始

### 環境需求

任何支援以下特性的現代瀏覽器即可：

- ES6+ (Promise, async/await, const/let)
- IndexedDB API
- Fetch API
- File API

推薦使用 **Chrome 80+**、**Firefox 78+**、**Safari 14+**、**Edge 80+** 或更新版本。

### 安裝與運行

#### 方式一：直接開啟（最簡單）

```bash
# 克隆倉庫
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 直接在瀏覽器中開啟
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

> 注意：直接開啟檔案時，由於瀏覽器安全策略，部分功能（如 PWA）可能受限。推薦使用本地伺服器方式。

#### 方式二：本地伺服器

```bash
# 使用 Python 內建 HTTP 伺服器
cd DocChat-Lite
python3 -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server . -p 8080

# 或使用 PHP 內建伺服器
php -S localhost:8080
```

然後在瀏覽器中造訪 `http://localhost:8080`。

#### 方式三：GitHub Pages 部署

1. 將程式碼推送到 GitHub 倉庫
2. 進入倉庫 **Settings > Pages**
3. Source 選擇 `main` 分支，目錄選擇 `/ (root)`
4. 儲存後等待部署完成，即可透過 `https://your-username.github.io/DocChat-Lite/` 造訪

---

## 📖 詳細使用指南

### 匯入文件

支援以下兩種方式匯入文件：

**拖放上傳**
- 將檔案直接拖放到上傳彈窗的拖放區域
- 也可以將檔案拖放到頁面任意位置，系統會自動彈出上傳視窗
- 支援批次匯入多個檔案

**點擊上傳**
- 點擊側邊欄的「上傳文件」按鈕或歡迎頁的「上傳文件」按鈕
- 在彈出的上傳視窗中點擊拖放區域，選擇檔案
- 支援的檔案格式：`.txt`、`.md`、`.json`、`.csv`、`.html`/`.htm`

### 與文件對話

1. **新建對話**：點擊側邊欄的「新建對話」按鈕，或使用快捷鍵 `Ctrl+N`
2. **輸入問題**：在底部輸入框中輸入你想了解的問題
3. **獲取回答**：
   - 系統會自動透過 TF-IDF 搜尋引擎檢索相關文件內容
   - 如果已配置 LLM API，將基於檢索結果生成智慧回答
   - 如果未配置 API，將展示搜尋到的相關文件片段
4. **檢視來源**：對話過程中會顯示關聯的文件上下文數量

### 配置 LLM API

1. 點擊側邊欄底部的齒輪圖示開啟設定面板
2. 在 **API 配置** 區域填寫以下資訊：
   - **API 位址**：OpenAI 相容的 Chat Completions 端點（如 `https://api.openai.com/v1/chat/completions`）
   - **API 金鑰**：你的 API Key（僅儲存在本地瀏覽器中）
   - **模型名稱**：如 `gpt-3.5-turbo`、`gpt-4`、`deepseek-chat` 等
3. 點擊「儲存設定」

> 提示：DocChat-Lite 支援任何 OpenAI 相容的 API，包括但不限於 OpenAI、Anthropic（透過代理）、DeepSeek、Ollama 本地模型等。

### 管理文件和對話

- **檢視文件**：在側邊欄「文件」標籤頁中點擊文件名稱，即可在主內容區檢視文件內容
- **刪除文件**：將滑鼠懸停在文件項目上，點擊出現的刪除按鈕
- **檢視對話**：在側邊欄「對話」標籤頁中點擊對話標題，即可載入歷史對話
- **刪除對話**：將滑鼠懸停在對話項目上，點擊出現的刪除按鈕

### 鍵盤快捷鍵

| 快捷鍵 | 功能 |
|--------|------|
| `Ctrl+K` / `Cmd+K` | 開啟全域搜尋 |
| `Ctrl+N` / `Cmd+N` | 新建對話 |
| `Ctrl+O` / `Cmd+O` | 開啟檔案選擇 |
| `Enter` | 傳送訊息 |
| `Shift+Enter` | 訊息換行 |
| `ESC` | 關閉彈窗/對話框 |

### 資料備份與還原

**匯出資料**
1. 開啟設定面板
2. 在「資料管理」區域點擊「匯出資料」按鈕
3. 系統將下載一個包含所有文件、對話和設定的 JSON 檔案

**清除資料**
1. 開啟設定面板
2. 在「資料管理」區域點擊「清除所有資料」按鈕
3. 確認後所有文件和對話將被永久刪除（不可還原，建議先匯出備份）

---

## 💡 設計思路與迭代規劃

### 設計哲學

- **離線優先**：核心功能不依賴網路，所有資料本地儲存，斷網可用
- **零依賴**：不引入任何第三方函式庫，保持專案極致輕量，降低安全風險
- **隱私至上**：使用者資料不離開瀏覽器，API 金鑰本地加密儲存

### 技術選型及理由

| 技術 | 選型 | 理由 |
|------|------|------|
| 資料儲存 | IndexedDB | 瀏覽器原生 API，支援大容量結構化資料儲存，無需後端 |
| 搜尋引擎 | 自研 TF-IDF | 零依賴，支援中英文混合分詞，滿足文件級檢索需求 |
| 對話整合 | OpenAI 相容 API | 生態最成熟，相容性最廣，支援串流回應 |
| UI 渲染 | 原生 DOM 操作 | 無框架依賴，極致輕量，載入速度快 |
| 樣式方案 | 原生 CSS + CSS 變數 | 支援主題切換，無建置步驟，瀏覽器原生支援 |

### 未來規劃

- [ ] **PDF 文件支援**：整合 PDF.js 實現純前端 PDF 文字擷取
- [ ] **協同編輯**：基於 CRDT 演算法的多人即時協作
- [ ] **外掛系統**：支援自訂文件解析器、搜尋增強器和對話外掛
- [ ] **更多 LLM 提供商**：原生支援 Anthropic Claude、Google Gemini 等 API
- [ ] **文件標籤與分類**：為文件新增標籤，支援按分類篩選
- [ ] **對話匯出**：將對話記錄匯出為 Markdown 或 PDF 格式
- [ ] **語意搜尋**：整合輕量級 Embedding 模型，提升搜尋準確度

---

## 📦 打包與部署指南

DocChat-Lite 是一個純靜態專案，無需建置步驟。以下是幾種常見的部署方式：

### GitHub Pages 部署

```bash
# 1. 克隆倉庫
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 2. 推送到你的 GitHub 倉庫
git remote set-url origin https://github.com/your-username/DocChat-Lite.git
git push -u origin main

# 3. 在 GitHub 倉庫中啟用 Pages
# Settings > Pages > Source: main branch, / (root)
```

部署完成後造訪 `https://your-username.github.io/DocChat-Lite/`。

### Nginx 靜態託管

```nginx
server {
    listen 80;
    server_name docchat.example.com;
    root /var/www/docchat-lite;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 可選：啟用 gzip 壓縮
    gzip on;
    gzip_types text/css application/javascript text/html;
}
```

```bash
# 將專案檔案複製到 Nginx 目錄
sudo cp -r DocChat-Lite/* /var/www/docchat-lite/
sudo nginx -t && sudo nginx -s reload
```

### Docker 部署（可選）

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
# 建置映像檔
docker build -t docchat-lite .

# 執行容器
docker run -d -p 8080:80 --name docchat-lite docchat-lite
```

### 本地檔案系統直接使用

最簡單的方式——直接雙擊 `index.html` 在瀏覽器中開啟即可。所有功能均可正常使用（PWA 安裝除外）。

---

## 🤝 貢獻指南

我們歡迎並感謝所有形式的貢獻！無論是提交 Bug 回報、改進建議還是程式碼 PR。

### 提交 PR

1. **Fork** 本倉庫
2. 建立特性分支：`git checkout -b feature/your-feature-name`
3. 提交變更：`git commit -m 'feat: add your feature description'`
4. 推送分支：`git push origin feature/your-feature-name`
5. 提交 **Pull Request**

**PR 規範**：
- 請遵循現有的程式碼風格（IIFE 模組模式、中文註解）
- 每個 PR 盡量只解決一個問題
- 提交資訊請使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式
- 確保不引入任何新的外部依賴

### Issue 回饋

提交 Issue 時，請盡量包含以下資訊：

- **問題描述**：清晰描述遇到的問題或建議
- **重現步驟**：如何重現該問題
- **環境資訊**：瀏覽器名稱及版本、作業系統
- **截圖/錄影**：如有相關截圖或錄影會更有幫助

### 開發環境搭建

```bash
# 1. 克隆倉庫
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 2. 啟動本地伺服器（任選其一）
python3 -m http.server 8080
# 或
npx http-server . -p 8080 --cors

# 3. 在瀏覽器中開啟 http://localhost:8080
# 4. 修改程式碼後重新整理瀏覽器即可看到效果
```

專案結構：

```
DocChat-Lite/
├── index.html          # 主入口頁面
├── manifest.json       # PWA 配置清單
├── css/
│   └── style.css       # 全域樣式
├── js/
│   ├── app.js          # 應用主控制器
│   ├── chat.js         # 對話管理模組
│   ├── parser.js       # 文件解析器
│   ├── search.js       # TF-IDF 搜尋引擎
│   ├── storage.js      # IndexedDB 儲存層
│   ├── ui.js           # UI 渲染模組
│   └── utils.js        # 工具函式庫
├── LICENSE             # MIT 開源協議
└── README.md           # 專案說明文件
```

---

## 📄 開源協議說明

本專案基於 [MIT License](LICENSE) 開源。

```
MIT License

Copyright (c) 2024 DocChat-Lite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

你可以自由使用、修改和分發本專案，但請保留版權宣告和協議文字。

---

## English

## 🎉 Project Introduction

**DocChat-Lite** is a lightweight, zero-dependency document knowledge base chat engine. It is a pure frontend, offline-first web application that lets you transform local documents into a conversational knowledge base — no backend server or database required.

### Pain Points Solved

- **Privacy & Security**: Tired of uploading sensitive documents to third-party cloud services? DocChat-Lite stores all data entirely in your browser locally — nothing ever leaves your device.
- **Deployment Barrier**: Don't want to set up a complex server environment? Simply open `index.html` and you're good to go. Zero configuration, zero installation.
- **Dependency Bloat**: Sick of hundreds of megabytes in `node_modules`? This project doesn't require a single `npm install` — everything is built with vanilla JavaScript.
- **Offline Needs**: Unstable network or need to work offline? IndexedDB persistent storage + PWA support means you can use it anytime, anywhere.

### Self-Developed Differentiators

- **Pure Frontend TF-IDF Search Engine**: A custom-built Chinese-English tokenizer and inverted index engine supporting character-level bigram Chinese segmentation, stop word filtering, TF-IDF relevance scoring, and match highlighting — all without any third-party search library.
- **RAG Conversation Architecture**: Uses a Retrieval-Augmented Generation (RAG) pipeline — first retrieving relevant document snippets via TF-IDF, then injecting them as LLM context for precise, document-grounded Q&A.
- **OpenAI-Compatible API Integration**: Works with any OpenAI-compatible Chat Completions API (including DeepSeek, Ollama, and more), with Server-Sent Events (SSE) streaming for real-time output.
- **Graceful Degradation Without API**: Even without an LLM API configured, the app provides document content summaries based on TF-IDF search results, ensuring basic usability at all times.

### Inspiration

DocChat-Lite was inspired by the concept of document-to-knowledge-base conversion (similar to Google NotebookLM), but this project is **100% independently developed** as a lighter, zero-backend alternative. We believe great tools don't always need complex infrastructure — sometimes, a single browser tab is all you need.

---

## ✨ Core Features

- 🚫 **Zero Dependencies**: No npm packages, frameworks, or build tools — pure vanilla HTML/CSS/JavaScript that runs from a single file
- 📡 **Offline-First**: IndexedDB-based local persistent storage works without an internet connection, with PWA installation support
- 🔍 **TF-IDF Full-Text Search**: Custom-built search engine with Chinese-English hybrid tokenization, inverted index, relevance scoring, and match highlighting
- 📄 **Multi-Format Document Support**: Parse and render TXT, Markdown, JSON, CSV, and HTML files
- 🤖 **LLM-Powered Chat**: OpenAI-compatible API integration with streaming responses, RAG retrieval-augmented generation, and context injection
- 🌗 **Dark/Light Theme**: Built-in dark and light themes with one-click switching and system preference detection
- 📱 **Responsive Design**: Perfectly adapted for desktop and mobile with auto-collapsing sidebar and touch-friendly interactions
- ⌨️ **Keyboard Shortcuts**: `Ctrl+K` to search, `Ctrl+N` for new chat, `Ctrl+O` to open files, `ESC` to close modals
- 🖱️ **Drag & Drop Upload**: Drag files directly onto the upload zone or anywhere on the page for batch document import
- 📦 **Data Export/Import**: One-click export of all documents and chat data as a JSON file, with backup and restore support
- 🔒 **Privacy-First**: API keys are stored only in your local browser; all document data stays on your device
- 🎨 **PWA-Ready**: Built-in Web App Manifest for adding to your home screen with a native app-like experience

---

## 🚀 Quick Start

### Requirements

Any modern browser supporting the following features:

- ES6+ (Promise, async/await, const/let)
- IndexedDB API
- Fetch API
- File API

Recommended: **Chrome 80+**, **Firefox 78+**, **Safari 14+**, **Edge 80+**, or newer.

### Installation & Running

#### Method 1: Direct Open (Simplest)

```bash
# Clone the repository
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# Open directly in your browser
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

> Note: When opening files directly, some features (like PWA) may be restricted due to browser security policies. Using a local server is recommended.

#### Method 2: Local Server

```bash
# Using Python's built-in HTTP server
cd DocChat-Lite
python3 -m http.server 8080

# Or using Node.js http-server
npx http-server . -p 8080

# Or using PHP's built-in server
php -S localhost:8080
```

Then visit `http://localhost:8080` in your browser.

#### Method 3: GitHub Pages Deployment

1. Push the code to your GitHub repository
2. Go to **Settings > Pages** in the repository
3. Set Source to `main` branch, directory `/ (root)`
4. Save and wait for deployment to complete
5. Access via `https://your-username.github.io/DocChat-Lite/`

---

## 📖 Detailed Usage Guide

### Importing Documents

Two methods are available for importing documents:

**Drag & Drop Upload**
- Drag files directly onto the drop zone in the upload modal
- You can also drag files anywhere on the page — the upload modal will open automatically
- Supports batch import of multiple files

**Click to Upload**
- Click the "Upload Document" button in the sidebar or on the welcome page
- In the upload modal, click the drop zone to select files
- Supported formats: `.txt`, `.md`, `.json`, `.csv`, `.html`/`.htm`

### Chatting with Documents

1. **Create a New Chat**: Click the "New Chat" button in the sidebar, or use `Ctrl+N`
2. **Ask a Question**: Type your question in the input field at the bottom
3. **Get Answers**:
   - The system automatically retrieves relevant document content via the TF-IDF search engine
   - If an LLM API is configured, it generates an intelligent answer based on the retrieved results
   - If no API is configured, it displays the relevant document snippets found by search
4. **View Sources**: The number of associated document contexts is displayed during the conversation

### Configuring the LLM API

1. Click the gear icon at the bottom of the sidebar to open the Settings panel
2. Fill in the following under **API Configuration**:
   - **API Endpoint**: An OpenAI-compatible Chat Completions endpoint (e.g., `https://api.openai.com/v1/chat/completions`)
   - **API Key**: Your API key (stored only in your local browser)
   - **Model Name**: e.g., `gpt-3.5-turbo`, `gpt-4`, `deepseek-chat`, etc.
3. Click "Save Settings"

> Tip: DocChat-Lite works with any OpenAI-compatible API, including but not limited to OpenAI, Anthropic (via proxy), DeepSeek, Ollama local models, and more.

### Managing Documents and Chats

- **View Documents**: Click a document name in the "Documents" tab of the sidebar to view its content in the main area
- **Delete Documents**: Hover over a document item and click the delete button that appears
- **View Chats**: Click a chat title in the "Chats" tab of the sidebar to load the conversation history
- **Delete Chats**: Hover over a chat item and click the delete button that appears

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open global search |
| `Ctrl+N` / `Cmd+N` | New chat |
| `Ctrl+O` / `Cmd+O` | Open file picker |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `ESC` | Close modal/dialog |

### Data Backup & Restore

**Export Data**
1. Open the Settings panel
2. Click the "Export Data" button in the "Data Management" section
3. The system will download a JSON file containing all your documents, chats, and settings

**Clear Data**
1. Open the Settings panel
2. Click the "Clear All Data" button in the "Data Management" section
3. After confirmation, all documents and chats will be permanently deleted (irreversible — export a backup first)

---

## 💡 Design Philosophy & Roadmap

### Design Philosophy

- **Offline-First**: Core functionality works without network access; all data is stored locally and available offline
- **Zero Dependencies**: No third-party libraries are introduced, keeping the project extremely lightweight and reducing security risks
- **Privacy-First**: User data never leaves the browser; API keys are stored locally with encryption

### Tech Stack Choices

| Technology | Choice | Rationale |
|------------|--------|-----------|
| Data Storage | IndexedDB | Native browser API supporting large-capacity structured data storage without a backend |
| Search Engine | Custom TF-IDF | Zero dependencies, supports Chinese-English hybrid tokenization, meets document-level retrieval needs |
| Chat Integration | OpenAI-Compatible API | Most mature ecosystem, widest compatibility, supports streaming responses |
| UI Rendering | Vanilla DOM | No framework dependency, extremely lightweight, fast loading |
| Styling | Vanilla CSS + CSS Variables | Supports theme switching, no build step, native browser support |

### Future Plans

- [ ] **PDF Document Support**: Integrate PDF.js for pure frontend PDF text extraction
- [ ] **Collaborative Editing**: Real-time multi-user collaboration based on CRDT algorithms
- [ ] **Plugin System**: Support custom document parsers, search enhancers, and chat plugins
- [ ] **More LLM Providers**: Native support for Anthropic Claude, Google Gemini, and other APIs
- [ ] **Document Tags & Categories**: Add tags to documents with category-based filtering
- [ ] **Chat Export**: Export conversation history to Markdown or PDF format
- [ ] **Semantic Search**: Integrate lightweight embedding models to improve search accuracy

---

## 📦 Packaging & Deployment Guide

DocChat-Lite is a purely static project with no build step required. Here are several common deployment methods:

### GitHub Pages Deployment

```bash
# 1. Clone the repository
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 2. Push to your GitHub repository
git remote set-url origin https://github.com/your-username/DocChat-Lite.git
git push -u origin main

# 3. Enable Pages in the GitHub repository
# Settings > Pages > Source: main branch, / (root)
```

Visit `https://your-username.github.io/DocChat-Lite/` after deployment completes.

### Nginx Static Hosting

```nginx
server {
    listen 80;
    server_name docchat.example.com;
    root /var/www/docchat-lite;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript text/html;
}
```

```bash
# Copy project files to the Nginx directory
sudo cp -r DocChat-Lite/* /var/www/docchat-lite/
sudo nginx -t && sudo nginx -s reload
```

### Docker Deployment (Optional)

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

```bash
# Build the image
docker build -t docchat-lite .

# Run the container
docker run -d -p 8080:80 --name docchat-lite docchat-lite
```

### Local File System Direct Use

The simplest approach — just double-click `index.html` to open it in your browser. All features work normally (except PWA installation).

---

## 🤝 Contributing Guide

We welcome and appreciate contributions of all kinds — whether it's a bug report, a feature suggestion, or a code PR.

### Submitting a PR

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature description'`
4. Push the branch: `git push origin feature/your-feature-name`
5. Submit a **Pull Request**

**PR Guidelines**:
- Follow the existing code style (IIFE module pattern, English comments)
- Each PR should ideally address one issue
- Use [Conventional Commits](https://www.conventionalcommits.org/) format for commit messages
- Ensure no new external dependencies are introduced

### Issue Reporting

When submitting an issue, please include as much of the following as possible:

- **Description**: A clear description of the problem or suggestion
- **Steps to Reproduce**: How to reproduce the issue
- **Environment**: Browser name and version, operating system
- **Screenshots/Recordings**: Relevant screenshots or screen recordings are very helpful

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/DocChat-Lite.git
cd DocChat-Lite

# 2. Start a local server (choose one)
python3 -m http.server 8080
# or
npx http-server . -p 8080 --cors

# 3. Open http://localhost:8080 in your browser
# 4. Edit code and refresh the browser to see changes
```

Project structure:

```
DocChat-Lite/
├── index.html          # Main entry page
├── manifest.json       # PWA manifest
├── css/
│   └── style.css       # Global styles
├── js/
│   ├── app.js          # Main application controller
│   ├── chat.js         # Chat management module
│   ├── parser.js       # Document parser
│   ├── search.js       # TF-IDF search engine
│   ├── storage.js      # IndexedDB storage layer
│   ├── ui.js           # UI rendering module
│   └── utils.js        # Utility functions
├── LICENSE             # MIT license
└── README.md           # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 DocChat-Lite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

You are free to use, modify, and distribute this project, provided you retain the copyright notice and license text.
