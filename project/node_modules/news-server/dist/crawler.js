"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCrawler = exports.startCrawler = exports.NewsCrawler = void 0;
var axios_1 = __importDefault(require("axios"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var supabase_js_1 = require("@supabase/supabase-js");
// Define type for HttpsProxyAgent
var HttpsProxyAgent = /** @class */ (function () {
    function HttpsProxyAgent(proxy) {
        this.proxy = proxy;
    }
    return HttpsProxyAgent;
}());
// Free proxy list (can be replaced with paid proxy service)
var FREE_PROXIES = [
    'http://45.77.43.163:80',
    'http://45.77.43.163:3128',
    'http://103.105.77.10:80',
    'http://103.105.77.10:3128',
    'http://45.77.43.163:8080',
    'http://103.105.77.10:8080',
    // Add more reliable proxies here if needed
];
// Get random proxy function
function getRandomProxy() {
    return FREE_PROXIES[Math.floor(Math.random() * FREE_PROXIES.length)];
}
// Create axios instance with proxy
function createAxiosWithProxy() {
    var proxy = getRandomProxy();
    console.log("Using proxy: ".concat(proxy));
    var instance = axios_1.default.create({
        httpsAgent: new HttpsProxyAgent(proxy),
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        },
    });
    return instance;
    // Thử lại khi gặp lỗi
    instance.interceptors.response.use(undefined, function (err) {
        console.error("L\u1ED7i khi g\u1EEDi y\u00EAu c\u1EA7u: ".concat(err.message));
        throw err;
    });
    return instance;
}
// Using imported Article interface from types.js
// Initialize Supabase client
var getSupabaseClient = function () {
    var supabaseUrl = process.env.SUPABASE_URL || '';
    var supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase URL or Key in environment variables');
    }
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
};
var NewsCrawler = /** @class */ (function () {
    function NewsCrawler(baseUrl, options) {
        if (options === void 0) { options = {}; }
        this.browser = null;
        this._isCrawling = false;
        this.delayMs = 3000;
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
        ];
        this.currentUserAgent = '';
        this.baseUrl = baseUrl;
        this.maxConcurrent = options.maxConcurrent || 2;
        this.delayMs = options.delayMs || 3000;
        this.delayBetweenRequests = this.delayMs;
        this.maxRetries = options.maxRetries || 2;
        this.batchSize = options.batchSize || 10;
        this.pagesToCrawl = options.pagesToCrawl || 2;
        this._isCrawling = false;
        // Chọn ngẫu nhiên một User-Agent
        this.currentUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        this.stats = {
            totalCrawled: 0,
            success: 0,
            failed: 0,
            startTime: null,
            endTime: null,
            errors: [],
            pagesCrawled: 0,
            articlesFound: 0,
            articlesSaved: 0,
            status: 'idle'
        };
        this.axiosInstance = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 60000,
            headers: {
                'User-Agent': this.currentUserAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1'
            },
            validateStatus: function (status) { return status >= 200 && status < 400; }
        });
        this.supabase = getSupabaseClient();
    }
    // Static methods for crawler control
    NewsCrawler.start = function () {
        return __awaiter(this, arguments, void 0, function (baseUrl) {
            var crawler;
            if (baseUrl === void 0) { baseUrl = 'https://tuoitre.vn'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crawler = new NewsCrawler(baseUrl);
                        return [4 /*yield*/, crawler.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NewsCrawler.stop = function () {
        return __awaiter(this, arguments, void 0, function (baseUrl) {
            var crawler;
            if (baseUrl === void 0) { baseUrl = 'https://tuoitre.vn'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crawler = new NewsCrawler(baseUrl);
                        return [4 /*yield*/, crawler.cleanup()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NewsCrawler.prototype.createBrowser = function () {
        return __awaiter(this, arguments, void 0, function (useProxy) {
            var userAgent, launchOptions, proxy, browser, page, error_1, e_1;
            if (useProxy === void 0) { useProxy = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 13]);
                        userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
                        launchOptions = {
                            headless: true,
                            args: []
                        };
                        // Add common arguments
                        launchOptions.args = [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-gpu',
                            '--window-size=1920,1080'
                        ];
                        if (useProxy) {
                            proxy = getRandomProxy();
                            console.log("Using proxy: ".concat(proxy));
                            launchOptions.args.push("--proxy-server=".concat(proxy));
                        }
                        console.log("Initializing browser with user-agent: ".concat(userAgent));
                        return [4 /*yield*/, puppeteer_1.default.launch(launchOptions)];
                    case 1:
                        browser = _a.sent();
                        return [4 /*yield*/, browser.newPage()];
                    case 2:
                        page = _a.sent();
                        // Set default navigation timeout
                        return [4 /*yield*/, page.setDefaultNavigationTimeout(90000)];
                    case 3:
                        // Set default navigation timeout
                        _a.sent(); // 90 seconds
                        return [4 /*yield*/, page.setDefaultTimeout(30000)];
                    case 4:
                        _a.sent(); // 30 seconds for other activities
                        // Add HTTP headers
                        return [4 /*yield*/, page.setExtraHTTPHeaders({
                                'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
                                'Accept-Encoding': 'gzip, deflate, br',
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                                'Referer': 'https://www.google.com/',
                                'DNT': '1',
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            })];
                    case 5:
                        // Add HTTP headers
                        _a.sent();
                        // Mimic real user behavior more closely
                        return [4 /*yield*/, page.evaluateOnNewDocument(function () {
                                // Remove webdriver property to avoid detection
                                Object.defineProperty(navigator, 'webdriver', {
                                    get: function () { return false; },
                                });
                                // Add other spoofing properties
                                Object.defineProperty(navigator, 'plugins', {
                                    get: function () { return [1, 2, 3, 4, 5]; },
                                });
                                Object.defineProperty(navigator, 'languages', {
                                    get: function () { return ['vi-VN', 'vi', 'en-US', 'en']; },
                                });
                            })];
                    case 6:
                        // Mimic real user behavior more closely
                        _a.sent();
                        // Block unnecessary requests to speed up
                        return [4 /*yield*/, page.setRequestInterception(true)];
                    case 7:
                        // Block unnecessary requests to speed up
                        _a.sent();
                        page.on('request', function (req) {
                            var resourceType = req.resourceType();
                            var blockedResources = [
                                'image', 'stylesheet', 'font', 'media',
                                'other', 'cspviolationreport', 'imageset',
                                'manifest', 'texttrack', 'websocket', 'xhr'
                            ];
                            if (blockedResources.includes(resourceType)) {
                                req.abort();
                            }
                            else {
                                req.continue();
                            }
                        });
                        this.browser = browser;
                        return [2 /*return*/, browser];
                    case 8:
                        error_1 = _a.sent();
                        console.error('Error creating browser:', error_1);
                        if (!this.browser) return [3 /*break*/, 12];
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.browser.close()];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        e_1 = _a.sent();
                        console.error('Error closing browser:', e_1);
                        return [3 /*break*/, 12];
                    case 12: throw error_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(NewsCrawler.prototype, "isCrawling", {
        // Public getter for isCrawling to maintain encapsulation
        get: function () {
            return this._isCrawling;
        },
        enumerable: false,
        configurable: true
    });
    // Initialize crawler instance
    NewsCrawler.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._isCrawling) {
                            throw new Error('Crawler is already running');
                        }
                        this._isCrawling = true;
                        this.stats.startTime = new Date();
                        this.stats.endTime = null; // Initialize as null since crawling hasn't finished yet.
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, this.createBrowser()];
                    case 2:
                        _a.browser = _b.sent();
                        console.log('Crawler initialized successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        this._isCrawling = false;
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Cleanup crawler resources
    NewsCrawler.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._isCrawling) {
                            return [2 /*return*/];
                        }
                        this._isCrawling = false;
                        this.stats.endTime = new Date();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!this.browser) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.browser.close()];
                    case 2:
                        _a.sent();
                        this.browser = null;
                        _a.label = 3;
                    case 3:
                        console.log('Crawler cleaned up successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('Error cleaning up crawler:', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extracts article links from a page
     * @param page Puppeteer page instance
     * @returns Promise containing array of article URLs
     */
    NewsCrawler.prototype.extractArticleLinks = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var links, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, page.waitForSelector('a[href]', { timeout: 10000 })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.evaluate(function () {
                                var articleLinks = Array.from(document.querySelectorAll('a[href]'))
                                    .filter(function (link) {
                                    var el = link;
                                    return el.href && !el.href.startsWith('javascript:') && !el.href.startsWith('#');
                                })
                                    .map(function (link) {
                                    var el = link;
                                    return el.href;
                                });
                                return articleLinks;
                            })];
                    case 2:
                        links = _a.sent();
                        return [2 /*return*/, links];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error extracting article links:', error_4);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean article title
     * @param title - The title to clean
     * @returns Cleaned title
     */
    NewsCrawler.prototype.cleanTitle = function (title) {
        if (!title)
            return '';
        return title
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[\n\r\t]/g, ' ')
            .trim();
    };
    /**
     * Clean article author
     * @param author - The author string to clean
     * @returns Cleaned author string
     */
    NewsCrawler.prototype.cleanAuthor = function (author) {
        if (!author)
            return '';
        return author
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[\n\r\t]/g, ' ')
            .trim();
    };
    NewsCrawler.prototype.getCategoryFromUrl = function (url) {
        try {
            var urlObj = new URL(url);
            var path = urlObj.pathname;
            var segments = path.split('/').filter(Boolean);
            return segments[0] || 'general';
        }
        catch (error) {
            console.error('Error getting category from URL:', error);
            return 'general';
        }
    };
    NewsCrawler.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    NewsCrawler.prototype.cleanupResources = function (page, browser, isLocalBrowser) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!(page && !page.isClosed())) return [3 /*break*/, 2];
                        return [4 /*yield*/, page.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(isLocalBrowser && browser)) return [3 /*break*/, 4];
                        return [4 /*yield*/, browser.close()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_5 = _a.sent();
                        console.error('Error cleaning up resources:', error_5);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    NewsCrawler.prototype.saveArticlesToDatabase = function (articles) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('articles')
                                .insert(articles.map(function (article) { return (__assign(__assign({}, article), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() })); }))];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('Error saving articles to database:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    NewsCrawler.prototype.isVideoOrPlaylistUrl = function (url) {
        var lowerUrl = url.toLowerCase();
        var videoPatterns = [
            /^https?:\/\/.*\.(youtube\.com|vimeo\.com|dailymotion\.com)\//,
            /^https?:\/\/.*\.(mp4|webm|ogg|mp3|wav|flac|m3u8|m3u|mpd|ism)(\?.*)?$/i
        ];
        return videoPatterns.some(function (pattern) { return pattern.test(lowerUrl); });
    };
    NewsCrawler.prototype.extractArticleContent = function (page, url, articleCategory) {
        return __awaiter(this, void 0, void 0, function () {
            var contentSelector, error_7, articleData, now, article, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        // Check if URL is video/playlist
                        if (this.isVideoOrPlaylistUrl(url)) {
                            console.log("\u23ED\uFE0F B\u1ECF qua video/playlist: ".concat(url));
                            return [2 /*return*/, null];
                        }
                        contentSelector = 'article, .article, .post, .content, main';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, page.waitForSelector(contentSelector, { timeout: 10000 })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _a.sent();
                        console.warn('Không tìm thấy nội dung chính, tiếp tục xử lý...');
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, page.evaluate(function () {
                            var _a;
                            // Helper function to safely get meta content
                            var getMetaContent = function (name) {
                                try {
                                    var meta = document.querySelector("meta[name=\"".concat(name, "\"]"));
                                    return meta ? meta.content : '';
                                }
                                catch (error) {
                                    console.error("Error getting meta content for ".concat(name, ":"), error);
                                    return '';
                                }
                            };
                            // Helper function to safely get text content with fallback
                            var getTextContent = function (selector, context) {
                                var _a;
                                if (context === void 0) { context = document; }
                                try {
                                    var element = context.querySelector(selector);
                                    return ((_a = element === null || element === void 0 ? void 0 : element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                                }
                                catch (error) {
                                    console.error("Error getting text content for ".concat(selector, ":"), error);
                                    return '';
                                }
                            };
                            // Extract title
                            var title = getTextContent('h1') ||
                                document.title.replace(/\s*\|.*/, '').trim() ||
                                'Không có tiêu đề';
                            // Extract description
                            var description = getMetaContent('description') ||
                                getMetaContent('og:description') ||
                                '';
                            // Extract content
                            var contentElement = document.querySelector('article, .article-content, .post-content, .entry-content, main') ||
                                document.body;
                            // Clone the element to avoid modifying the original DOM
                            var contentClone = contentElement.cloneNode(true);
                            // Remove unwanted elements
                            var unwantedSelectors = [
                                'script',
                                'style',
                                'iframe',
                                'nav',
                                'header',
                                'footer',
                                '.social-share',
                                '.related-articles',
                                '.comments',
                                '.ad-container',
                                '.ad',
                                '.ads',
                                '.advertisement',
                                '.share',
                                '.newsletter',
                                '.recommended',
                                '.related-posts',
                                '.popular-posts',
                                '.trending',
                                '.tags',
                                '.author-box'
                            ];
                            unwantedSelectors.forEach(function (selector) {
                                contentClone.querySelectorAll(selector).forEach(function (el) { return el.remove(); });
                            });
                            // Clean up the content
                            var content = ((_a = contentClone.textContent) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, ' ').trim()) || '';
                            // Extract author
                            var authorElement = document.querySelector('[rel="author"], .author, .byline');
                            var author = getMetaContent('author') ||
                                ((authorElement === null || authorElement === void 0 ? void 0 : authorElement.textContent) || (authorElement === null || authorElement === void 0 ? void 0 : authorElement.innerText) || '').trim() ||
                                '';
                            // Extract image
                            var ogImageMeta = document.querySelector('meta[property="og:image"]');
                            var contentImage = document.querySelector('img[src*="upload"], img[src*="media"]');
                            var imageUrl = getMetaContent('og:image') ||
                                (ogImageMeta === null || ogImageMeta === void 0 ? void 0 : ogImageMeta.content) ||
                                (contentImage === null || contentImage === void 0 ? void 0 : contentImage.src) ||
                                '';
                            // Extract published date
                            var timeElement = document.querySelector('time[datetime]');
                            var publishedAt = getMetaContent('article:published_time') ||
                                getMetaContent('og:updated_time') ||
                                ((timeElement === null || timeElement === void 0 ? void 0 : timeElement.getAttribute('datetime')) || new Date().toISOString());
                            return {
                                title: title || 'Không có tiêu đề',
                                summary: description || (content ? content.substring(0, 200) + '...' : 'Không có mô tả'),
                                content: content ? content.substring(0, 10000) : 'Không có nội dung',
                                author: author || 'Không rõ tác giả',
                                image_url: imageUrl || '',
                                published_at: publishedAt
                            };
                        })];
                    case 5:
                        articleData = _a.sent();
                        if (!articleData) {
                            return [2 /*return*/, null];
                        }
                        now = new Date().toISOString();
                        article = {
                            id: "article-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                            title: articleData.title,
                            summary: articleData.summary,
                            content: articleData.content,
                            author: articleData.author,
                            image_url: articleData.image_url,
                            published_at: articleData.published_at,
                            created_at: now,
                            updated_at: now,
                            status: 'draft',
                            category: articleCategory,
                            source_url: url,
                            url: url // Add the required url property
                        };
                        return [2 /*return*/, article];
                    case 6:
                        error_8 = _a.sent();
                        console.error("Error processing article ".concat(url, ":"), error_8);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    NewsCrawler.prototype.processArticle = function (articleUrl, articleCategory) {
        return __awaiter(this, void 0, void 0, function () {
            var page, navigationPromise, timeoutPromise, navigationResult, error_9, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 12]);
                        console.log("\uD83D\uDD0D \u0110ang x\u1EED l\u00FD b\u00E0i vi\u1EBFt: ".concat(articleUrl));
                        if (!this.browser) {
                            throw new Error('Trình duyệt chưa được khởi tạo');
                        }
                        return [4 /*yield*/, this.browser.newPage()];
                    case 2:
                        // Tạo một trang mới cho mỗi bài viết để tránh xung đột
                        page = _a.sent();
                        // Cấu hình request/response
                        return [4 /*yield*/, page.setRequestInterception(true)];
                    case 3:
                        // Cấu hình request/response
                        _a.sent();
                        page.on('request', function (req) {
                            // Chặn các request không cần thiết để tăng tốc độ
                            var resourceType = req.resourceType();
                            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                                req.abort();
                            }
                            else {
                                req.continue();
                            }
                        });
                        navigationPromise = page.goto(articleUrl, {
                            waitUntil: ['domcontentloaded', 'networkidle2'],
                            timeout: 60000 // 60 seconds
                        }).catch(function (error) {
                            console.error("\u274C L\u1ED7i khi t\u1EA3i trang ".concat(articleUrl, ":"), error.message);
                            return null;
                        });
                        timeoutPromise = new Promise(function (resolve) {
                            return setTimeout(function () {
                                console.error("\u23F1\uFE0F Timeout khi t\u1EA3i trang: ".concat(articleUrl));
                                resolve(null);
                            }, 60000);
                        });
                        return [4 /*yield*/, Promise.race([navigationPromise, timeoutPromise])];
                    case 4:
                        navigationResult = _a.sent();
                        if (!navigationResult) {
                            console.log("\u26A0\uFE0F B\u1ECF qua b\u00E0i vi\u1EBFt do l\u1ED7i t\u1EA3i trang: ".concat(articleUrl));
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.extractArticleContent(page, articleUrl, articleCategory)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6:
                        error_9 = _a.sent();
                        console.error("Error processing article ".concat(articleUrl, ":"), error_9);
                        return [2 /*return*/, null];
                    case 7:
                        if (!(page && !page.isClosed())) return [3 /*break*/, 11];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, page.close()];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_2 = _a.sent();
                        console.error('Error closing page:', e_2);
                        return [3 /*break*/, 11];
                    case 11: return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    // Class constant
    NewsCrawler.MAX_RETRIES = 3;
    return NewsCrawler;
}());
exports.NewsCrawler = NewsCrawler;
// Export the crawler class
exports.default = NewsCrawler;
// Export named functions for crawler control
exports.startCrawler = NewsCrawler.start;
exports.stopCrawler = NewsCrawler.stop;
