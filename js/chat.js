/**
 * DocChat-Lite - Chat Module
 * 对话管理：消息历史、LLM API 集成（OpenAI 兼容）、
 * 流式响应（SSE）、上下文构建、系统提示词生成
 */

const Chat = (function () {
    'use strict';

    // 当前对话状态
    let currentChatId = null;
    let isStreaming = false;
    let abortController = null;

    /* ============================
     * 对话管理
     * ============================ */

    /**
     * 创建新对话
     */
    function createChat() {
        return Storage.Chats.create({
            title: '新对话',
            messages: [],
        }).then(function (chat) {
            currentChatId = chat.id;
            return chat;
        });
    }

    /**
     * 获取当前对话
     */
    function getCurrentChat() {
        if (!currentChatId) return Promise.resolve(null);
        return Storage.Chats.get(currentChatId);
    }

    /**
     * 加载对话
     */
    function loadChat(chatId) {
        currentChatId = chatId;
        return Storage.Chats.get(chatId);
    }

    /**
     * 获取所有对话列表
     */
    function getAllChats() {
        return Storage.Chats.getAll();
    }

    /**
     * 删除对话
     */
    function deleteChat(chatId) {
        if (chatId === currentChatId) {
            currentChatId = null;
        }
        return Storage.Chats.delete(chatId);
    }

    /**
     * 获取当前对话 ID
     */
    function getCurrentChatId() {
        return currentChatId;
    }

    /**
     * 设置当前对话 ID
     */
    function setCurrentChatId(chatId) {
        currentChatId = chatId;
    }

    /* ============================
     * 消息发送与 API 调用
     * ============================ */

    /**
     * 发送消息并获取回复
     * @param {string} userMessage - 用户消息
     * @param {function} onChunk - 流式响应回调 (text chunk)
     * @param {function} onDone - 完成回调 (full response)
     * @param {function} onError - 错误回调 (error)
     * @param {object} options - 可选配置
     */
    async function sendMessage(userMessage, onChunk, onDone, onError, options) {
        options = options || {};

        if (isStreaming) {
            onError(new Error('正在等待回复，请稍候'));
            return;
        }

        if (!currentChatId) {
            onError(new Error('没有活跃的对话'));
            return;
        }

        try {
            // 1. 保存用户消息
            const savedUserMsg = await Storage.Chats.addMessage(currentChatId, {
                role: 'user',
                content: userMessage,
            });

            // 2. 搜索相关文档内容作为上下文
            let searchResults = [];
            try {
                searchResults = Search.search(userMessage, {
                    maxResults: options.topK || 5,
                });
            } catch (e) {
                // 搜索失败不影响对话
                console.warn('文档搜索失败:', e);
            }

            // 3. 构建消息历史
            const chat = await Storage.Chats.get(currentChatId);
            const messages = chat ? chat.messages || [] : [];

            // 4. 构建 API 请求消息
            const apiMessages = buildAPIMessages(messages, searchResults);

            // 5. 获取设置
            const settings = await Storage.Settings.getAll();

            if (!settings.apiKey || !settings.apiEndpoint) {
                // 没有配置 API，返回提示消息
                const fallbackMsg = buildFallbackMessage(userMessage, searchResults);
                const savedAssistantMsg = await Storage.Chats.addMessage(currentChatId, {
                    role: 'assistant',
                    content: fallbackMsg,
                    sources: searchResults.map(function (r) { return r.docId; }),
                });
                onDone(fallbackMsg, savedAssistantMsg);
                return;
            }

            // 6. 调用 API
            isStreaming = true;
            abortController = new AbortController();

            const requestBody = {
                model: settings.modelName || 'gpt-3.5-turbo',
                messages: apiMessages,
                max_tokens: settings.maxTokens || 2048,
                temperature: settings.temperature || 0.7,
                stream: true,
            };

            const response = await fetch(settings.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + settings.apiKey,
                },
                body: JSON.stringify(requestBody),
                signal: abortController.signal,
            });

            if (!response.ok) {
                const errorText = await response.text().catch(function () { return ''; });
                let errorMsg = 'API 请求失败 (' + response.status + ')';
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error && errorJson.error.message) {
                        errorMsg = errorJson.error.message;
                    }
                } catch (e) {
                    if (errorText) errorMsg += ': ' + errorText.substring(0, 200);
                }
                throw new Error(errorMsg);
            }

            // 7. 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let buffer = '';

            while (true) {
                const result = await reader.read();
                if (result.done) break;

                buffer += decoder.decode(result.value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line || line === 'data: [DONE]') continue;
                    if (!line.startsWith('data: ')) continue;

                    try {
                        const json = JSON.parse(line.substring(6));
                        const content = json.choices && json.choices[0] && json.choices[0].delta
                            ? json.choices[0].delta.content
                            : null;

                        if (content) {
                            fullResponse += content;
                            onChunk(content, fullResponse);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }

            // 8. 保存助手回复
            isStreaming = false;
            abortController = null;

            if (fullResponse) {
                const savedAssistantMsg = await Storage.Chats.addMessage(currentChatId, {
                    role: 'assistant',
                    content: fullResponse,
                    sources: searchResults.map(function (r) { return r.docId; }),
                });
                onDone(fullResponse, savedAssistantMsg);
            } else {
                onDone('（未收到回复内容）', null);
            }

        } catch (error) {
            isStreaming = false;
            abortController = null;

            if (error.name === 'AbortError') {
                onDone('\n\n[已停止生成]', null);
                return;
            }

            onError(error);
        }
    }

    /**
     * 停止生成
     */
    function stopGeneration() {
        if (abortController) {
            abortController.abort();
            abortController = null;
        }
        isStreaming = false;
    }

    /**
     * 是否正在流式生成
     */
    function getIsStreaming() {
        return isStreaming;
    }

    /* ============================
     * 消息构建
     * ============================ */

    /**
     * 构建 API 请求消息列表
     */
    function buildAPIMessages(historyMessages, searchResults) {
        const messages = [];

        // 系统提示词
        const systemPrompt = buildSystemPrompt(searchResults);
        messages.push({
            role: 'system',
            content: systemPrompt,
        });

        // 历史消息（限制最近 20 条）
        const recentMessages = historyMessages.slice(-20);
        recentMessages.forEach(function (msg) {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }
        });

        return messages;
    }

    /**
     * 构建系统提示词
     */
    function buildSystemPrompt(searchResults) {
        let prompt = '你是 DocChat-Lite 的智能助手，帮助用户基于文档知识库回答问题。\n\n';

        if (searchResults && searchResults.length > 0) {
            prompt += '以下是用户文档中与问题相关的内容，请基于这些内容回答用户的问题。如果文档中没有相关信息，请如实告知。\n\n';
            prompt += '--- 相关文档内容 ---\n\n';

            searchResults.forEach(function (result, index) {
                prompt += '[文档 ' + (index + 1) + '] ' + result.docName + ' (相关度: ' + (result.score * 100).toFixed(1) + '%)\n';
                prompt += result.snippet + '\n\n';
            });

            prompt += '--- 相关文档内容结束 ---\n\n';
            prompt += '回答要求：\n';
            prompt += '1. 优先基于文档内容回答\n';
            prompt += '2. 如果引用了文档内容，请注明来源文档名称\n';
            prompt += '3. 如果文档中没有相关信息，请明确告知\n';
            prompt += '4. 回答简洁清晰，使用 Markdown 格式\n';
        } else {
            prompt += '当前没有找到与用户问题相关的文档内容。\n';
            prompt += '回答要求：\n';
            prompt += '1. 告知用户知识库中暂无相关文档\n';
            prompt += '2. 基于你的通用知识回答（如果有帮助的话）\n';
            prompt += '3. 建议用户上传相关文档以获得更好的回答\n';
        }

        return prompt;
    }

    /**
     * 构建无 API 时的回退消息
     */
    function buildFallbackMessage(userMessage, searchResults) {
        let response = '';

        if (searchResults && searchResults.length > 0) {
            response += '在知识库中找到了以下相关内容：\n\n';
            searchResults.forEach(function (result, index) {
                response += '**' + (index + 1) + '. ' + result.docName + '** (相关度: ' + (result.score * 100).toFixed(1) + '%)\n\n';
                response += result.snippet + '\n\n';
            });
            response += '---\n\n';
            response += '> 提示：配置 API 密钥后可以获得基于文档内容的智能问答。请前往设置页面配置 API。';
        } else {
            response += '未在知识库中找到与您的问题相关的内容。\n\n';
            response += '> 提示：\n';
            response += '> 1. 请确保已上传相关文档\n';
            response += '> 2. 配置 API 密钥后可以获得智能问答能力\n';
            response += '> 3. 前往设置页面进行配置';
        }

        return response;
    }

    /* ============================
     * 对话标题自动生成
     * ============================ */

    /**
     * 根据首条消息更新对话标题
     */
    function updateChatTitle(chatId, title) {
        return Storage.Chats.update(chatId, { title: title });
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        createChat: createChat,
        getCurrentChat: getCurrentChat,
        loadChat: loadChat,
        getAllChats: getAllChats,
        deleteChat: deleteChat,
        getCurrentChatId: getCurrentChatId,
        setCurrentChatId: setCurrentChatId,
        sendMessage: sendMessage,
        stopGeneration: stopGeneration,
        getIsStreaming: getIsStreaming,
        buildSystemPrompt: buildSystemPrompt,
        buildFallbackMessage: buildFallbackMessage,
        updateChatTitle: updateChatTitle,
    };
})();
