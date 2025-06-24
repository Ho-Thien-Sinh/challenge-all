// test-env.js
console.log('=== Environment Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());
console.log('Environment variables:', Object.keys(process.env).filter(k => k.startsWith('NODE_') || k === 'PATH'));

// Test file system access
const fs = require('fs');
console.log('\nFile system test:');
console.log('- Current directory exists:', fs.existsSync('.'));
console.log('- package.json exists:', fs.existsSync('package.json'));
console.log('- src directory exists:', fs.existsSync('src'));

// Test module loading
console.log('\nModule loading test:');
try {
  const path = require('path');
  console.log('- path module loaded successfully');
  console.log('  - Current file:', __filename);
  console.log('  - Directory name:', path.dirname(__filename));
} catch (error) {
  console.error('- Failed to load path module:', error);
}

// Test local module
console.log('\nLocal module test:');
try {
  const crawler = require('./src/crawler');
  console.log('- Successfully required crawler');
  console.log('  - Exports:', Object.keys(crawler).filter(k => typeof crawler[k] === 'function'));
} catch (error) {
  const err = error as Error & { code?: string };
  console.error('- Failed to load crawler:', err.message);
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('  - This usually means there was an error loading the module');
    console.error('  - Check if the file exists and has no syntax errors');
  }
}

console.log('\n=== Test Complete ===');
