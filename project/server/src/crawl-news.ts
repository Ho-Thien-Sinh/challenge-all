import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { NewsCrawler } from './crawler.js';
import dotenv from 'dotenv';

declare module 'cheerio' {
  interface Cheerio<T> {
    // Define custom methods if needed
  }
  
  interface Element {
    // Define custom properties if needed
  }
}

// Load environment variables
dotenv.config();

// Define ArticleInfo interface
interface ArticleInfo {
  url: string;
  title: string;
}

// Main function
async function main() {
  const axiosInstance: AxiosInstance = axios.create({
    timeout: 30000, // 30 giây timeout
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'vi,en-US;q=0.7,en;q=0.3',
      'Referer': 'https://www.google.com/',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });

  // Function to fetch page content
  async function fetchPage(url: string): Promise<string> {
    try {
      console.log(`🔍 Đang tải: ${url}`);
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error(`❌ Lỗi khi tải trang ${url}:`, errorMessage);
      throw error;
    }
  }

  // Function to get list of articles from homepage
  async function getHomepageArticles(): Promise<ArticleInfo[]> {
    try {
      const html = await fetchPage('https://tuoitre.vn');
      const $ = cheerio.load(html);
      
      const articles: ArticleInfo[] = [];
      
      // Get featured articles
      $('h3.title-news a, .box-category a, .box-title-text a').each((_index: number, element) => {
        const url = $(element).attr('href');
        const title = $(element).text().trim();
        
        if (url && url.endsWith('.htm') && title) {
          const fullUrl = url.startsWith('http') ? url : `https://tuoitre.vn${url}`;
          articles.push({
            url: fullUrl,
            title: title
          });
        }
      });
      
      return articles;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách bài viết:', error);
      return [];
    }
  }

  // Create crawler instance with custom configuration
  const crawler = new NewsCrawler('https://tuoitre.vn', {
    maxConcurrent: 1,       // Number of concurrent requests
    delayMs: 3000,          // Time delay between requests (ms)
    maxRetries: 3,          // Maximum number of retries
    pagesToCrawl: 2,        // Number of pages to crawl
    timeout: 30000,         // Page load timeout (30s)
    debug: true            // Enable debug mode
  });

  try {
    console.log('🚀 Bắt đầu thu thập dữ liệu từ Tuổi Trẻ Online');
    console.log('='.repeat(60));
    
    // Get list of articles from homepage
    console.log('\n📰 Đang lấy danh sách bài viết...');
    const articles = await getHomepageArticles();
    
    console.log(`✅ Tìm thấy ${articles.length} bài viết`);
    console.log('\n============================================================');
    
    // Function to truncate text
    function truncate(str: string, maxLength: number): string {
      if (str.length <= maxLength) return str;
      return str.substring(0, maxLength - 3) + '...';
    }

    // Function to display articles
    function displayArticles(articles: ArticleInfo[], count: number = 10) {
      const line = '─'.repeat(80);
      console.log('\n' + '📋 DANH SÁCH BÀI VIẾT MỚI NHẤT'.padEnd(80, ' '));
      console.log(line);
      
      articles.slice(0, count).forEach((article, index) => {
        console.log(`\n${(index + 1).toString().padStart(2, ' ')}. ${truncate(article.title, 70)}`);
        console.log(`   🔗 ${truncate(article.url, 70)}`);
      });
      console.log('\n' + line);
    }

    displayArticles(articles);

    // Process each article
    for (let i = 0; i < Math.min(5, articles.length); i++) {
      const article = articles[i];
      try {
        process.stdout.write(`   ⏳ [${i + 1}/${Math.min(5, articles.length)}] Đang xử lý: ${article.title.substring(0, 50)}${article.title.length > 50 ? '...' : ''} `);
        
        try {
          // Process article
          const result = await crawler.processArticle(article.url, 'thoi-su');
          
          if (result) {
            // Temporary type cast to avoid TypeScript error
            const article = result as any;
            
            console.log('\n   ✅ Đã xử lý thành công:');
            console.log(`   📌 Tiêu đề: ${truncate(article.title || 'Không có tiêu đề', 60)}`);
            console.log(`   📅 Ngày đăng: ${article.published_at ? new Date(article.published_at).toLocaleString() : 'Không rõ'}`);
            console.log(`   👤 Tác giả: ${article.author || 'Không rõ'}`);
            
            // Display description if available
            if (article.description) {
              console.log(`   📝 ${truncate(article.description, 100)}`);
            }
            
            // Display image if available
            if (article.image) {
              console.log(`   🖼️ Ảnh đại diện: ${truncate(article.image, 60)}`);
            }
          } else {
            console.log('\n   ⚠️ Không thể xử lý bài viết');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
          console.log(`\n   ❌ Lỗi khi xử lý bài viết: ${errorMessage}`);
          
          // Log error details
          if (error instanceof Error) {
            console.error(`   Chi tiết lỗi: ${error.stack || error.message}`);
          }
          
          // Continue with the next article instead of stopping
          continue;
        }
        
        // Wait a bit between articles to avoid being blocked
        if (i < Math.min(4, articles.length - 1)) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: unknown) {
        process.stdout.write('❌\n');
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        console.error(`   Lỗi: ${errorMessage}`);
      }
    }
    
    console.log('\n✨ Hoàn thành thu thập dữ liệu!');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình chạy:', error);
    // Clean up resources
    console.log('\n🧹 Cleaning up...');
    try {
      if (crawler) {
        await crawler.cleanup();
      }
    } catch (error) {
      console.error('❌ Lỗi khi dọn dẹp tài nguyên:', error);
    }
    process.exit(0);
  }
}

// Handle stop signal
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Stopping crawler...');
  process.exit(0);
});

// Start the program
main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('❌ Failed to start crawler:', errorMessage);
  process.exit(1);
});
