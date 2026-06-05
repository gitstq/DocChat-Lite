/**
 * DocChat-Lite - Utility Functions
 * 工具函数模块：防抖、节流、日期格式化、文件大小格式化、
 * 文本截断、HTML 净化、UUID 生成、Markdown 渲染
 */

const Utils = (function () {
    'use strict';

    /* ============================
     * 防抖 (Debounce)
     * ============================ */
    function debounce(fn, delay) {
        let timer = null;
        return function (...args) {
            const context = this;
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    /* ============================
     * 节流 (Throttle)
     * ============================ */
    function throttle(fn, limit) {
        let inThrottle = false;
        return function (...args) {
            const context = this;
            if (!inThrottle) {
                fn.apply(context, args);
                inThrottle = true;
                setTimeout(function () {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /* ============================
     * UUID 生成
     * ============================ */
    function generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /* ============================
     * 日期格式化
     * ============================ */
    function formatDate(date, format) {
        if (!date) return '';
        if (typeof date === 'string' || typeof date === 'number') {
            date = new Date(date);
        }
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return '';
        }

        format = format || 'YYYY-MM-DD HH:mm:ss';

        const pad = function (n) {
            return n < 10 ? '0' + n : String(n);
        };

        const replacements = {
            'YYYY': date.getFullYear(),
            'MM': pad(date.getMonth() + 1),
            'DD': pad(date.getDate()),
            'HH': pad(date.getHours()),
            'mm': pad(date.getMinutes()),
            'ss': pad(date.getSeconds()),
        };

        let result = format;
        for (const key in replacements) {
            if (replacements.hasOwnProperty(key)) {
                result = result.replace(key, replacements[key]);
            }
        }
        return result;
    }

    /**
     * 相对时间格式化（如"3分钟前"）
     */
    function formatRelativeTime(date) {
        if (!date) return '';
        if (typeof date === 'string' || typeof date === 'number') {
            date = new Date(date);
        }
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return '';
        }

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return '刚刚';
        } else if (minutes < 60) {
            return minutes + '分钟前';
        } else if (hours < 24) {
            return hours + '小时前';
        } else if (days < 7) {
            return days + '天前';
        } else if (days < 30) {
            return Math.floor(days / 7) + '周前';
        } else if (days < 365) {
            return Math.floor(days / 30) + '个月前';
        } else {
            return Math.floor(days / 365) + '年前';
        }
    }

    /* ============================
     * 文件大小格式化
     * ============================ */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        if (bytes === undefined || bytes === null) return '未知';

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

        return size + ' ' + units[i];
    }

    /* ============================
     * 文本截断
     * ============================ */
    function truncateText(text, maxLength) {
        if (!text) return '';
        maxLength = maxLength || 100;
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }

    /* ============================
     * HTML 净化（防止 XSS）
     * ============================ */
    function sanitizeHTML(str) {
        if (!str) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return String(str).replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }

    /**
     * 去除 HTML 标签
     */
    function stripHTML(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /* ============================
     * 简易 Markdown 转 HTML
     * ============================ */
    function markdownToHTML(md) {
        if (!md) return '';

        let html = md;

        // 转义 HTML 特殊字符（但保留我们后续添加的标签）
        html = sanitizeHTML(html);

        // 代码块（``` ... ```）
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (match, lang, code) {
            const langAttr = lang ? ' class="language-' + lang + '"' : '';
            return '<pre><code' + langAttr + '>' + code.trim() + '</code></pre>';
        });

        // 行内代码（`...`）
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // 标题（### ...）
        html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // 粗体和斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // 删除线
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // 引用（> ...）
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

        // 无序列表（- 或 * 开头）
        html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // 有序列表（1. 2. 开头）
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // 链接 [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // 水平线
        html = html.replace(/^---$/gm, '<hr>');

        // 段落：将连续的换行转换为段落
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // 包裹在段落中
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    /* ============================
     * 文件类型检测
     * ============================ */
    function getFileType(filename) {
        if (!filename) return 'unknown';
        const ext = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'txt': 'text',
            'md': 'markdown',
            'markdown': 'markdown',
            'json': 'json',
            'csv': 'csv',
            'html': 'html',
            'htm': 'html',
        };
        return typeMap[ext] || 'unknown';
    }

    /**
     * 获取文件类型图标字符
     */
    function getFileTypeLabel(type) {
        const labels = {
            'text': 'TXT',
            'markdown': 'MD',
            'json': 'JSON',
            'csv': 'CSV',
            'html': 'HTML',
            'unknown': 'FILE',
        };
        return labels[type] || 'FILE';
    }

    /**
     * 获取文件类型对应的颜色
     */
    function getFileTypeColor(type) {
        const colors = {
            'text': '#6366f1',
            'markdown': '#8b5cf6',
            'json': '#f59e0b',
            'csv': '#22c55e',
            'html': '#ef4444',
            'unknown': '#6b7280',
        };
        return colors[type] || '#6b7280';
    }

    /* ============================
     * 文本分块
     * ============================ */
    function chunkText(text, chunkSize) {
        if (!text) return [];
        chunkSize = chunkSize || 500;

        const chunks = [];
        const sentences = text.split(/(?<=[。！？.!?\n])/);

        let currentChunk = '';
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim();
            if (!sentence) continue;

            if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /* ============================
     * 深拷贝
     * ============================ */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(function (item) { return deepClone(item); });

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }

    /* ============================
     * 对象合并（浅合并）
     * ============================ */
    function merge(target, source) {
        if (!source) return target;
        if (!target) return source;
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
        return target;
    }

    /* ============================
     * 判断是否为移动设备
     * ============================ */
    function isMobile() {
        return window.innerWidth <= 768;
    }

    /* ============================
     * 事件委托辅助
     * ============================ */
    function delegate(parentEl, selector, eventType, handler) {
        parentEl.addEventListener(eventType, function (e) {
            const target = e.target.closest(selector);
            if (target && parentEl.contains(target)) {
                handler.call(target, e, target);
            }
        });
    }

    /* ============================
     * 读取文件为文本
     * ============================ */
    function readFileAsText(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function (e) {
                resolve(e.target.result);
            };
            reader.onerror = function (e) {
                reject(new Error('文件读取失败: ' + (e.target.error ? e.target.error.message : '未知错误')));
            };
            reader.readAsText(file);
        });
    }

    /* ============================
     * 导出 JSON 下载
     * ============================ */
    function downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'docchat-lite-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ============================
     * 导入 JSON 文件
     * ============================ */
    function importJSON(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject(new Error('JSON 解析失败: ' + err.message));
                }
            };
            reader.onerror = function () {
                reject(new Error('文件读取失败'));
            };
            reader.readAsText(file);
        });
    }

    /* ============================
     * 转义正则表达式特殊字符
     * ============================ */
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /* ============================
     * 计算文本哈希（简易）
     * ============================ */
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        debounce: debounce,
        throttle: throttle,
        generateUUID: generateUUID,
        formatDate: formatDate,
        formatRelativeTime: formatRelativeTime,
        formatFileSize: formatFileSize,
        truncateText: truncateText,
        sanitizeHTML: sanitizeHTML,
        stripHTML: stripHTML,
        markdownToHTML: markdownToHTML,
        getFileType: getFileType,
        getFileTypeLabel: getFileTypeLabel,
        getFileTypeColor: getFileTypeColor,
        chunkText: chunkText,
        deepClone: deepClone,
        merge: merge,
        isMobile: isMobile,
        delegate: delegate,
        readFileAsText: readFileAsText,
        downloadJSON: downloadJSON,
        importJSON: importJSON,
        escapeRegExp: escapeRegExp,
        simpleHash: simpleHash,
    };
})();
