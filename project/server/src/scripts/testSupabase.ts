import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase configuration. Please check your .env file');
        return;
    }

    console.log('🔗 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? '***' : 'Not set');

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection by fetching a single row
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error connecting to Supabase:', error.message);
            return;
        }

        console.log('✅ Successfully connected to Supabase');
        console.log('📊 Total articles:', data?.length || 0);
        
        if (data && data.length > 0) {
            console.log('\n📝 Sample article:');
            console.log('ID:', data[0].id);
            console.log('Title:', data[0].title);
            console.log('Category:', data[0].category);
            console.log('Created at:', data[0].created_at);
        } else {
            console.log('ℹ️ No articles found in the database');
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testSupabase();
