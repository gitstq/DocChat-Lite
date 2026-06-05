/**
 * DocChat-Lite - UI Module
 * UI 组件渲染：侧边栏、文档卡片、聊天消息、
 * 文件上传、设置面板、搜索结果、加载状态、Toast 通知
 */

const UI = (function () {
    'use strict';

    // DOM 元素缓存
    const elements = {};

    /* ============================
     * 初始化 DOM 缓存
     * ============================ */
    function cacheElements() {
        elements.app = document.getElementById('app');
        elements.sidebar = document.getElementById('sidebar');
        elements.sidebarOverlay = document.getElementById('sidebar-overlay');
        elements.chatList = document.getElementById('chat-list');
        elements.chatListEmpty = document.getElementById('chat-list-empty');
        elements.docList = document.getElementById('doc-list');
        elements.docListEmpty = document.getElementById('doc-list-empty');
        elements.mainContent = document.getElementById('main-content');
        elements.toolbar = document.getElementById('toolbar');
        elements.toolbarTitle = document.getElementById('toolbar-title');
        elements.viewContainer = document.getElementById('view-container');
        elements.viewWelcome = document.getElementById('view-welcome');
        elements.viewDocument = document.getElementById('view-document');
        elements.viewChat = document.getElementById('view-chat');
        elements.docViewerName = document.getElementById('doc-viewer-name');
        elements.docViewerMeta = document.getElementById('doc-viewer-meta');
        elements.docViewerContent = document.getElementById('doc-viewer-content');
        elements.chatMessages = document.getElementById('chat-messages');
        elements.chatInput = document.getElementById('chat-input');
        elements.chatContextInfo = document.getElementById('chat-context-info');
        elements.chatContextText = document.getElementById('chat-context-text');
        elements.modalSearch = document.getElementById('modal-search');
        elements.searchInput = document.getElementById('search-input');
        elements.searchResults = document.getElementById('search-results');
        elements.searchEmpty = document.getElementById('search-empty');
        elements.modalSettings = document.getElementById('modal-settings');
        elements.modalUpload = document.getElementById('modal-upload');
        elements.modalConfirm = document.getElementById('modal-confirm');
        elements.confirmTitle = document.getElementById('confirm-title');
        elements.confirmMessage = document.getElementById('confirm-message');
        elements.dropZone = document.getElementById('drop-zone');
        elements.fileInput = document.getElementById('file-input');
        elements.uploadList = document.getElementById('upload-list');
        elements.btnConfirmUpload = document.getElementById('btn-confirm-upload');
        elements.toastContainer = document.getElementById('toast-container');
        elements.loadingOverlay = document.getElementById('loading-overlay');
        elements.loadingText = document.getElementById('loading-text');
        elements.hiddenFileInput = document.getElementById('hidden-file-input');

        // 设置表单
        elements.settingApiEndpoint = document.getElementById('setting-api-endpoint');
        elements.settingApiKey = document.getElementById('setting-api-key');
        elements.settingModelName = document.getElementById('setting-model-name');
        elements.settingsStats = document.getElementById('settings-stats');

        // 按钮
        elements.btnNewChat = document.getElementById('btn-new-chat');
        elements.btnUploadFile = document.getElementById('btn-upload-file');
        elements.btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
        elements.btnShowSidebar = document.getElementById('btn-show-sidebar');
        elements.btnSearch = document.getElementById('btn-search');
        elements.btnToolbarSearch = document.getElementById('btn-toolbar-search');
        elements.btnSettings = document.getElementById('btn-settings');
        elements.btnToggleTheme = document.getElementById('btn-toggle-theme');
        elements.btnSend = document.getElementById('btn-send');
        elements.btnCloseSettings = document.getElementById('btn-close-settings');
        elements.btnSaveSettings = document.getElementById('btn-save-settings');
        elements.btnCloseUpload = document.getElementById('btn-cancel-upload');
        elements.btnConfirmUpload = document.getElementById('btn-confirm-upload');
        elements.btnDocDelete = document.getElementById('btn-doc-delete');
        elements.btnToggleApiKey = document.getElementById('btn-toggle-api-key');
        elements.btnExportData = document.getElementById('btn-export-data');
        elements.btnClearData = document.getElementById('btn-clear-data');
        elements.btnConfirmCancel = document.getElementById('btn-confirm-cancel');
        elements.btnConfirmOk = document.getElementById('btn-confirm-ok');
        elements.btnWelcomeUpload = document.getElementById('btn-welcome-upload');
        elements.btnWelcomeChat = document.getElementById('btn-welcome-chat');
    }

    /* ============================
     * 视图切换
     * ============================ */
    function showView(viewName) {
        const views = elements.viewContainer.querySelectorAll('.view');
        views.forEach(function (view) {
            view.classList.remove('active');
        });

        switch (viewName) {
            case 'welcome':
                elements.viewWelcome.classList.add('active');
                elements.toolbarTitle.textContent = 'DocChat-Lite';
                break;
            case 'document':
                elements.viewDocument.classList.add('active');
                break;
            case 'chat':
                elements.viewChat.classList.add('active');
                break;
        }
    }

    /* ============================
     * 侧边栏
     * ============================ */
    function toggleSidebar() {
        if (Utils.isMobile()) {
            const isOpen = !elements.sidebar.classList.contains('collapsed');
            if (isOpen) {
                elements.sidebar.classList.add('collapsed');
                elements.sidebarOverlay.classList.remove('active');
            } else {
                elements.sidebar.classList.remove('collapsed');
                elements.sidebarOverlay.classList.add('active');
            }
        } else {
            elements.sidebar.classList.toggle('collapsed');
        }
    }

    function closeSidebar() {
        if (Utils.isMobile()) {
            elements.sidebar.classList.add('collapsed');
            elements.sidebarOverlay.classList.remove('active');
        }
    }

    function openSidebar() {
        elements.sidebar.classList.remove('collapsed');
        if (Utils.isMobile()) {
            elements.sidebarOverlay.classList.add('active');
        }
    }

    /* ============================
     * 侧边栏标签页切换
     * ============================ */
    function switchSidebarTab(tabName) {
        // 更新标签按钮状态
        const tabs = document.querySelectorAll('.sidebar-tab');
        tabs.forEach(function (tab) {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            }
        });

        // 更新面板显示
        const panels = document.querySelectorAll('.sidebar-panel');
        panels.forEach(function (panel) {
            panel.classList.remove('active');
        });

        const targetPanel = document.getElementById('panel-' + tabName);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    /* ============================
     * 对话列表渲染
     * ============================ */
    function renderChatList(chats, activeChatId) {
        elements.chatList.innerHTML = '';

        if (!chats || chats.length === 0) {
            elements.chatListEmpty.style.display = 'flex';
            elements.chatList.style.display = 'none';
            return;
        }

        elements.chatListEmpty.style.display = 'none';
        elements.chatList.style.display = 'flex';

        chats.forEach(function (chat) {
            const item = createChatItem(chat, chat.id === activeChatId);
            elements.chatList.appendChild(item);
        });
    }

    function createChatItem(chat, isActive) {
        const item = document.createElement('div');
        item.className = 'sidebar-item' + (isActive ? ' active' : '');
        item.dataset.chatId = chat.id;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', chat.title);

        const icon = document.createElement('div');
        icon.className = 'sidebar-item-icon';
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

        const content = document.createElement('div');
        content.className = 'sidebar-item-content';

        const title = document.createElement('div');
        title.className = 'sidebar-item-title';
        title.textContent = chat.title || '新对话';

        const subtitle = document.createElement('div');
        subtitle.className = 'sidebar-item-subtitle';
        subtitle.textContent = Utils.formatRelativeTime(chat.createdAt);

        content.appendChild(title);
        content.appendChild(subtitle);

        const actions = document.createElement('div');
        actions.className = 'sidebar-item-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon';
        deleteBtn.setAttribute('aria-label', '删除对话');
        deleteBtn.setAttribute('data-action', 'delete-chat');
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

        actions.appendChild(deleteBtn);

        item.appendChild(icon);
        item.appendChild(content);
        item.appendChild(actions);

        return item;
    }

    /* ============================
     * 文档列表渲染
     * ============================ */
    function renderDocList(docs) {
        elements.docList.innerHTML = '';

        if (!docs || docs.length === 0) {
            elements.docListEmpty.style.display = 'flex';
            elements.docList.style.display = 'none';
            return;
        }

        elements.docListEmpty.style.display = 'none';
        elements.docList.style.display = 'flex';

        docs.forEach(function (doc) {
            const item = createDocItem(doc);
            elements.docList.appendChild(item);
        });
    }

    function createDocItem(doc) {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.dataset.docId = doc.id;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', doc.name);

        const icon = document.createElement('div');
        icon.className = 'sidebar-item-icon';
        icon.style.background = Utils.getFileTypeColor(doc.type);
        icon.textContent = Utils.getFileTypeLabel(doc.type);

        const content = document.createElement('div');
        content.className = 'sidebar-item-content';

        const title = document.createElement('div');
        title.className = 'sidebar-item-title';
        title.textContent = doc.name;

        const subtitle = document.createElement('div');
        subtitle.className = 'sidebar-item-subtitle';
        subtitle.textContent = Utils.formatFileSize(doc.size) + ' · ' + Utils.formatRelativeTime(doc.updatedAt);

        content.appendChild(title);
        content.appendChild(subtitle);

        const actions = document.createElement('div');
        actions.className = 'sidebar-item-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon';
        deleteBtn.setAttribute('aria-label', '删除文档');
        deleteBtn.setAttribute('data-action', 'delete-doc');
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

        actions.appendChild(deleteBtn);

        item.appendChild(icon);
        item.appendChild(content);
        item.appendChild(actions);

        return item;
    }

    /* ============================
     * 文档查看器
     * ============================ */
    function showDocument(doc) {
        elements.docViewerName.textContent = doc.name;
        elements.docViewerMeta.textContent =
            Utils.getFileTypeLabel(doc.type) + ' · ' +
            Utils.formatFileSize(doc.size) + ' · ' +
            Utils.formatDate(doc.updatedAt, 'YYYY-MM-DD HH:mm');

        const parsed = Parser.parse(doc.content, doc.type);
        let html = '';

        if (parsed.type === 'csv' && parsed.headers) {
            html = Parser.renderCSVToHTML(parsed);
        } else {
            html = Parser.renderToHTML(parsed);
        }

        elements.docViewerContent.innerHTML = html;
        elements.toolbarTitle.textContent = doc.name;
        showView('document');
    }

    /* ============================
     * 聊天消息渲染
     * ============================ */
    function renderChatMessages(messages) {
        elements.chatMessages.innerHTML = '';

        if (!messages || messages.length === 0) {
            elements.chatMessages.innerHTML =
                '<div class="chat-empty">' +
                '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' +
                '</svg>' +
                '<p>开始对话吧</p>' +
                '<p class="text-muted" style="font-size:12px;margin-top:4px;">输入问题，基于文档知识库获取答案</p>' +
                '</div>';
            return;
        }

        messages.forEach(function (msg) {
            const msgEl = createMessageElement(msg);
            elements.chatMessages.appendChild(msgEl);
        });

        scrollToBottom();
    }

    function createMessageElement(msg) {
        const container = document.createElement('div');
        container.className = 'chat-message ' + msg.role;
        container.dataset.msgId = msg.id;

        // 头像
        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        if (msg.role === 'user') {
            avatar.textContent = 'U';
        } else {
            avatar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
        }

        // 气泡
        const bubble = document.createElement('div');
        bubble.className = 'chat-message-bubble';

        if (msg.role === 'assistant') {
            bubble.innerHTML = Utils.markdownToHTML(msg.content);
        } else {
            bubble.textContent = msg.content;
        }

        // 时间
        const meta = document.createElement('div');
        meta.className = 'chat-message-meta';
        meta.textContent = Utils.formatRelativeTime(msg.timestamp);

        container.appendChild(avatar);
        container.appendChild(bubble);
        container.appendChild(meta);

        return container;
    }

    /**
     * 添加用户消息到聊天区域
     */
    function appendUserMessage(msg) {
        // 移除空状态
        const emptyState = elements.chatMessages.querySelector('.chat-empty');
        if (emptyState) {
            emptyState.remove();
        }

        const msgEl = createMessageElement(msg);
        elements.chatMessages.appendChild(msgEl);
        scrollToBottom();
    }

    /**
     * 添加助手消息（流式）
     */
    function appendAssistantMessage() {
        const container = document.createElement('div');
        container.className = 'chat-message assistant';
        container.id = 'streaming-message';

        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';

        const bubble = document.createElement('div');
        bubble.className = 'chat-message-bubble';
        bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

        container.appendChild(avatar);
        container.appendChild(bubble);
        elements.chatMessages.appendChild(container);
        scrollToBottom();

        return bubble;
    }

    /**
     * 更新流式消息内容
     */
    function updateStreamingMessage(bubble, fullText) {
        bubble.innerHTML = Utils.markdownToHTML(fullText);
        scrollToBottom();
    }

    /**
     * 完成流式消息
     */
    function finalizeStreamingMessage(bubble, fullText) {
        bubble.innerHTML = Utils.markdownToHTML(fullText);

        const container = document.getElementById('streaming-message');
        if (container) {
            container.removeAttribute('id');

            const meta = document.createElement('div');
            meta.className = 'chat-message-meta';
            meta.textContent = Utils.formatRelativeTime(new Date());
            container.appendChild(meta);
        }

        scrollToBottom();
    }

    /**
     * 显示停止生成按钮
     */
    function showStopButton() {
        elements.btnSend.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="6" y="4" width="4" height="16"></rect>' +
            '<rect x="14" y="4" width="4" height="16"></rect>' +
            '</svg>';
        elements.btnSend.classList.add('btn-danger');
        elements.btnSend.classList.remove('btn-send');
    }

    /**
     * 恢复发送按钮
     */
    function restoreSendButton() {
        elements.btnSend.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="22" y1="2" x2="11" y2="13"></line>' +
            '<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>' +
            '</svg>';
        elements.btnSend.classList.remove('btn-danger');
        elements.btnSend.classList.add('btn-send');
    }

    function scrollToBottom() {
        requestAnimationFrame(function () {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        });
    }

    /* ============================
     * 搜索模态框
     * ============================ */
    function openSearchModal() {
        elements.modalSearch.classList.add('active');
        elements.searchInput.value = '';
        elements.searchResults.innerHTML = '';
        elements.searchEmpty.style.display = 'none';
        setTimeout(function () {
            elements.searchInput.focus();
        }, 100);
    }

    function closeSearchModal() {
        elements.modalSearch.classList.remove('active');
    }

    function renderSearchResults(results, query) {
        elements.searchResults.innerHTML = '';

        if (!results || results.length === 0) {
            elements.searchEmpty.style.display = 'block';
            elements.searchEmpty.innerHTML = '<p>未找到与 "' + Utils.sanitizeHTML(query) + '" 相关的内容</p>';
            return;
        }

        elements.searchEmpty.style.display = 'none';

        results.forEach(function (result) {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.dataset.docId = result.docId;

            const docLabel = document.createElement('div');
            docLabel.className = 'search-result-doc';
            docLabel.textContent = result.docName;

            const text = document.createElement('div');
            text.className = 'search-result-text';
            text.innerHTML = Search.highlightMatches(Utils.sanitizeHTML(result.snippet), query);

            const score = document.createElement('div');
            score.className = 'search-result-score';
            score.textContent = '相关度: ' + (result.score * 100).toFixed(1) + '%';

            item.appendChild(docLabel);
            item.appendChild(text);
            item.appendChild(score);

            elements.searchResults.appendChild(item);
        });
    }

    /* ============================
     * 设置模态框
     * ============================ */
    function openSettingsModal() {
        elements.modalSettings.classList.add('active');
        loadSettings();
    }

    function closeSettingsModal() {
        elements.modalSettings.classList.remove('active');
    }

    async function loadSettings() {
        try {
            const settings = await Storage.Settings.getAll();
            elements.settingApiEndpoint.value = settings.apiEndpoint || '';
            elements.settingApiKey.value = settings.apiKey || '';
            elements.settingModelName.value = settings.modelName || '';

            // 更新主题选择
            document.querySelectorAll('.theme-option').forEach(function (btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
                if (btn.dataset.theme === settings.theme) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-checked', 'true');
                }
            });

            // 更新统计
            const docCount = await Storage.Documents.count();
            const chatCount = await Storage.Chats.count();
            elements.settingsStats.innerHTML =
                '<div class="stat-item"><div class="stat-value">' + docCount + '</div><div class="stat-label">文档数量</div></div>' +
                '<div class="stat-item"><div class="stat-value">' + chatCount + '</div><div class="stat-label">对话数量</div></div>';
        } catch (e) {
            console.error('加载设置失败:', e);
        }
    }

    async function saveSettings() {
        try {
            const settings = {
                apiEndpoint: elements.settingApiEndpoint.value.trim(),
                apiKey: elements.settingApiKey.value.trim(),
                modelName: elements.settingModelName.value.trim(),
            };

            // 获取当前主题
            const activeTheme = document.querySelector('.theme-option.active');
            if (activeTheme) {
                settings.theme = activeTheme.dataset.theme;
            }

            await Storage.Settings.saveAll(settings);
            showToast('设置已保存', 'success');
            closeSettingsModal();

            // 应用主题
            if (settings.theme) {
                App.setTheme(settings.theme);
            }

            return settings;
        } catch (e) {
            showToast('保存设置失败: ' + e.message, 'error');
            return null;
        }
    }

    /* ============================
     * 上传模态框
     * ============================ */
    let pendingFiles = [];

    function openUploadModal() {
        elements.modalUpload.classList.add('active');
        pendingFiles = [];
        renderUploadList();
        elements.btnConfirmUpload.disabled = true;
    }

    function closeUploadModal() {
        elements.modalUpload.classList.remove('active');
        pendingFiles = [];
        renderUploadList();
    }

    function addFilesToUpload(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const type = Utils.getFileType(file.name);
            if (type === 'unknown') {
                showToast('不支持的文件格式: ' + file.name, 'warning');
                continue;
            }
            // 检查是否已添加
            const exists = pendingFiles.some(function (f) {
                return f.name === file.name && f.size === file.size;
            });
            if (!exists) {
                pendingFiles.push(file);
            }
        }
        renderUploadList();
        elements.btnConfirmUpload.disabled = pendingFiles.length === 0;
    }

    function removeFileFromUpload(index) {
        pendingFiles.splice(index, 1);
        renderUploadList();
        elements.btnConfirmUpload.disabled = pendingFiles.length === 0;
    }

    function renderUploadList() {
        elements.uploadList.innerHTML = '';

        pendingFiles.forEach(function (file, index) {
            const item = document.createElement('div');
            item.className = 'upload-item';

            const icon = document.createElement('div');
            icon.className = 'upload-item-icon';
            icon.style.background = Utils.getFileTypeColor(Utils.getFileType(file.name));
            icon.textContent = Utils.getFileTypeLabel(Utils.getFileType(file.name));

            const info = document.createElement('div');
            info.className = 'upload-item-info';

            const name = document.createElement('div');
            name.className = 'upload-item-name';
            name.textContent = file.name;

            const size = document.createElement('div');
            size.className = 'upload-item-size';
            size.textContent = Utils.formatFileSize(file.size);

            info.appendChild(name);
            info.appendChild(size);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'upload-item-remove';
            removeBtn.setAttribute('aria-label', '移除文件');
            removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            removeBtn.addEventListener('click', function () {
                removeFileFromUpload(index);
            });

            item.appendChild(icon);
            item.appendChild(info);
            item.appendChild(removeBtn);

            elements.uploadList.appendChild(item);
        });
    }

    /* ============================
     * 确认对话框
     * ============================ */
    let confirmCallback = null;

    function showConfirm(title, message, callback) {
        elements.confirmTitle.textContent = title;
        elements.confirmMessage.textContent = message;
        confirmCallback = callback;
        elements.modalConfirm.classList.add('active');
    }

    function closeConfirm() {
        elements.modalConfirm.classList.remove('active');
        confirmCallback = null;
    }

    function executeConfirm() {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        closeConfirm();
    }

    /* ============================
     * Toast 通知
     * ============================ */
    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        };

        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;

        const iconEl = document.createElement('div');
        iconEl.className = 'toast-icon';
        iconEl.innerHTML = icons[type] || icons.info;

        const msgEl = document.createElement('div');
        msgEl.className = 'toast-message';
        msgEl.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', '关闭通知');
        closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        closeBtn.addEventListener('click', function () {
            removeToast(toast);
        });

        toast.appendChild(iconEl);
        toast.appendChild(msgEl);
        toast.appendChild(closeBtn);

        elements.toastContainer.appendChild(toast);

        // 自动移除
        if (duration > 0) {
            setTimeout(function () {
                removeToast(toast);
            }, duration);
        }

        return toast;
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('toast-out');
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /* ============================
     * 加载指示器
     * ============================ */
    function showLoading(text) {
        elements.loadingText.textContent = text || '加载中...';
        elements.loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        elements.loadingOverlay.style.display = 'none';
    }

    /* ============================
     * 主题切换
     * ============================ */
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // 更新图标显示
        const sunIcon = document.querySelector('.icon-sun');
        const moonIcon = document.querySelector('.icon-moon');
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        }

        // 更新 meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1a1a2e' : '#f8f9fc';
        }
    }

    /* ============================
     * 聊天输入框自动高度
     * ============================ */
    function autoResizeInput() {
        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 150) + 'px';
    }

    /* ============================
     * 聊天上下文信息
     * ============================ */
    function showChatContext(docCount) {
        if (docCount > 0) {
            elements.chatContextInfo.style.display = 'flex';
            elements.chatContextText.textContent = '已关联 ' + docCount + ' 个文档上下文';
        } else {
            elements.chatContextInfo.style.display = 'none';
        }
    }

    function hideChatContext() {
        elements.chatContextInfo.style.display = 'none';
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        cacheElements: cacheElements,
        elements: elements,
        showView: showView,
        toggleSidebar: toggleSidebar,
        closeSidebar: closeSidebar,
        openSidebar: openSidebar,
        switchSidebarTab: switchSidebarTab,
        renderChatList: renderChatList,
        renderDocList: renderDocList,
        showDocument: showDocument,
        renderChatMessages: renderChatMessages,
        appendUserMessage: appendUserMessage,
        appendAssistantMessage: appendAssistantMessage,
        updateStreamingMessage: updateStreamingMessage,
        finalizeStreamingMessage: finalizeStreamingMessage,
        showStopButton: showStopButton,
        restoreSendButton: restoreSendButton,
        scrollToBottom: scrollToBottom,
        openSearchModal: openSearchModal,
        closeSearchModal: closeSearchModal,
        renderSearchResults: renderSearchResults,
        openSettingsModal: openSettingsModal,
        closeSettingsModal: closeSettingsModal,
        loadSettings: loadSettings,
        saveSettings: saveSettings,
        openUploadModal: openUploadModal,
        closeUploadModal: closeUploadModal,
        addFilesToUpload: addFilesToUpload,
        removeFileFromUpload: removeFileFromUpload,
        getPendingFiles: function () { return pendingFiles; },
        showConfirm: showConfirm,
        closeConfirm: closeConfirm,
        executeConfirm: executeConfirm,
        showToast: showToast,
        removeToast: removeToast,
        showLoading: showLoading,
        hideLoading: hideLoading,
        setTheme: setTheme,
        autoResizeInput: autoResizeInput,
        showChatContext: showChatContext,
        hideChatContext: hideChatContext,
    };
})();
