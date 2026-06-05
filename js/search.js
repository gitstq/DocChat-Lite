/**
 * DocChat-Lite - TF-IDF Search Engine
 * 纯 JS 实现的 TF-IDF 全文搜索引擎
 * 支持中文文本分词（字符级 bigram）
 */

const Search = (function () {
    'use strict';

    // 搜索索引
    let index = {
        documents: {},    // docId -> { tokens, tokenCount }
        invertedIndex: {}, // token -> { docId: { positions: [], tf: number } }
        idf: {},          // token -> idf value
        docCount: 0,
        isBuilt: false,
    };

    /* ============================
     * 文本分词
     * 支持英文（空格分词）和中文（字符级 bigram）
     * ============================ */
    function tokenize(text) {
        if (!text) return [];

        const tokens = [];
        // 将文本按空格和标点拆分
        const segments = text.split(/[\s,.\-;:!?()\[\]{}"'\/\\<>@#$%^&*+=~`|，。；：！？（）【】《》、""''…—\n\r\t]+/);

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i].trim().toLowerCase();
            if (!segment) continue;

            // 判断是否包含中文字符
            const hasChinese = /[\u4e00-\u9fff]/.test(segment);

            if (hasChinese) {
                // 中文：使用字符级 bigram + 单字
                const chars = segment.split('');
                // 添加单字
                for (let j = 0; j < chars.length; j++) {
                    if (/[\u4e00-\u9fff]/.test(chars[j])) {
                        tokens.push(chars[j]);
                    }
                }
                // 添加 bigram
                for (let j = 0; j < chars.length - 1; j++) {
                    if (/[\u4e00-\u9fff]/.test(chars[j]) && /[\u4e00-\u9fff]/.test(chars[j + 1])) {
                        tokens.push(chars[j] + chars[j + 1]);
                    }
                }
                // 如果混合了英文，也添加整体
                const englishParts = segment.match(/[a-zA-Z0-9]+/g);
                if (englishParts) {
                    for (let j = 0; j < englishParts.length; j++) {
                        if (englishParts[j].length > 1) {
                            tokens.push(englishParts[j].toLowerCase());
                        }
                    }
                }
            } else {
                // 纯英文/数字：直接作为 token
                if (segment.length > 0) {
                    tokens.push(segment);
                }
            }
        }

        return tokens;
    }

    /* ============================
     * 停用词过滤
     * ============================ */
    const STOP_WORDS = new Set([
        // 英文停用词
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
        'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
        'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
        'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
        'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
        'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
        'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'down',
        'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you',
        'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them',
        'their', 'what', 'which', 'who', 'whom',
        // 中文停用词
        '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一',
        '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着',
        '没有', '看', '好', '自己', '这', '他', '她', '它', '们', '那', '些',
        '什么', '怎么', '如何', '可以', '因为', '所以', '但是', '而且', '或者',
        '如果', '虽然', '已经', '还是', '这个', '那个', '这些', '那些', '没',
        '把', '被', '让', '给', '从', '对', '与', '等', '能', '得', '地',
    ]);

    function filterStopWords(tokens) {
        return tokens.filter(function (token) {
            return token.length > 0 && !STOP_WORDS.has(token);
        });
    }

    /* ============================
     * 构建倒排索引
     * ============================ */
    function buildIndex(documents) {
        // documents: [{ id, name, content, type, ... }, ...]
        index = {
            documents: {},
            invertedIndex: {},
            idf: {},
            docCount: 0,
            isBuilt: false,
        };

        if (!documents || documents.length === 0) {
            return;
        }

        index.docCount = documents.length;

        // 对每个文档进行分词并构建索引
        documents.forEach(function (doc) {
            const text = doc.content || '';
            const tokens = filterStopWords(tokenize(text));
            const tokenCount = {};

            // 统计词频
            tokens.forEach(function (token, position) {
                if (!tokenCount[token]) {
                    tokenCount[token] = 0;
                }
                tokenCount[token]++;

                // 构建倒排索引
                if (!index.invertedIndex[token]) {
                    index.invertedIndex[token] = {};
                }
                if (!index.invertedIndex[token][doc.id]) {
                    index.invertedIndex[token][doc.id] = {
                        positions: [],
                        tf: 0,
                    };
                }
                index.invertedIndex[token][doc.id].positions.push(position);
            });

            // 计算每个 token 的 TF
            for (const token in tokenCount) {
                if (tokenCount.hasOwnProperty(token)) {
                    const tf = tokenCount[token] / tokens.length;
                    if (index.invertedIndex[token] && index.invertedIndex[token][doc.id]) {
                        index.invertedIndex[token][doc.id].tf = tf;
                    }
                }
            }

            // 保存文档信息
            index.documents[doc.id] = {
                id: doc.id,
                name: doc.name,
                type: doc.type,
                tokens: tokens,
                tokenCount: tokenCount,
                totalTokens: tokens.length,
            };
        });

        // 计算 IDF
        for (const token in index.invertedIndex) {
            if (index.invertedIndex.hasOwnProperty(token)) {
                const docFreq = Object.keys(index.invertedIndex[token]).length;
                index.idf[token] = Math.log((index.docCount + 1) / (docFreq + 1)) + 1;
            }
        }

        index.isBuilt = true;
    }

    /* ============================
     * TF-IDF 搜索
     * ============================ */
    function search(query, options) {
        options = options || {};
        const maxResults = options.maxResults || 10;
        const minScore = options.minScore || 0.01;

        if (!index.isBuilt || !query) {
            return [];
        }

        const queryTokens = filterStopWords(tokenize(query));
        if (queryTokens.length === 0) {
            return [];
        }

        // 计算每个文档的 TF-IDF 得分
        const scores = {};

        queryTokens.forEach(function (token) {
            const postings = index.invertedIndex[token];
            if (!postings) return;

            const idfValue = index.idf[token] || 1;

            for (const docId in postings) {
                if (postings.hasOwnProperty(docId)) {
                    if (!scores[docId]) {
                        scores[docId] = 0;
                    }
                    scores[docId] += postings[docId].tf * idfValue;
                }
            }
        });

        // 归一化得分
        for (const docId in scores) {
            if (scores.hasOwnProperty(docId)) {
                const docInfo = index.documents[docId];
                if (docInfo && docInfo.totalTokens > 0) {
                    // 使用查询 token 数量进行归一化
                    scores[docId] = scores[docId] / Math.sqrt(queryTokens.length);
                }
            }
        }

        // 排序并返回结果
        const results = [];
        for (const docId in scores) {
            if (scores.hasOwnProperty(docId) && scores[docId] >= minScore) {
                const docInfo = index.documents[docId];
                if (docInfo) {
                    // 找到匹配的文本片段
                    const snippet = findSnippet(docInfo, queryTokens);
                    results.push({
                        docId: docId,
                        docName: docInfo.name,
                        docType: docInfo.type,
                        score: scores[docId],
                        snippet: snippet,
                    });
                }
            }
        }

        results.sort(function (a, b) {
            return b.score - a.score;
        });

        return results.slice(0, maxResults);
    }

    /**
     * 查找包含匹配 token 的文本片段
     */
    function findSnippet(docInfo, queryTokens) {
        const content = docInfo.tokens.join(' ');
        const positions = [];

        queryTokens.forEach(function (token) {
            const postings = index.invertedIndex[token];
            if (postings && postings[docInfo.id]) {
                positions.push(...postings[docInfo.id].positions);
            }
        });

        if (positions.length === 0) {
            return Utils.truncateText(content, 200);
        }

        // 找到最密集匹配区域
        positions.sort(function (a, b) { return a - b; });

        let bestStart = 0;
        let bestCount = 0;
        const windowSize = 50; // token 窗口大小

        for (let i = 0; i < positions.length; i++) {
            let count = 0;
            for (let j = i; j < positions.length; j++) {
                if (positions[j] - positions[i] <= windowSize) {
                    count++;
                } else {
                    break;
                }
            }
            if (count > bestCount) {
                bestCount = count;
                bestStart = positions[i];
            }
        }

        // 提取片段
        const start = Math.max(0, bestStart - 10);
        const end = Math.min(docInfo.tokens.length, bestStart + windowSize + 20);
        const snippetTokens = docInfo.tokens.slice(start, end);
        let snippet = snippetTokens.join(' ');

        if (start > 0) snippet = '...' + snippet;
        if (end < docInfo.tokens.length) snippet = snippet + '...';

        return Utils.truncateText(snippet, 300);
    }

    /* ============================
     * 高亮匹配文本
     * ============================ */
    function highlightMatches(text, query) {
        if (!text || !query) return text || '';

        const queryTokens = filterStopWords(tokenize(query));
        if (queryTokens.length === 0) return text;

        let result = text;

        queryTokens.forEach(function (token) {
            const escaped = Utils.escapeRegExp(token);
            const regex = new RegExp('(' + escaped + ')', 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
        });

        return result;
    }

    /* ============================
     * 重建索引（增量更新）
     * ============================ */
    function rebuildIndex(documents) {
        buildIndex(documents);
    }

    /**
     * 添加单个文档到索引
     */
    function addToIndex(doc) {
        if (!doc || !doc.id) return;

        // 如果索引未构建，先初始化
        if (!index.isBuilt) {
            index.docCount = 0;
            index.isBuilt = false;
        }

        const text = doc.content || '';
        const tokens = filterStopWords(tokenize(text));
        const tokenCount = {};

        tokens.forEach(function (token, position) {
            if (!tokenCount[token]) {
                tokenCount[token] = 0;
            }
            tokenCount[token]++;

            if (!index.invertedIndex[token]) {
                index.invertedIndex[token] = {};
            }
            if (!index.invertedIndex[token][doc.id]) {
                index.invertedIndex[token][doc.id] = {
                    positions: [],
                    tf: 0,
                };
            }
            index.invertedIndex[token][doc.id].positions.push(position);
        });

        for (const token in tokenCount) {
            if (tokenCount.hasOwnProperty(token)) {
                const tf = tokenCount[token] / Math.max(tokens.length, 1);
                if (index.invertedIndex[token] && index.invertedIndex[token][doc.id]) {
                    index.invertedIndex[token][doc.id].tf = tf;
                }
            }
        }

        index.documents[doc.id] = {
            id: doc.id,
            name: doc.name,
            type: doc.type,
            tokens: tokens,
            tokenCount: tokenCount,
            totalTokens: tokens.length,
        };

        index.docCount = Object.keys(index.documents).length;

        // 重新计算 IDF
        for (const token in index.invertedIndex) {
            if (index.invertedIndex.hasOwnProperty(token)) {
                const docFreq = Object.keys(index.invertedIndex[token]).length;
                index.idf[token] = Math.log((index.docCount + 1) / (docFreq + 1)) + 1;
            }
        }

        index.isBuilt = true;
    }

    /**
     * 从索引中移除文档
     */
    function removeFromIndex(docId) {
        if (!docId || !index.documents[docId]) return;

        const docInfo = index.documents[docId];

        // 从倒排索引中移除
        for (const token in docInfo.tokenCount) {
            if (docInfo.tokenCount.hasOwnProperty(token)) {
                if (index.invertedIndex[token]) {
                    delete index.invertedIndex[token][docId];
                    if (Object.keys(index.invertedIndex[token]).length === 0) {
                        delete index.invertedIndex[token];
                        delete index.idf[token];
                    }
                }
            }
        }

        delete index.documents[docId];
        index.docCount = Object.keys(index.documents).length;

        // 重新计算 IDF
        for (const token in index.invertedIndex) {
            if (index.invertedIndex.hasOwnProperty(token)) {
                const docFreq = Object.keys(index.invertedIndex[token]).length;
                index.idf[token] = Math.log((index.docCount + 1) / (docFreq + 1)) + 1;
            }
        }

        if (index.docCount === 0) {
            index.isBuilt = false;
        }
    }

    /**
     * 获取索引状态
     */
    function getIndexStatus() {
        return {
            isBuilt: index.isBuilt,
            docCount: index.docCount,
            uniqueTokens: Object.keys(index.invertedIndex).length,
        };
    }

    /* ============================
     * 公开 API
     * ============================ */
    return {
        tokenize: tokenize,
        filterStopWords: filterStopWords,
        buildIndex: buildIndex,
        rebuildIndex: rebuildIndex,
        search: search,
        highlightMatches: highlightMatches,
        addToIndex: addToIndex,
        removeFromIndex: removeFromIndex,
        getIndexStatus: getIndexStatus,
    };
})();
