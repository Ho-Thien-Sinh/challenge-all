"use strict";
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
var crawler_js_1 = require("./crawler.js");
var puppeteer_1 = __importDefault(require("puppeteer"));
var dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
// Main function
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, crawler, page, categories, _i, categories_1, category, categoryUrl, articleLinks, _a, articleLinks_1, link, error_1, errorMessage, error_2, errorMessage, error_3, errorMessage, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    browser = null;
                    crawler = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 20, 21, 29]);
                    console.log('🚀 Starting news crawler...');
                    return [4 /*yield*/, puppeteer_1.default.launch({
                            headless: true,
                            args: ['--no-sandbox', '--disable-setuid-sandbox']
                        })];
                case 2:
                    // Khởi tạo trình duyệt
                    browser = _b.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 3:
                    page = _b.sent();
                    return [4 /*yield*/, page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')];
                case 4:
                    _b.sent();
                    // Create a new crawler instance with custom options
                    crawler = new crawler_js_1.NewsCrawler('https://tuoitre.vn', {
                        maxConcurrent: 3, // Số lượng request đồng thời
                        delayMs: 2000, // Thời gian chờ giữa các request (ms)
                        maxRetries: 3, // Số lần thử lại khi gặp lỗi
                        batchSize: 20, // Số bài viết xử lý mỗi lần
                        pagesToCrawl: 5 // Số trang để crawl từ mỗi danh mục
                    });
                    // Initialize the crawler
                    return [4 /*yield*/, crawler.initialize()];
                case 5:
                    // Initialize the crawler
                    _b.sent();
                    // Bắt đầu quá trình crawl dữ liệu
                    console.log('🔄 Crawling news...');
                    categories = [
                        'thoi-su', 'the-gioi', 'the-thao', 'giai-tri', 'cong-nghe',
                        'suc-khoe', 'kinh-doanh', 'giao-duc', 'khoa-hoc', 'du-lich', 'xe'
                    ];
                    _i = 0, categories_1 = categories;
                    _b.label = 6;
                case 6:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 19];
                    category = categories_1[_i];
                    console.log("\n\uD83D\uDCF0 Crawling category: ".concat(category));
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 17, , 18]);
                    categoryUrl = "https://tuoitre.vn/".concat(category, ".htm");
                    // Điều hướng đến trang danh mục
                    console.log("   Navigating to: ".concat(categoryUrl));
                    return [4 /*yield*/, page.goto(categoryUrl, { waitUntil: 'networkidle2', timeout: 60000 })];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, crawler.extractArticleLinks(page)];
                case 9:
                    articleLinks = _b.sent();
                    console.log("   Found ".concat(articleLinks.length, " articles"));
                    _a = 0, articleLinks_1 = articleLinks;
                    _b.label = 10;
                case 10:
                    if (!(_a < articleLinks_1.length)) return [3 /*break*/, 16];
                    link = articleLinks_1[_a];
                    _b.label = 11;
                case 11:
                    _b.trys.push([11, 14, , 15]);
                    console.log("   Processing: ".concat(link));
                    return [4 /*yield*/, crawler.processArticle(link, category)];
                case 12:
                    _b.sent();
                    // Đợi một chút giữa các bài viết để tránh bị block
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 13:
                    // Đợi một chút giữa các bài viết để tránh bị block
                    _b.sent();
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _b.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                    console.error("   Error processing article ".concat(link, ":"), errorMessage);
                    return [3 /*break*/, 15];
                case 15:
                    _a++;
                    return [3 /*break*/, 10];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_2 = _b.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                    console.error("Error crawling category ".concat(category, ":"), errorMessage);
                    return [3 /*break*/, 18];
                case 18:
                    _i++;
                    return [3 /*break*/, 6];
                case 19:
                    console.log('✅ Crawling completed!');
                    return [3 /*break*/, 29];
                case 20:
                    error_3 = _b.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : 'Unknown error';
                    console.error('❌ Error in crawler:', errorMessage);
                    return [3 /*break*/, 29];
                case 21:
                    // Dọn dẹp tài nguyên
                    console.log('🧹 Cleaning up...');
                    _b.label = 22;
                case 22:
                    _b.trys.push([22, 27, , 28]);
                    if (!crawler) return [3 /*break*/, 24];
                    return [4 /*yield*/, crawler.cleanup()];
                case 23:
                    _b.sent();
                    _b.label = 24;
                case 24:
                    if (!browser) return [3 /*break*/, 26];
                    return [4 /*yield*/, browser.close()];
                case 25:
                    _b.sent();
                    _b.label = 26;
                case 26: return [3 /*break*/, 28];
                case 27:
                    error_4 = _b.sent();
                    console.error('Error during cleanup:', error_4);
                    return [3 /*break*/, 28];
                case 28:
                    process.exit(0);
                    return [7 /*endfinally*/];
                case 29: return [2 /*return*/];
            }
        });
    });
}
// Xử lý tín hiệu dừng
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('\n🛑 Received SIGINT. Stopping crawler...');
        process.exit(0);
        return [2 /*return*/];
    });
}); });
// Bắt đầu chương trình
main().catch(function (error) {
    var errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to start crawler:', errorMessage);
    process.exit(1);
});
