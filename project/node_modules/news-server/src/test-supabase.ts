import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSupabase() {
    try {
        console.log('🔍 Testing Supabase connection...');
        
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
        
        console.log('Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
        console.log('Supabase Key:', supabaseKey ? '✅ Configured' : '❌ Missing');
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection by fetching tables
        const { data: tables, error } = await supabase
            .from('pg_tables')
            .select('tablename')
            .eq('schemaname', 'public');
            
        if (error) throw error;
        
        console.log('\n✅ Successfully connected to Supabase');
        console.log('\n📋 Available tables:');
        console.table(tables);
        
    } catch (error) {
        console.error('❌ Error testing Supabase:', error);
    }
}

testSupabase().catch(console.error);
