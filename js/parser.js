/**
 * DocChat-Lite - Document Parser
 * 文档解析器：支持 TXT, MD, JSON, CSV, HTML 格式解析
 * 返回结构化文本块及元数据
 */

const Parser = (function () {
    'use strict';

    /* ============================
     * TXT 纯文本解析
     * ============================ */
    function parseTXT(content) {
        const lines = content.split('\n');
        const paragraphs = [];
        let currentParagraph = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '') {
                if (currentParagraph.trim()) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = '';
                }
            } else {
                currentParagraph += (currentParagraph ? '\n' : '') + line;
            }
        }

        if (currentParagraph.trim()) {
            paragraphs.push(currentParagraph.trim());
        }

        return {
            type: 'text',
            title: '',
            sections: paragraphs.map(function (text, index) {
                return {
                    type: 'paragraph',
                    level: 0,
                    content: text,
                    index: index,
                };
            }),
            rawContent: content,
            stats: {
                chars: content.length,
                lines: lines.length,
                paragraphs: paragraphs.length,
            },
        };
    }

    /* ============================
     * Markdown 解析
     * ============================ */
    function parseMD(content) {
        const lines = content.split('\n');
        const sections = [];
        let currentSection = null;
        let currentContent = [];
        let inCodeBlock = false;
        let codeBlockContent = '';
        let codeBlockLang = '';
        let title = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 代码块处理
            if (line.trim().startsWith('```')) {
                if (!inCodeBlock) {
                    // 保存当前内容
                    if (currentSection && currentContent.length > 0) {
                        currentSection.content = currentContent.join('\n');
                        sections.push(currentSection);
                        currentContent = [];
                    } else if (currentContent.length > 0) {
                        sections.push({
                            type: 'paragraph',
                            level: 0,
                            content: currentContent.join('\n'),
                            index: sections.length,
                        });
                        currentContent = [];
                    }
                    inCodeBlock = true;
                    codeBlockLang = line.trim().replace('```', '').trim();
                    codeBlockContent = '';
                } else {
                    // 结束代码块
                    sections.push({
                        type: 'code',
                        level: 0,
                        language: codeBlockLang,
                        content: codeBlockContent.trim(),
                        index: sections.length,
                    });
                    inCodeBlock = false;
                    codeBlockContent = '';
                    codeBlockLang = '';
                }
                continue;
            }

            if (inCodeBlock) {
                codeBlockContent += (codeBlockContent ? '\n' : '') + line;
                continue;
            }

            // 标题检测
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                // 保存之前的内容
                if (currentSection && currentContent.length > 0) {
                    currentSection.content = currentContent.join('\n');
                    sections.push(currentSection);
                    currentContent = [];
                } else if (currentContent.length > 0) {
                    sections.push({
                        type: 'paragraph',
                        level: 0,
                        content: currentContent.join('\n'),
                        index: sections.length,
                    });
                    currentContent = [];
                }

                const level = headingMatch[1].length;
                const headingText = headingMatch[2].trim();
                if (!title && level === 1) {
                    title = headingText;
                }
                currentSection = {
                    type: 'heading',
                    level: level,
                    content: headingText,
                    index: sections.length,
                };
                continue;
            }

            // 列表项
            const listMatch = line.match(/^[\-\*]\s+(.+)$/);
            const orderedListMatch = line.match(/^\d+\.\s+(.+)$/);

            if (listMatch || orderedListMatch) {
                const itemText = listMatch ? listMatch[1] : orderedListMatch[1];
                currentContent.push('- ' + itemText);
                continue;
            }

            // 引用
            const quoteMatch = line.match(/^>\s*(.*)$/);
            if (quoteMatch) {
                currentContent.push('> ' + quoteMatch[1]);
                continue;
            }

            // 水平线
            if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
                if (currentContent.length > 0) {
                    if (currentSection) {
                        currentSection.content = currentContent.join('\n');
                        sections.push(currentSection);
                        currentSection = null;
                    } else {
                        sections.push({
                            type: 'paragraph',
                            level: 0,
                            content: currentContent.join('\n'),
                            index: sections.length,
                        });
                    }
                    currentContent = [];
                }
                continue;
            }

            // 普通文本
            if (line.trim() !== '') {
                currentContent.push(line);
            } else if (currentContent.length > 0) {
                if (currentSection) {
                    currentSection.content = currentContent.join('\n');
                    sections.push(currentSection);
                    currentSection = null;
                } else {
                    sections.push({
                        type: 'paragraph',
                        level: 0,
                        content: currentContent.join('\n'),
                        index: sections.length,
                    });
                }
                currentContent = [];
            }
        }

        // 保存最后的内容
        if (inCodeBlock && codeBlockContent) {
            sections.push({
                type: 'code',
                level: 0,
                language: codeBlockLang,
                content: codeBlockContent.trim(),
                index: sections.length,
            });
        } else if (currentSection && currentContent.length > 0) {
            currentSection.content = currentContent.join('\n');
            sections.push(currentSection);
        } else if (currentContent.length > 0) {
            sections.push({
                type: 'paragraph',
                level: 0,
                content: currentContent.join('\n'),
                index: sections.length,
            });
        }

        return {
            type: 'markdown',
            title: title,
            sections: sections,
            rawContent: content,
            stats: {
                chars: content.length,
                lines: lines.length,
                sections: sections.length,
                headings: sections.filter(function (s) { return s.type === 'heading'; }).length,
            },
        };
    }

    /* ============================
     * JSON 解析
     * ============================ */
    function parseJSON(content) {
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (e) {
            return {
                type: 'json',
                title: '',
                sections: [{
                    type: 'paragraph',
                    level: 0,
                    content: 'JSON 解析错误: ' + e.message,
                    index: 0,
                }],
                rawContent: content,
                stats: { chars: content.length, lines: 0, sections: 1 },
                error: e.message,
            };
        }

        const prettyPrint = JSON.stringify(parsed, null, 2);
        const sections = [];

        if (Array.isArray(parsed)) {
            sections.push({
                type: 'paragraph',
                level: 0,
                content: '数组，共 ' + parsed.length + ' 个元素',
                index: sections.length,
            });
            // 每个数组元素作为独立段落
            const limit = Math.min(parsed.length, 50);
            for (let i = 0; i < limit; i++) {
                sections.push({
                    type: 'code',
                    level: 0,
                    language: 'json',
                    content: JSON.stringify(parsed[i], null, 2),
                    index: sections.length,
                });
            }
            if (parsed.length > 50) {
                sections.push({
                    type: 'paragraph',
                    level: 0,
                    content: '... 还有 ' + (parsed.length - 50) + ' 个元素未显示',
                    index: sections.length,
                });
            }
        } else if (typeof parsed === 'object' && parsed !== null) {
            const keys = Object.keys(parsed);
            sections.push({
                type: 'paragraph',
                level: 0,
                content: '对象，共 ' + keys.length + ' 个字段',
                index: sections.length,
            });
            keys.forEach(function (key) {
                const val = parsed[key];
                const valStr = typeof val === 'object'
                    ? JSON.stringify(val, null, 2)
                    : String(val);
                sections.push({
                    type: 'paragraph',
                    level: 2,
                    content: key + ': ' + Utils.truncateText(valStr, 200),
                    index: sections.length,
                });
            });
        } else {
            sections.push({
                type: 'paragraph',
                level: 0,
                content: String(parsed),
                index: sections.length,
            });
        }

        return {
            type: 'json',
            title: '',
            sections: sections,
            rawContent: prettyPrint,
            stats: {
                chars: content.length,
                lines: prettyPrint.split('\n').length,
                sections: sections.length,
            },
            parsed: parsed,
        };
    }

    /* ============================
     * CSV 解析
     * ============================ */
    function parseCSV(content) {
        const lines = content.split('\n').filter(function (line) {
            return line.trim() !== '';
        });

        if (lines.length === 0) {
            return {
                type: 'csv',
                title: '',
                sections: [],
                rawContent: content,
                stats: { chars: content.length, lines: 0, sections: 0 },
            };
        }

        const headers = parseCSVLine(lines[0]);
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length > 0) {
                const row = {};
                headers.forEach(function (header, index) {
                    row[header] = values[index] || '';
                });
                rows.push(row);
            }
        }

        // 生成表格文本描述
        const sections = [];

        // 表头信息
        sections.push({
            type: 'paragraph',
            level: 0,
            content: 'CSV 表格，共 ' + rows.length + ' 行数据，' + headers.length + ' 列',
            index: sections.length,
        });

        // 列名
        sections.push({
            type: 'paragraph',
            level: 2,
            content: '列名: ' + headers.join(', '),
            index: sections.length,
        });

        // 每行数据转为文本
        const limit = Math.min(rows.length, 100);
        for (let i = 0; i < limit; i++) {
            const rowText = headers.map(function (h) {
                return h + ': ' + (rows[i][h] || '');
            }).join('; ');
            sections.push({
                type: 'paragraph',
                level: 0,
                content: rowText,
                index: sections.length,
            });
        }

        if (rows.length > 100) {
            sections.push({
                type: 'paragraph',
                level: 0,
                content: '... 还有 ' + (rows.length - 100) + ' 行数据未显示',
                index: sections.length,
            });
        }

        return {
            type: 'csv',
            title: '',
            sections: sections,
            rawContent: content,
            headers: headers,
            rows: rows,
            stats: {
                chars: content.length,
                lines: lines.length,
                sections: sections.length,
                rows: rows.length,
                columns: headers.length,
            },
        };
    }

    /**
     * 解析单行 CSV（支持引号包裹）
     */
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (inQuotes) {
                if (char === '"' && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
        }

        result.push(current.trim());
        return result;
    }

    /* ============================
     * HTML 解析
     * ============================ */
    function parseHTML(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        // 提取标题
        const titleEl = doc.querySelector('title');
        const title = titleEl ? titleEl.textContent.trim() : '';

        const sections = [];

        // 提取文本内容，保留结构
        function extractNode(node, level) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    sections.push({
                        type: 'paragraph',
                        level: level || 0,
                        content: text,
                        index: sections.length,
                    });
                }
                return;
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const tagName = node.tagName.toLowerCase();
            let newLevel = level || 0;

            if (/^h[1-6]$/.test(tagName)) {
                newLevel = parseInt(tagName.charAt(1));
                const text = node.textContent.trim();
                if (text) {
                    sections.push({
                        type: 'heading',
                        level: newLevel,
                        content: text,
                        index: sections.length,
                    });
                }
                return;
            }

            if (tagName === 'p' || tagName === 'div' || tagName === 'section' || tagName === 'article') {
                const text = node.textContent.trim();
                if (text) {
                    sections.push({
                        type: 'paragraph',
                        level: newLevel,
                        content: Utils.truncateText(text, 500),
                        index: sections.length,
                    });
                }
            } else if (tagName === 'li') {
                const text = node.textContent.trim();
                if (text) {
                    sections.push({
                        type: 'paragraph',
                        level: newLevel,
                        content: '- ' + text,
                        index: sections.length,
                    });
                }
            } else if (tagName === 'pre' || tagName === 'code') {
                const text = node.textContent.trim();
                if (text) {
                    sections.push({
                        type: 'code',
                        level: 0,
                        language: '',
                        content: text,
                        index: sections.length,
                    });
                }
                return;
            } else if (tagName === 'table') {
                // 提取表格内容
                const rows = node.querySelectorAll('tr');
                rows.forEach(function (row) {
                    const cells = row.querySelectorAll('th, td');
                    const cellTexts = [];
                    cells.forEach(function (cell) {
                        cellTexts.push(cell.textContent.trim());
                    });
                    if (cellTexts.length > 0) {
                        sections.push({
                            type: 'paragraph',
                            level: newLevel,
                            content: cellTexts.join(' | '),
                            index: sections.length,
                        });
                    }
                });
                return;
            } else if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                return; // 跳过脚本和样式
            }

            // 递归处理子节点
            const children = node.children;
            if (children && children.length > 0) {
                for (let i = 0; i < children.length; i++) {
                    extractNode(children[i], newLevel);
                }
            }
        }

        extractNode(doc.body, 0);

        // 去重和清理空内容
        const cleaned = [];
        const seen = new Set();
        sections.forEach(function (s) {
            if (s.content && !seen.has(s.content)) {
                seen.add(s.content);
                cleaned.push(s);
            }
        });

        return {
            type: 'html',
            title: title,
            sections: cleaned,
            rawContent: content,
            stats: {
                chars: content.length,
                lines: content.split('\n').length,
                sections: cleaned.length,
            },
        };
    }

    /* ============================
     * 自动检测并解析
     * ============================ */
    function parse(content, fileType) {
        if (!content) {
            return {
                type: fileType || 'unknown',
                title: '',
                sections: [],
                rawContent: '',
                stats: { chars: 0, lines: 0, sections: 0 },
            };
        }

        fileType = fileType || 'text';

        switch (fileType) {
            case 'text':
                return parseTXT(content);
            case 'markdown':
                return parseMD(content);
            case 'json':
                return parseJSON(content);
            case 'csv':
                return parseCSV(content);
            case 'html':
                return parseHTML(content);
            default:
                return parseTXT(content);
        }
    }

    /**
     * 从解析结果中提取纯文本（用于搜索索引）
     */
    function extractPlainText(parsed) {
        if (!parsed || !parsed.sections) return '';
        return parsed.sections.map(function (s) {
            return s.content;
        }).join('\n');
    }

    /**
     * 将解析结果渲染为 HTML（用于文档查看器）
     */
    function renderToHTML(parsed) {
        if (!parsed || !parsed.sections) return '<p>空文档</p>';

        let html = '';

        parsed.sections.forEach(function (section) {
            switch (section.type) {
                case 'heading':
                    const tag = 'h' + Math.min(section.level, 6);
                    html += '<' + tag + '>' + Utils.sanitizeHTML(section.content) + '</' + tag + '>';
                    break;

                case 'code':
                    html += '<pre><code>' + Utils.sanitizeHTML(section.content) + '</code></pre>';
                    break;

                case 'paragraph':
                default:
                    html += '<p>' + Utils.sanitizeHTML(section.content) + '</p>';
                    break;
            }
        });

        return html;
    }

    /**
     * 将 CSV 解析结果渲染为 HTML 表格
     */
    function renderCSVToHTML(parsed) {
        if (!parsed || !parsed.headers || !parsed.rows) {
            return '<p>无数据</p>';
        }

        let html = '<table><thead><tr>';
        parsed.headers.forEach(function (h) {
            html += '<th>' + Utils.sanitizeHTML(h) + '</th>';
        });
        html += '</tr></thead><tbody>';

        const limit = Math.min(parsed.rows.length, 200);
        for (let i = 0; i < limit; i++) {
            html += '<tr>';
            parsed.headers.forEach(function (h) {
                html += '<td>' + Utils.sanitizeHTML(parsed.rows[i][h] || '') + '</td>';
            });
            html += '</tr>';
        }

        html += '</tbody></table>';
        return html;
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        parse: parse,
        parseTXT: parseTXT,
        parseMD: parseMD,
        parseJSON: parseJSON,
        parseCSV: parseCSV,
        parseHTML: parseHTML,
        extractPlainText: extractPlainText,
        renderToHTML: renderToHTML,
        renderCSVToHTML: renderCSVToHTML,
    };
})();
