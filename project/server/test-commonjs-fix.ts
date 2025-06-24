// test-commonjs-fix.ts
console.log('Testing CommonJS imports...');

// Test 1: Require built-in module
const path = require('path');
console.log('Current directory:', __dirname);
console.log('File path:', path.join(__dirname, 'test-commonjs-fix.ts'));

// Test 2: Import local module
const { NewsCrawler } = require('./src/crawler');
console.log('Successfully required NewsCrawler');

// Test 3: Create instance
const crawler = new NewsCrawler('https://tuoitre.vn', {
  maxConcurrent: 1,
  delayMs: 1000
});

console.log('Crawler instance created');

// Test 4: Start crawling
crawler.start()
  .then((articles: any[]) => {
    console.log(`Crawled ${articles.length} articles`);
    if (articles.length > 0) {
      console.log('First article:', {
        title: articles[0].title,
        url: articles[0].source_url,
        category: articles[0].category
      });
    }
  })
  .catch((error: Error) => {
    console.error('Error during crawl:', error);
  });
