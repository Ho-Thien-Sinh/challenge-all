// Disable proxy-agent debugging
process.env.DEBUG = '';
// Force CommonJS
require('ts-node/register/transpile-only');
// Import the TypeScript file
require('./run-crawler');
export {};
