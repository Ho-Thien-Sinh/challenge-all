// test-modules.ts
// Make this file a module
export {};

console.log('Testing module system...');

// Test 1: Check if we can import built-in modules
try {
  const fs = require('fs');
  console.log('✅ Successfully required fs module');
} catch (error) {
  console.error('❌ Failed to require fs:', error);
}

// Test 2: Check if we can use dynamic import
(async () => {
  try {
    console.log('\nTesting dynamic import...');
    const module = await import('node:path');
    console.log('✅ Successfully dynamically imported path module');
    console.log('Current directory:', module.resolve('.'));
  } catch (error) {
    console.error('❌ Dynamic import failed:', error);
  }
})();

// Test 3: Check if we can import local module
try {
  console.log('\nTesting local module import...');
  const { NewsCrawler } = await import('./src/crawler.js');
  console.log('✅ Successfully imported NewsCrawler');
  
  // Try to create an instance
  const crawler = new NewsCrawler('https://example.com');
  console.log('✅ Successfully created NewsCrawler instance');
  
} catch (error) {
  console.error('❌ Failed to import local module:', error);
}
