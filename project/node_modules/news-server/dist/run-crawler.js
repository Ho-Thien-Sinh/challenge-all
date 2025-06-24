import { startCrawler, stopCrawler } from './crawler.js';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
// Main function
async function main() {
    try {
        console.log('🔄 Initializing crawler...');
        // Start the crawler with custom configuration
        startCrawler();
        console.log('🚀 Starting the news crawling process...');
        // Keep the process alive
        await new Promise(() => { });
    }
    catch (error) {
        console.error('❌ Error in crawler:', error);
        process.exit(1);
    }
}
// Handle process termination signals
process.on('SIGTERM', () => {
    console.log('\n🛑 Received termination signal. Stopping crawler...');
    stopCrawler();
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('\n🛑 Received interrupt signal. Stopping crawler...');
    stopCrawler();
    process.exit(0);
});
// Start the application
main().catch(error => {
    console.error('❌ Failed to start crawler:', error);
    process.exit(1);
});
