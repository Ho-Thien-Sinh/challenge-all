import { NewsCrawler } from './crawler.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runCrawler() {
    try {
        console.log('🔄 Initializing crawler without proxy...');
        
        // Start the crawler using the static start method
        console.log('🚀 Starting the news crawling process...');
        await NewsCrawler.start('https://tuoitre.vn');        
        console.log('✅ Crawler finished successfully');
        
    } catch (error) {
        console.error('❌ Error running crawler:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the crawler
runCrawler();
