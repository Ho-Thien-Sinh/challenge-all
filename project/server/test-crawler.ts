// test-crawler.ts
console.log('Starting crawler test...');

// Import using dynamic import
import { NewsCrawler, startCrawler, stopCrawler } from './src/crawler.js';

async function testCrawler() {
  console.log('=== Starting Test Crawler ===');
  
  try {
    // Test 1: Direct function call
    console.log('\n--- Testing startCrawler() ---');
    startCrawler();
    
    // Wait for 10 seconds to see some crawling happen
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Test 2: Stop the crawler
    console.log('\n--- Testing stopCrawler() ---');
    await stopCrawler();
    
    // Test 3: Create instance directly
    console.log('\n--- Testing NewsCrawler instance ---');
    const crawler = new NewsCrawler('https://tuoitre.vn', {
      maxConcurrent: 1,
      delayMs: 2000,
      maxArticles: 3  // Only fetch 3 articles for testing
    });
    
    console.log('Starting crawler instance...');
    const articles = await crawler.start();
    console.log(`Crawled ${articles.length} articles`);
    
    // Log the first article if available
    if (articles.length > 0) {
      console.log('\nFirst article:');
      console.log(`- Title: ${articles[0].title}`);
      console.log(`- URL: ${articles[0].source_url}`);
      console.log(`- Category: ${articles[0].category}`);
    }
    
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error details:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    console.log('\n=== Test Completed ===');
  }
}

// Run the test
console.log('Running crawler tests...');
testCrawler()
  .then(() => console.log('All tests completed successfully!'))
  .catch(error => {
    console.error('Unhandled error in test:', error);
    process.exit(1);
  });
