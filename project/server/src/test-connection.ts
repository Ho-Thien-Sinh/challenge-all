import axios from 'axios';
import puppeteer from 'puppeteer';

async function testConnection() {
    console.log('🔍 Testing basic connections...');
    
    // Test axios connection
    try {
        console.log('🌐 Testing Axios connection to Google...');
        const response = await axios.get('https://www.google.com', {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log(`✅ Successfully connected to Google. Status: ${response.status}`);
    } catch (error: any) {
        console.error('❌ Axios connection failed:', error.message);
    }

    // Test Puppeteer
    let browser;
    try {
        console.log('🖥️ Testing Puppeteer...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            timeout: 30000
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('🌐 Navigating to Google...');
        const response = await page.goto('https://www.google.com', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
        
        console.log(`✅ Successfully loaded Google with status: ${response?.status()}`);
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
    } catch (error: any) {
        console.error('❌ Puppeteer test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔄 Puppeteer browser closed');
        }
    }
}

testConnection().catch(console.error);
