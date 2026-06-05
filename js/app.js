/**
 * DocChat-Lite - Main Application Controller
 * 应用主控制器：初始化、路由、状态管理、模块协调、键盘快捷键
 */

const App = (function () {
    'use strict';

    // 应用状态
    let state = {
        initialized: false,
        currentView: 'welcome',  // welcome | document | chat
        currentDocId: null,
        currentChatId: null,
        activeSidebarTab: 'chats', // chats | docs
        theme: 'dark',
    };

    /* ============================
     * 应用初始化
     * ============================ */
    async function init() {
        try {
            // 1. 缓存 DOM 元素
            UI.cacheElements();

            // 2. 初始化 IndexedDB
            await Storage.init();

            // 3. 加载设置
            const settings = await Storage.Settings.getAll();
            state.theme = settings.theme || 'dark';
            UI.setTheme(state.theme);

            // 4. 加载数据
            await refreshChatList();
            await refreshDocList();

            // 5. 构建搜索索引
            await rebuildSearchIndex();

            // 6. 绑定事件
            bindEvents();

            // 7. 移动端默认收起侧边栏
            if (Utils.isMobile()) {
                UI.elements.sidebar.classList.add('collapsed');
            }

            // 8. 显示欢迎视图
            UI.showView('welcome');

            state.initialized = true;
            console.log('DocChat-Lite 初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            UI.showToast('应用初始化失败: ' + error.message, 'error', 5000);
        }
    }

    /* ============================
     * 数据刷新
     * ============================ */
    async function refreshChatList() {
        try {
            const chats = await Storage.Chats.getAll();
            UI.renderChatList(chats, state.currentChatId);
        } catch (e) {
            console.error('刷新对话列表失败:', e);
        }
    }

    async function refreshDocList() {
        try {
            const docs = await Storage.Documents.getAll();
            UI.renderDocList(docs);
        } catch (e) {
            console.error('刷新文档列表失败:', e);
        }
    }

    async function rebuildSearchIndex() {
        try {
            const docs = await Storage.Documents.getAll();
            Search.buildIndex(docs);
        } catch (e) {
            console.error('重建搜索索引失败:', e);
        }
    }

    /* ============================
     * 事件绑定
     * ============================ */
    function bindEvents() {
        // --- 侧边栏 ---
        UI.elements.btnToggleSidebar.addEventListener('click', function () {
            UI.toggleSidebar();
        });

        UI.elements.btnShowSidebar.addEventListener('click', function () {
            UI.openSidebar();
        });

        UI.elements.sidebarOverlay.addEventListener('click', function () {
            UI.closeSidebar();
        });

        // --- 侧边栏标签页 ---
        document.querySelectorAll('.sidebar-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                const tabName = this.dataset.tab;
                state.activeSidebarTab = tabName;
                UI.switchSidebarTab(tabName);
            });
        });

        // --- 新建对话 ---
        UI.elements.btnNewChat.addEventListener('click', function () {
            handleNewChat();
        });

        UI.elements.btnWelcomeChat.addEventListener('click', function () {
            handleNewChat();
        });

        // --- 上传文档 ---
        UI.elements.btnUploadFile.addEventListener('click', function () {
            UI.openUploadModal();
        });

        UI.elements.btnWelcomeUpload.addEventListener('click', function () {
            UI.openUploadModal();
        });

        // --- 侧边栏列表事件委托 ---
        UI.elements.chatList.addEventListener('click', function (e) {
            const deleteBtn = e.target.closest('[data-action="delete-chat"]');
            if (deleteBtn) {
                e.stopPropagation();
                const item = deleteBtn.closest('.sidebar-item');
                const chatId = item ? item.dataset.chatId : null;
                if (chatId) {
                    handleDeleteChat(chatId);
                }
                return;
            }

            const item = e.target.closest('.sidebar-item');
            if (item && item.dataset.chatId) {
                handleOpenChat(item.dataset.chatId);
            }
        });

        // 键盘导航支持
        UI.elements.chatList.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.sidebar-item');
                if (item && item.dataset.chatId) {
                    e.preventDefault();
                    handleOpenChat(item.dataset.chatId);
                }
            }
        });

        UI.elements.docList.addEventListener('click', function (e) {
            const deleteBtn = e.target.closest('[data-action="delete-doc"]');
            if (deleteBtn) {
                e.stopPropagation();
                const item = deleteBtn.closest('.sidebar-item');
                const docId = item ? item.dataset.docId : null;
                if (docId) {
                    handleDeleteDoc(docId);
                }
                return;
            }

            const item = e.target.closest('.sidebar-item');
            if (item && item.dataset.docId) {
                handleOpenDoc(item.dataset.docId);
            }
        });

        UI.elements.docList.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.sidebar-item');
                if (item && item.dataset.docId) {
                    e.preventDefault();
                    handleOpenDoc(item.dataset.docId);
                }
            }
        });

        // --- 搜索 ---
        UI.elements.btnSearch.addEventListener('click', function () {
            UI.openSearchModal();
        });

        UI.elements.btnToolbarSearch.addEventListener('click', function () {
            UI.openSearchModal();
        });

        UI.elements.searchInput.addEventListener('input', Utils.debounce(function () {
            handleSearch(this.value);
        }, 300));

        // 搜索结果点击
        UI.elements.searchResults.addEventListener('click', function (e) {
            const item = e.target.closest('.search-result-item');
            if (item && item.dataset.docId) {
                UI.closeSearchModal();
                handleOpenDoc(item.dataset.docId);
            }
        });

        // --- 设置 ---
        UI.elements.btnSettings.addEventListener('click', function () {
            UI.openSettingsModal();
        });

        UI.elements.btnCloseSettings.addEventListener('click', function () {
            UI.closeSettingsModal();
        });

        UI.elements.btnSaveSettings.addEventListener('click', function () {
            UI.saveSettings();
        });

        // API 密钥显示/隐藏
        UI.elements.btnToggleApiKey.addEventListener('click', function () {
            const input = UI.elements.settingApiKey;
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
        });

        // 主题选择
        document.querySelectorAll('.theme-option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.theme-option').forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-checked', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-checked', 'true');
            });
        });

        // 导出数据
        UI.elements.btnExportData.addEventListener('click', async function () {
            try {
                const data = await Storage.exportAll();
                Utils.downloadJSON(data, 'docchat-lite-backup-' + Utils.formatDate(new Date(), 'YYYYMMDD-HHmmss') + '.json');
                UI.showToast('数据导出成功', 'success');
            } catch (e) {
                UI.showToast('导出失败: ' + e.message, 'error');
            }
        });

        // 清除数据
        UI.elements.btnClearData.addEventListener('click', function () {
            UI.showConfirm(
                '清除所有数据',
                '确定要删除所有文档和对话吗？此操作不可撤销。',
                async function () {
                    try {
                        await Storage.clearAll();
                        await rebuildSearchIndex();
                        await refreshChatList();
                        await refreshDocList();
                        state.currentView = 'welcome';
                        state.currentDocId = null;
                        state.currentChatId = null;
                        Chat.setCurrentChatId(null);
                        UI.showView('welcome');
                        UI.showToast('所有数据已清除', 'success');
                    } catch (e) {
                        UI.showToast('清除失败: ' + e.message, 'error');
                    }
                }
            );
        });

        // --- 主题切换 ---
        UI.elements.btnToggleTheme.addEventListener('click', function () {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        // --- 文件上传 ---
        UI.elements.dropZone.addEventListener('click', function () {
            UI.elements.fileInput.click();
        });

        UI.elements.dropZone.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                UI.elements.fileInput.click();
            }
        });

        UI.elements.fileInput.addEventListener('change', function () {
            if (this.files && this.files.length > 0) {
                UI.addFilesToUpload(this.files);
                this.value = ''; // 重置以允许重复选择
            }
        });

        // 拖放
        UI.elements.dropZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('drag-over');
        });

        UI.elements.dropZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
        });

        UI.elements.dropZone.addEventListener('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                UI.addFilesToUpload(e.dataTransfer.files);
            }
        });

        // 上传确认
        UI.elements.btnConfirmUpload.addEventListener('click', function () {
            handleFileUpload();
        });

        // 上传取消
        document.getElementById('btn-cancel-upload').addEventListener('click', function () {
            UI.closeUploadModal();
        });

        document.getElementById('btn-close-upload').addEventListener('click', function () {
            UI.closeUploadModal();
        });

        // --- 文档删除 ---
        UI.elements.btnDocDelete.addEventListener('click', function () {
            if (state.currentDocId) {
                handleDeleteDoc(state.currentDocId);
            }
        });

        // --- 聊天输入 ---
        UI.elements.chatInput.addEventListener('input', function () {
            UI.autoResizeInput();
            // 启用/禁用发送按钮
            UI.elements.btnSend.disabled = !this.value.trim();
        });

        UI.elements.chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        UI.elements.btnSend.addEventListener('click', function () {
            if (Chat.getIsStreaming()) {
                Chat.stopGeneration();
                UI.restoreSendButton();
            } else {
                handleSendMessage();
            }
        });

        // --- 确认对话框 ---
        UI.elements.btnConfirmCancel.addEventListener('click', function () {
            UI.closeConfirm();
        });

        UI.elements.btnConfirmOk.addEventListener('click', function () {
            UI.executeConfirm();
        });

        // --- 模态框背景点击关闭 ---
        document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
            backdrop.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // --- 全局拖放（整个页面） ---
        document.body.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        document.body.addEventListener('drop', function (e) {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                // 检查是否有支持的文件
                let hasValidFile = false;
                for (let i = 0; i < e.dataTransfer.files.length; i++) {
                    const type = Utils.getFileType(e.dataTransfer.files[i].name);
                    if (type !== 'unknown') {
                        hasValidFile = true;
                        break;
                    }
                }
                if (hasValidFile) {
                    UI.openUploadModal();
                    UI.addFilesToUpload(e.dataTransfer.files);
                }
            }
        });

        // --- 键盘快捷键 ---
        document.addEventListener('keydown', function (e) {
            // Ctrl+K: 搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                UI.openSearchModal();
            }

            // Ctrl+N: 新建对话
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                handleNewChat();
            }

            // Ctrl+O: 打开文件
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                UI.elements.hiddenFileInput.click();
            }

            // ESC: 关闭模态框
            if (e.key === 'Escape') {
                if (UI.elements.modalSearch.classList.contains('active')) {
                    UI.closeSearchModal();
                } else if (UI.elements.modalSettings.classList.contains('active')) {
                    UI.closeSettingsModal();
                } else if (UI.elements.modalUpload.classList.contains('active')) {
                    UI.closeUploadModal();
                } else if (UI.elements.modalConfirm.classList.contains('active')) {
                    UI.closeConfirm();
                } else if (Utils.isMobile() && !UI.elements.sidebar.classList.contains('collapsed')) {
                    UI.closeSidebar();
                }
            }
        });

        // 隐藏文件输入（快捷键触发）
        UI.elements.hiddenFileInput.addEventListener('change', async function () {
            if (this.files && this.files.length > 0) {
                await processFiles(this.files);
                this.value = '';
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', Utils.debounce(function () {
            if (!Utils.isMobile()) {
                UI.elements.sidebarOverlay.classList.remove('active');
                UI.elements.sidebar.classList.remove('collapsed');
            }
        }, 200));
    }

    /* ============================
     * 事件处理函数
     * ============================ */

    /**
     * 新建对话
     */
    async function handleNewChat() {
        try {
            const chat = await Chat.createChat();
            state.currentChatId = chat.id;
            state.currentView = 'chat';

            UI.showView('chat');
            UI.renderChatMessages([]);
            UI.toolbarTitle.textContent = chat.title;
            UI.hideChatContext();
            UI.elements.chatInput.value = '';
            UI.elements.btnSend.disabled = true;
            UI.autoResizeInput();

            await refreshChatList();
            UI.closeSidebar();

            // 聚焦输入框
            setTimeout(function () {
                UI.elements.chatInput.focus();
            }, 100);
        } catch (e) {
            UI.showToast('创建对话失败: ' + e.message, 'error');
        }
    }

    /**
     * 打开对话
     */
    async function handleOpenChat(chatId) {
        try {
            const chat = await Chat.loadChat(chatId);
            if (!chat) {
                UI.showToast('对话不存在', 'warning');
                return;
            }

            state.currentChatId = chatId;
            state.currentView = 'chat';

            UI.showView('chat');
            UI.renderChatMessages(chat.messages || []);
            UI.toolbarTitle.textContent = chat.title;
            UI.hideChatContext();
            UI.elements.chatInput.value = '';
            UI.elements.btnSend.disabled = true;
            UI.autoResizeInput();

            await refreshChatList();
            UI.closeSidebar();

            setTimeout(function () {
                UI.elements.chatInput.focus();
            }, 100);
        } catch (e) {
            UI.showToast('加载对话失败: ' + e.message, 'error');
        }
    }

    /**
     * 删除对话
     */
    async function handleDeleteChat(chatId) {
        UI.showConfirm(
            '删除对话',
            '确定要删除这个对话吗？删除后无法恢复。',
            async function () {
                try {
                    await Chat.deleteChat(chatId);
                    if (state.currentChatId === chatId) {
                        state.currentChatId = null;
                        state.currentView = 'welcome';
                        UI.showView('welcome');
                    }
                    await refreshChatList();
                    UI.showToast('对话已删除', 'success');
                } catch (e) {
                    UI.showToast('删除失败: ' + e.message, 'error');
                }
            }
        );
    }

    /**
     * 打开文档
     */
    async function handleOpenDoc(docId) {
        try {
            const doc = await Storage.Documents.get(docId);
            if (!doc) {
                UI.showToast('文档不存在', 'warning');
                return;
            }

            state.currentDocId = docId;
            state.currentView = 'document';
            UI.showDocument(doc);
            UI.closeSidebar();
        } catch (e) {
            UI.showToast('加载文档失败: ' + e.message, 'error');
        }
    }

    /**
     * 删除文档
     */
    async function handleDeleteDoc(docId) {
        UI.showConfirm(
            '删除文档',
            '确定要删除这个文档吗？删除后无法恢复。',
            async function () {
                try {
                    await Storage.Documents.delete(docId);
                    Search.removeFromIndex(docId);
                    if (state.currentDocId === docId) {
                        state.currentDocId = null;
                        state.currentView = 'welcome';
                        UI.showView('welcome');
                    }
                    await refreshDocList();
                    UI.showToast('文档已删除', 'success');
                } catch (e) {
                    UI.showToast('删除失败: ' + e.message, 'error');
                }
            }
        );
    }

    /**
     * 发送消息
     */
    async function handleSendMessage() {
        const input = UI.elements.chatInput;
        const message = input.value.trim();

        if (!message) return;
        if (Chat.getIsStreaming()) return;
        if (!state.currentChatId) {
            // 自动创建对话
            await handleNewChat();
            if (!state.currentChatId) return;
        }

        // 清空输入框
        input.value = '';
        UI.autoResizeInput();
        UI.elements.btnSend.disabled = true;

        // 显示用户消息
        const userMsg = {
            id: Utils.generateUUID(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };
        UI.appendUserMessage(userMsg);

        // 显示助手消息占位
        const bubble = UI.appendAssistantMessage();
        UI.showStopButton();

        // 搜索并显示上下文
        try {
            const results = Search.search(message, { maxResults: 5 });
            if (results.length > 0) {
                UI.showChatContext(results.length);
            } else {
                UI.hideChatContext();
            }
        } catch (e) {
            UI.hideChatContext();
        }

        // 发送消息到 API
        await Chat.sendMessage(
            message,
            // onChunk
            function (chunk, fullText) {
                UI.updateStreamingMessage(bubble, fullText);
            },
            // onDone
            function (fullText, savedMsg) {
                UI.finalizeStreamingMessage(bubble, fullText);
                UI.restoreSendButton();
                refreshChatList();
            },
            // onError
            function (error) {
                const errorText = '抱歉，发生错误: ' + error.message;
                UI.finalizeStreamingMessage(bubble, errorText);
                UI.restoreSendButton();
                UI.showToast('发送失败: ' + error.message, 'error');
            }
        );
    }

    /**
     * 搜索处理
     */
    function handleSearch(query) {
        query = query.trim();
        if (!query) {
            UI.elements.searchResults.innerHTML = '';
            UI.elements.searchEmpty.style.display = 'none';
            return;
        }

        const results = Search.search(query, { maxResults: 10 });
        UI.renderSearchResults(results, query);
    }

    /**
     * 文件上传处理
     */
    async function handleFileUpload() {
        const files = UI.getPendingFiles();
        if (files.length === 0) return;

        UI.showLoading('正在上传文档...');

        try {
            await processFiles(files);
            UI.closeUploadModal();
            UI.showToast('成功上传 ' + files.length + ' 个文档', 'success');
        } catch (e) {
            UI.showToast('上传失败: ' + e.message, 'error');
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 处理文件（读取、解析、存储、索引）
     */
    async function processFiles(files) {
        const processed = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const content = await Utils.readFileAsText(file);
                const type = Utils.getFileType(file.name);

                const doc = await Storage.Documents.add({
                    name: file.name,
                    content: content,
                    type: type,
                    size: file.size,
                });

                // 添加到搜索索引
                Search.addToIndex(doc);

                processed.push(doc);
            } catch (e) {
                errors.push(file.name + ': ' + e.message);
            }
        }

        // 刷新文档列表
        await refreshDocList();

        if (errors.length > 0) {
            UI.showToast(errors.length + ' 个文件上传失败', 'warning');
        }

        return processed;
    }

    /* ============================
     * 主题管理
     * ============================ */
    function setTheme(theme) {
        state.theme = theme;
        UI.setTheme(theme);
        Storage.Settings.set('theme', theme);
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        init: init,
        setTheme: setTheme,
        refreshChatList: refreshChatList,
        refreshDocList: refreshDocList,
        rebuildSearchIndex: rebuildSearchIndex,
    };
})();

/* ============================
 * 启动应用
 * ============================ */
document.addEventListener('DOMContentLoaded', function () {
    App.init();
});
