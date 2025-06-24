import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkArticles() {
    try {
        console.log('🔍 Checking articles in Supabase...');
        
        // Initialize Supabase client
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase URL or ANON KEY in environment variables');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Get total count of articles
        const { count, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true });
            
        if (countError) throw countError;
        
        console.log(`📊 Total articles in database: ${count}`);
        
        // Get articles count by category
        const { data: categories, error: categoryError } = await supabase
            .from('articles')
            .select('category')
            .not('category', 'is', null);
            
        if (categoryError) throw categoryError;
        
        // Count articles by category
        const categoryCounts = categories.reduce((acc: Record<string, number>, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\n📋 Articles by category:');
        console.table(categoryCounts);
        
        // Get latest 5 articles
        console.log('\n🆕 Latest 5 articles:');
        const { data: recentArticles, error: recentError } = await supabase
            .from('articles')
            .select('id, title, category, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (recentError) throw recentError;
        
        if (recentArticles && recentArticles.length > 0) {
            console.table(recentArticles);
        } else {
            console.log('No articles found in the database.');
        }
        
    } catch (error) {
        console.error('❌ Error checking articles:', error);
    }
}

// Run the check
checkArticles().catch(console.error);
