import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticles() {
    try {
        console.log('🔍 Checking articles in Supabase...');
        
        // Count total number of articles
        const { count, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true });
            
        if (countError) throw countError;
        console.log(`📊 Total articles: ${count}`);
        
        // Get number of articles per category
        const { data: categories, error: categoryError } = await supabase
            .from('articles')
            .select('category')
            .not('category', 'is', null);
            
        if (categoryError) throw categoryError;
        
        // Count number of articles per category
        const categoryCounts = categories.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log('📋 Articles by category:');
        console.table(categoryCounts);
        
        // Get 5 latest articles
        console.log('\n🆕 Latest 5 articles:');
        const { data: recentArticles, error: recentError } = await supabase
            .from('articles')
            .select('id, title, category, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (recentError) throw recentError;
        console.table(recentArticles);
        
    } catch (error) {
        console.error('❌ Error checking articles:', error);
    }
}

checkArticles();
