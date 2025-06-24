import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function simpleCheck() {
    try {
        console.log('🔍 Simple Supabase check...');
        
        const supabase = createClient(
            process.env.SUPABASE_URL || '',
            process.env.SUPABASE_ANON_KEY || ''
        );
        
        // Try to get article count
        const { count, error: countError } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            console.error('❌ Error getting article count:', countError);
            return;
        }
        
        console.log(`📊 Found ${count || 0} articles`);
        
        // Try to get a single article
        const { data: article, error: articleError } = await supabase
            .from('articles')
            .select('*')
            .limit(1)
            .maybeSingle();
            
        if (articleError) {
            console.error('❌ Error getting article:', articleError);
            return;
        }
        
        if (article) {
            console.log('\n📝 Sample article:');
            console.log('Title:', article.title);
            console.log('Category:', article.category);
            console.log('Published at:', article.published_at);
        } else {
            console.log('\nℹ️ No articles found in the database.');
        }
        
    } catch (error) {
        console.error('❌ Error in simple check:', error);
    }
}

simpleCheck().catch(console.error);
