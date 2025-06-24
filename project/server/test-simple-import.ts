// test-simple-import.ts
console.log('=== Starting Simple Import Test ===');

// Simple console test
console.log('1. Console.log works');

// Try to import a built-in module
try {
  const os = require('os');
  console.log('2. Required os module');
  console.log('   - Platform:', os.platform());
  console.log('   - CPU Cores:', os.cpus().length);
} catch (error) {
  console.error('Failed to require os module:', error);
}

// Try to import the crawler
try {
  console.log('3. Trying to import crawler...');
  const crawler = require('./src/crawler');
  console.log('4. Successfully required crawler');
  
  if (crawler.NewsCrawler) {
    console.log('5. Found NewsCrawler class');
    console.log('   - StartCrawler function exists:', typeof crawler.startCrawler === 'function');
    console.log('   - StopCrawler function exists:', typeof crawler.stopCrawler === 'function');
  } else {
    console.log('5. NewsCrawler class not found in exports');
    console.log('   Available exports:', Object.keys(crawler));
  }
} catch (error) {
  console.error('Failed to import crawler:', error);
}

console.log('=== Test Completed ===');
