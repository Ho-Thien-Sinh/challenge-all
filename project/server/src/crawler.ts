import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import puppeteer from 'puppeteer';
import { Page, Browser, ElementHandle, LaunchOptions, HTTPResponse } from 'puppeteer';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JSDOM } from 'jsdom';
import * as he from 'he';
import { Article, CrawlerStats, CrawlerOptions } from './types.js';

// Define type for HttpsProxyAgent
class HttpsProxyAgent {
  constructor(public proxy: string) {}
}

// Free proxy list (can be replaced with paid proxy service)
const FREE_PROXIES: string[] = [
  'http://45.77.43.163:80',
  'http://45.77.43.163:3128',
  'http://103.105.77.10:80',
  'http://103.105.77.10:3128',
  'http://45.77.43.163:8080',
  'http://103.105.77.10:8080',
  // Add more reliable proxies here if needed
];

// Get random proxy function
function getRandomProxy(): string {
  return FREE_PROXIES[Math.floor(Math.random() * FREE_PROXIES.length)];
}

// Create axios instance with proxy
function createAxiosWithProxy(): AxiosInstance {
  const proxy = getRandomProxy();
  console.log(`Using proxy: ${proxy}`);
  
  const instance = axios.create({
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
  }) as AxiosInstance;
  return instance;

  // Thử lại khi gặp lỗi
  instance.interceptors.response.use(undefined, (err) => {
    console.error(`Lỗi khi gửi yêu cầu: ${err.message}`);
    throw err;
  });

  return instance;
}

// Re-export types for cleaner imports
type PuppeteerPage = Page;
type PuppeteerBrowser = Browser;

// Extend NodeJS Global interface
declare global {
  namespace NodeJS {
    interface Global {
      window: typeof globalThis & Window;
      document: Document;
      navigator: Navigator;
      HTMLAnchorElement: {
        prototype: HTMLAnchorElement;
        new(): HTMLAnchorElement;
      };
    }
  }

  // Extend global Window interface
  interface Window {
    $: cheerio.CheerioAPI;
  }
  
  // Add missing DOM types
  interface Document {}
  interface Navigator {}
  
  // Add missing error type
  interface Error {
    response?: {
      data?: {
        message?: string;
      };
    };
    message: string;
  }
  
  // HTMLAnchorElement is already provided by @types/node
}

// Type for Cheerio API instance
type CheerioAPI = cheerio.CheerioAPI;

// Using imported Article interface from types.js

// Initialize Supabase client
const getSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key in environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export class NewsCrawler {
  // Static methods for crawler control
  static async start(baseUrl: string = 'https://tuoitre.vn'): Promise<void> {
    const crawler = new NewsCrawler(baseUrl);
    await crawler.initialize();
  }

  static async stop(baseUrl: string = 'https://tuoitre.vn'): Promise<void> {
    const crawler = new NewsCrawler(baseUrl);
    await crawler.cleanup();
  }

  // Class properties
  private axiosInstance: AxiosInstance;
  protected baseUrl: string;
  private browser: Browser | null = null;
  private _isCrawling: boolean = false;
  private readonly maxConcurrent: number;
  private readonly delayMs: number = 3000;
  private readonly maxRetries: number;
  private readonly batchSize: number;
  private readonly pagesToCrawl: number;
  protected stats: CrawlerStats;
  protected supabase: SupabaseClient;
  protected delayBetweenRequests: number;
  private readonly userAgents: readonly string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  ] as const;
  private currentUserAgent: string = '';

  // Class constant
  private static readonly MAX_RETRIES = 3;

  constructor(baseUrl: string, options: CrawlerOptions = {}) {
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

    this.axiosInstance = axios.create({
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
      validateStatus: (status: number) => status >= 200 && status < 400
    });
    
    this.supabase = getSupabaseClient();
  }

  private async createBrowser(useProxy: boolean = true): Promise<Browser> {
    try {
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      const launchOptions: LaunchOptions = {
        headless: true,
        args: [] as string[]
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
        const proxy = getRandomProxy();
        console.log(`Using proxy: ${proxy}`);
        launchOptions.args.push(`--proxy-server=${proxy}`);
      }

      console.log(`Initializing browser with user-agent: ${userAgent}`);
      const browser = await puppeteer.launch(launchOptions);
       
      // Create new page and configure
      const page = await browser.newPage();
       
      // Set default navigation timeout
      await page.setDefaultNavigationTimeout(90000); // 90 seconds
      await page.setDefaultTimeout(30000); // 30 seconds for other activities
       
      // Add HTTP headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });

      // Mimic real user behavior more closely
      await page.evaluateOnNewDocument(() => {
        // Remove webdriver property to avoid detection
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
         
        // Add other spoofing properties
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
         
        Object.defineProperty(navigator, 'languages', {
          get: () => ['vi-VN', 'vi', 'en-US', 'en'],
        });
      });

      // Block unnecessary requests to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        const blockedResources = [
          'image', 'stylesheet', 'font', 'media',
          'other', 'cspviolationreport', 'imageset',
          'manifest', 'texttrack', 'websocket', 'xhr'
        ];
         
        if (blockedResources.includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      this.browser = browser;
      return browser;
    } catch (error) {
      console.error('Error creating browser:', error);
      if (this.browser) {
        try { await this.browser.close(); } catch (e) { console.error('Error closing browser:', e); }
      }
      throw error;
    }
  }

  // Public getter for isCrawling to maintain encapsulation
  public get isCrawling(): boolean {
    return this._isCrawling;
  }

  // Initialize crawler instance
  public async initialize(): Promise<void> {
    if (this._isCrawling) {
      throw new Error('Crawler is already running');
    }
    
    this._isCrawling = true;
    this.stats.startTime = new Date();
    this.stats.endTime = null; // Initialize as null since crawling hasn't finished yet.
    
    try {
      this.browser = await this.createBrowser();
      console.log('Crawler initialized successfully');
    } catch (error) {
      this._isCrawling = false;
      throw error;
    }
  }

  // Cleanup crawler resources
  public async cleanup(): Promise<void> {
    if (!this._isCrawling) {
      return;
    }
    
    this._isCrawling = false;
    this.stats.endTime = new Date();
    
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log('Crawler cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up crawler:', error);
    }
  }

  /**
   * Extracts article links from a page
   * @param page Puppeteer page instance
   * @returns Promise containing array of article URLs
   */
  public async extractArticleLinks(page: Page): Promise<string[]> {
    try {
      await page.waitForSelector('a[href]', { timeout: 10000 });
      const links = await page.evaluate(() => {
        const articleLinks = Array.from(document.querySelectorAll('a[href]'))
          .filter((link: Element) => {
            const el = link as HTMLAnchorElement;
            return el.href && !el.href.startsWith('javascript:') && !el.href.startsWith('#');
          })
          .map((link: Element) => {
            const el = link as HTMLAnchorElement;
            return el.href;
          });
        return articleLinks;
      });
      return links;
    } catch (error) {
      console.error('Error extracting article links:', error);
      return [];
    }
  }

  /**
   * Clean article title
   * @param title - The title to clean
   * @returns Cleaned title
   */
  private cleanTitle(title: string): string {
    if (!title) return '';
    return title
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[\n\r\t]/g, ' ')
      .trim();
  }

  /**
   * Clean article author
   * @param author - The author string to clean
   * @returns Cleaned author string
   */
  private cleanAuthor(author: string): string {
    if (!author) return '';
    return author
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[\n\r\t]/g, ' ')
      .trim();
  }

  private getCategoryFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const segments = path.split('/').filter(Boolean);
      return segments[0] || 'general';
    } catch (error) {
      console.error('Error getting category from URL:', error);
      return 'general';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async cleanupResources(page: Page | null, browser: Browser | null, isLocalBrowser: boolean): Promise<void> {
    try {
      if (page && !page.isClosed()) {
        await page.close();
      }
      if (isLocalBrowser && browser) {
        await browser.close();
      }
    } catch (error) {
      console.error('Error cleaning up resources:', error);
    }
  }

  protected async saveArticlesToDatabase(articles: Article[]): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('articles')
        .insert(articles.map(article => ({
          ...article,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error saving articles to database:', error);
      throw error;
    }
  }

  private isVideoOrPlaylistUrl(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    const videoPatterns = [
      /^https?:\/\/.*\.(youtube\.com|vimeo\.com|dailymotion\.com)\//,
      /^https?:\/\/.*\.(mp4|webm|ogg|mp3|wav|flac|m3u8|m3u|mpd|ism)(\?.*)?$/i
    ];
    return videoPatterns.some(pattern => pattern.test(lowerUrl));
  }

  protected async extractArticleContent(page: Page, url: string, articleCategory: string): Promise<Article | null> {
    try {
      // Check if URL is video/playlist
      if (this.isVideoOrPlaylistUrl(url)) {
        console.log(`⏭️ Bỏ qua video/playlist: ${url}`);
        return null;
      }

      // Wait for the main content to be visible with a reasonable timeout
      const contentSelector: string = 'article, .article, .post, .content, main';
      try {
        await page.waitForSelector(contentSelector, { timeout: 10000 });
      } catch (error: unknown) {
        console.warn('Không tìm thấy nội dung chính, tiếp tục xử lý...');
      }

      // Extract article data using page.evaluate with proper type safety
      const articleData: { 
        title: string; 
        summary: string; 
        content: string; 
        author: string; 
        image_url: string; 
        published_at: string; 
      } = await page.evaluate(() => {
        // Helper function to safely get meta content
        const getMetaContent = (name: string): string => {
          try {
            const meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
            return meta ? meta.content : '';
          } catch (error) {
            console.error(`Error getting meta content for ${name}:`, error);
            return '';
          }
        };

        // Helper function to safely get text content with fallback
        const getTextContent = (selector: string, context: Document | Element = document): string => {
          try {
            const element = context.querySelector(selector) as Element | null;
            return element?.textContent?.trim() || '';
          } catch (error) {
            console.error(`Error getting text content for ${selector}:`, error);
            return '';
          }
        };

        // Extract title
        const title: string = getTextContent('h1') || 
                         document.title.replace(/\s*\|.*/, '').trim() ||
                         'Không có tiêu đề';

        // Extract description
        const description: string = getMetaContent('description') || 
                             getMetaContent('og:description') ||
                             '';

        // Extract content
        const contentElement: HTMLElement | null = document.querySelector('article, .article-content, .post-content, .entry-content, main') || 
                                   document.body;
          
        // Clone the element to avoid modifying the original DOM
        const contentClone: HTMLElement = contentElement.cloneNode(true) as HTMLElement;
          
        // Remove unwanted elements
        const unwantedSelectors: string[] = [
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
          
        unwantedSelectors.forEach((selector: string) => {
          contentClone.querySelectorAll(selector).forEach((el: Element) => el.remove());
        });

        // Clean up the content
        const content: string = contentClone.textContent
          ?.replace(/\s+/g, ' ')
          .trim() || '';
          
        // Extract author
        const authorElement: HTMLElement | null = document.querySelector('[rel="author"], .author, .byline') as HTMLElement | null;
        let author: string = getMetaContent('author') || 
                        (authorElement?.textContent || authorElement?.innerText || '').trim() ||
                        '';
          
        // Extract image
        const ogImageMeta: HTMLMetaElement | null = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
        const contentImage: HTMLImageElement | null = document.querySelector('img[src*="upload"], img[src*="media"]') as HTMLImageElement | null;
        const imageUrl: string = getMetaContent('og:image') || 
                          ogImageMeta?.content ||
                          contentImage?.src ||
                          '';
          
        // Extract published date
        const timeElement: HTMLTimeElement | null = document.querySelector('time[datetime]') as HTMLTimeElement | null;
        const publishedAt: string = getMetaContent('article:published_time') || 
                            getMetaContent('og:updated_time') ||
                            (timeElement?.getAttribute('datetime') || new Date().toISOString());
          
        return {
          title: title || 'Không có tiêu đề',
          summary: description || (content ? content.substring(0, 200) + '...' : 'Không có mô tả'),
          content: content ? content.substring(0, 10000) : 'Không có nội dung',
          author: author || 'Không rõ tác giả',
          image_url: imageUrl || '',
          published_at: publishedAt
        };
      });

      if (!articleData) {
        return null;
      }

      // Get current timestamp
      const now: string = new Date().toISOString();
        
      // Create article object
      const article: Article = {
        id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        url: url  // Add the required url property
      };

      return article;
    } catch (error: unknown) {
      console.error(`Error processing article ${url}:`, error);
      return null;
    }
  }

  public async processArticle(articleUrl: string, articleCategory: string): Promise<Article | null> {
    let page: Page | null = null;
    
    try {
      console.log(`🔍 Đang xử lý bài viết: ${articleUrl}`);
      
      if (!this.browser) {
        throw new Error('Trình duyệt chưa được khởi tạo');
      }
      
      // Tạo một trang mới cho mỗi bài viết để tránh xung đột
      page = await this.browser.newPage();
      
      // Cấu hình request/response
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        // Chặn các request không cần thiết để tăng tốc độ
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      // Xử lý lỗi trong quá trình tải trang
      const navigationPromise = page.goto(articleUrl, { 
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 60000 // 60 seconds
      }).catch(error => {
        console.error(`❌ Lỗi khi tải trang ${articleUrl}:`, error.message);
        return null;
      });
      
      // Thêm timeout riêng cho navigation
      const timeoutPromise = new Promise<null>(resolve => 
        setTimeout(() => {
          console.error(`⏱️ Timeout khi tải trang: ${articleUrl}`);
          resolve(null);
        }, 60000)
      );
      
      // Chờ navigation hoặc timeout
      const navigationResult = await Promise.race([navigationPromise, timeoutPromise]);
      
      if (!navigationResult) {
        console.log(`⚠️ Bỏ qua bài viết do lỗi tải trang: ${articleUrl}`);
        return null;
      }

      return await this.extractArticleContent(page, articleUrl, articleCategory);
    } catch (error: unknown) {
      console.error(`Error processing article ${articleUrl}:`, error);
      return null;
    } finally {
      if (page && !page.isClosed()) {
        try { await page.close(); } catch (e) { console.error('Error closing page:', e); }
      }
    }
  }
}

// Export the crawler class
export default NewsCrawler;

// Export named functions for crawler control
export const startCrawler = NewsCrawler.start;
export const stopCrawler = NewsCrawler.stop;