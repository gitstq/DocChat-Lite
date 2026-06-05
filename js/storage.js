/**
 * DocChat-Lite - IndexedDB Storage Layer
 * IndexedDB 存储层：文档、对话、设置的 CRUD 操作
 */

const Storage = (function () {
    'use strict';

    const DB_NAME = 'DocChatLiteDB';
    const DB_VERSION = 1;
    let db = null;

    /* ============================
     * 数据库初始化
     * ============================ */
    function init() {
        return new Promise(function (resolve, reject) {
            if (db) {
                resolve(db);
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {
                const database = event.target.result;

                // 文档存储
                if (!database.objectStoreNames.contains('documents')) {
                    const docStore = database.createObjectStore('documents', { keyPath: 'id' });
                    docStore.createIndex('name', 'name', { unique: false });
                    docStore.createIndex('type', 'type', { unique: false });
                    docStore.createIndex('createdAt', 'createdAt', { unique: false });
                    docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // 对话存储
                if (!database.objectStoreNames.contains('chats')) {
                    const chatStore = database.createObjectStore('chats', { keyPath: 'id' });
                    chatStore.createIndex('title', 'title', { unique: false });
                    chatStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // 设置存储
                if (!database.objectStoreNames.contains('settings')) {
                    database.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = function (event) {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = function (event) {
                reject(new Error('IndexedDB 打开失败: ' + event.target.error));
            };
        });
    }

    /* ============================
     * 通用事务操作
     * ============================ */
    function getTransaction(storeName, mode) {
        if (!db) {
            throw new Error('数据库未初始化');
        }
        const tx = db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    }

    function promisifyRequest(request) {
        return new Promise(function (resolve, reject) {
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    /* ============================
     * 文档 CRUD
     * ============================ */
    const Documents = {
        /**
         * 添加文档
         */
        add: function (doc) {
            return init().then(function () {
                const store = getTransaction('documents', 'readwrite');
                const now = new Date().toISOString();
                const document = {
                    id: doc.id || Utils.generateUUID(),
                    name: doc.name || '未命名文档',
                    content: doc.content || '',
                    type: doc.type || 'text',
                    createdAt: doc.createdAt || now,
                    updatedAt: now,
                    size: doc.size || (doc.content ? doc.content.length : 0),
                };
                return promisifyRequest(store.add(document)).then(function () {
                    return document;
                });
            });
        },

        /**
         * 获取单个文档
         */
        get: function (id) {
            return init().then(function () {
                const store = getTransaction('documents', 'readonly');
                return promisifyRequest(store.get(id));
            });
        },

        /**
         * 获取所有文档（按更新时间降序）
         */
        getAll: function () {
            return init().then(function () {
                const store = getTransaction('documents', 'readonly');
                return promisifyRequest(store.getAll()).then(function (docs) {
                    return docs.sort(function (a, b) {
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    });
                });
            });
        },

        /**
         * 更新文档
         */
        update: function (id, updates) {
            return init().then(function () {
                const store = getTransaction('documents', 'readwrite');
                return promisifyRequest(store.get(id)).then(function (doc) {
                    if (!doc) {
                        throw new Error('文档不存在: ' + id);
                    }
                    const updated = Utils.merge(doc, updates);
                    updated.updatedAt = new Date().toISOString();
                    if (updates.content !== undefined) {
                        updated.size = updates.content.length;
                    }
                    return promisifyRequest(store.put(updated)).then(function () {
                        return updated;
                    });
                });
            });
        },

        /**
         * 删除文档
         */
        delete: function (id) {
            return init().then(function () {
                const store = getTransaction('documents', 'readwrite');
                return promisifyRequest(store.delete(id));
            });
        },

        /**
         * 批量删除文档
         */
        deleteBulk: function (ids) {
            return init().then(function () {
                const store = getTransaction('documents', 'readwrite');
                const promises = ids.map(function (id) {
                    return promisifyRequest(store.delete(id));
                });
                return Promise.all(promises);
            });
        },

        /**
         * 按名称搜索文档
         */
        searchByName: function (keyword) {
            return init().then(function () {
                const store = getTransaction('documents', 'readonly');
                return promisifyRequest(store.getAll()).then(function (docs) {
                    const lower = keyword.toLowerCase();
                    return docs.filter(function (doc) {
                        return doc.name.toLowerCase().indexOf(lower) !== -1;
                    });
                });
            });
        },

        /**
         * 获取文档总数
         */
        count: function () {
            return init().then(function () {
                const store = getTransaction('documents', 'readonly');
                return promisifyRequest(store.count());
            });
        },

        /**
         * 清空所有文档
         */
        clear: function () {
            return init().then(function () {
                const store = getTransaction('documents', 'readwrite');
                return promisifyRequest(store.clear());
            });
        },
    };

    /* ============================
     * 对话 CRUD
     * ============================ */
    const Chats = {
        /**
         * 创建对话
         */
        create: function (chat) {
            return init().then(function () {
                const store = getTransaction('chats', 'readwrite');
                const now = new Date().toISOString();
                const newChat = {
                    id: chat.id || Utils.generateUUID(),
                    title: chat.title || '新对话',
                    messages: chat.messages || [],
                    createdAt: chat.createdAt || now,
                };
                return promisifyRequest(store.add(newChat)).then(function () {
                    return newChat;
                });
            });
        },

        /**
         * 获取单个对话
         */
        get: function (id) {
            return init().then(function () {
                const store = getTransaction('chats', 'readonly');
                return promisifyRequest(store.get(id));
            });
        },

        /**
         * 获取所有对话（按创建时间降序）
         */
        getAll: function () {
            return init().then(function () {
                const store = getTransaction('chats', 'readonly');
                return promisifyRequest(store.getAll()).then(function (chats) {
                    return chats.sort(function (a, b) {
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    });
                });
            });
        },

        /**
         * 更新对话
         */
        update: function (id, updates) {
            return init().then(function () {
                const store = getTransaction('chats', 'readwrite');
                return promisifyRequest(store.get(id)).then(function (chat) {
                    if (!chat) {
                        throw new Error('对话不存在: ' + id);
                    }
                    const updated = Utils.merge(chat, updates);
                    return promisifyRequest(store.put(updated)).then(function () {
                        return updated;
                    });
                });
            });
        },

        /**
         * 添加消息到对话
         */
        addMessage: function (chatId, message) {
            return init().then(function () {
                const store = getTransaction('chats', 'readwrite');
                return promisifyRequest(store.get(chatId)).then(function (chat) {
                    if (!chat) {
                        throw new Error('对话不存在: ' + chatId);
                    }
                    if (!chat.messages) {
                        chat.messages = [];
                    }
                    const msg = {
                        id: Utils.generateUUID(),
                        role: message.role || 'user',
                        content: message.content || '',
                        timestamp: new Date().toISOString(),
                        sources: message.sources || [],
                    };
                    chat.messages.push(msg);

                    // 如果是第一条用户消息，用其内容作为标题
                    if (msg.role === 'user' && chat.messages.filter(function (m) { return m.role === 'user'; }).length === 1) {
                        chat.title = Utils.truncateText(msg.content, 30);
                    }

                    return promisifyRequest(store.put(chat)).then(function () {
                        return msg;
                    });
                });
            });
        },

        /**
         * 删除对话
         */
        delete: function (id) {
            return init().then(function () {
                const store = getTransaction('chats', 'readwrite');
                return promisifyRequest(store.delete(id));
            });
        },

        /**
         * 批量删除对话
         */
        deleteBulk: function (ids) {
            return init().then(function () {
                const store = getTransaction('chats', 'readwrite');
                const promises = ids.map(function (id) {
                    return promisifyRequest(store.delete(id));
                });
                return Promise.all(promises);
            });
        },

        /**
         * 获取对话总数
         */
        count: function () {
            return init().then(function () {
                const store = getTransaction('chats', 'readonly');
                return promisifyRequest(store.count());
            });
        },

        /**
         * 清空所有对话
         */
        clear: function () {
            return init().then(function () {
                const store = getTransaction('chats', 'readwrite');
                return promisifyRequest(store.clear());
            });
        },
    };

    /* ============================
     * 设置管理
     * ============================ */
    const Settings = {
        /**
         * 默认设置
         */
        defaults: {
            apiKey: '',
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            modelName: 'gpt-3.5-turbo',
            theme: 'dark',
            language: 'zh-CN',
            maxTokens: 2048,
            temperature: 0.7,
            topK: 5,
        },

        /**
         * 获取单个设置项
         */
        get: function (key) {
            return init().then(function () {
                const store = getTransaction('settings', 'readonly');
                return promisifyRequest(store.get(key)).then(function (result) {
                    if (result) {
                        return result.value;
                    }
                    return Settings.defaults[key] !== undefined ? Settings.defaults[key] : null;
                });
            });
        },

        /**
         * 设置单个设置项
         */
        set: function (key, value) {
            return init().then(function () {
                const store = getTransaction('settings', 'readwrite');
                return promisifyRequest(store.put({ key: key, value: value }));
            });
        },

        /**
         * 获取所有设置
         */
        getAll: function () {
            return init().then(function () {
                const store = getTransaction('settings', 'readonly');
                return promisifyRequest(store.getAll()).then(function (results) {
                    const settings = Utils.deepClone(Settings.defaults);
                    results.forEach(function (item) {
                        settings[item.key] = item.value;
                    });
                    return settings;
                });
            });
        },

        /**
         * 批量保存设置
         */
        saveAll: function (settingsObj) {
            return init().then(function () {
                const store = getTransaction('settings', 'readwrite');
                const promises = [];
                for (const key in settingsObj) {
                    if (settingsObj.hasOwnProperty(key)) {
                        promises.push(
                            promisifyRequest(store.put({ key: key, value: settingsObj[key] }))
                        );
                    }
                }
                return Promise.all(promises).then(function () {
                    return settingsObj;
                });
            });
        },

        /**
         * 重置设置为默认值
         */
        reset: function () {
            return Settings.saveAll(Utils.deepClone(Settings.defaults));
        },
    };

    /* ============================
     * 数据导出/导入
     * ============================ */
    function exportAll() {
        return Promise.all([
            Documents.getAll(),
            Chats.getAll(),
            Settings.getAll(),
        ]).then(function (results) {
            return {
                version: DB_VERSION,
                exportedAt: new Date().toISOString(),
                documents: results[0],
                chats: results[1],
                settings: results[2],
            };
        });
    }

    function importAll(data) {
        if (!data || !data.documents || !data.chats) {
            return Promise.reject(new Error('无效的导入数据格式'));
        }

        return init().then(function () {
            const promises = [];

            // 导入文档
            data.documents.forEach(function (doc) {
                promises.push(Documents.add(doc));
            });

            // 导入对话
            data.chats.forEach(function (chat) {
                promises.push(Chats.create(chat));
            });

            // 导入设置
            if (data.settings) {
                promises.push(Settings.saveAll(data.settings));
            }

            return Promise.all(promises);
        });
    }

    function clearAll() {
        return Promise.all([
            Documents.clear(),
            Chats.clear(),
        ]);
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        init: init,
        Documents: Documents,
        Chats: Chats,
        Settings: Settings,
        exportAll: exportAll,
        importAll: importAll,
        clearAll: clearAll,
    };
})();
