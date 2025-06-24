// Test script to check API key loading
require('dotenv').config();

console.log('Testing API key loading...');
console.log('process.env.API_KEYS:', process.env.API_KEYS);

const API_KEYS = (process.env.API_KEYS || '')
  .split(',')
  .map(key => key.trim().replace(/^["']|["']$/g, ''))
  .filter(Boolean);

console.log('Parsed API_KEYS:', API_KEYS);
console.log('API key exists:', API_KEYS.includes('news_app_12345_secure_key_67890'));
