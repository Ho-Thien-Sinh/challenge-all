console.log('Testing CommonJS with TypeScript...');

// Try to load TypeScript file
require('ts-node/register');

// Now require the TypeScript file
const { startCrawler } = require('./src/crawler');

console.log('Starting crawler...');
startCrawler();
