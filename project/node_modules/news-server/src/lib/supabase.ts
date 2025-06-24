import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Using service role key

if (!supabaseUrl || !supabaseKey) {
    const errorMsg = '❌ Missing Supabase configuration. Please check your .env file';
    console.error(errorMsg);
    throw new Error(errorMsg);
}

console.log('🔐 Using service role key to connect to Supabase');
console.log(`Supabase URL: ${supabaseUrl ? '✅ Configured' : '❌ Missing'}`);
console.log(`Supabase Key: ${supabaseKey ? '✅ Configured' : '❌ Missing'}`);

// Enhanced fetch with better error handling, logging and API key injection
const customFetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init.method || 'GET';
    
    // Skip logging for RLS policies check
    if (!url.includes('/rest/v1/rpc/pgrst_watch')) {
        console.log(`🔵 [${method}] ${url}`);
    }
    
    try {
        // Clone the headers to avoid modifying the original
        const headers = new Headers(init.headers);
        
        // Add required headers for Supabase
        headers.set('apikey', supabaseKey);
        headers.set('Authorization', `Bearer ${supabaseKey}`);
        
        // Add cache control headers
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        
        const response = await fetch(input, {
            ...init,
            headers,
            cache: 'no-store',
        });
        
        if (!response.ok) {
            let errorData = 'No error details';
            try {
                // Clone the response before reading it
                const responseClone = response.clone();
                errorData = await responseClone.text();
                try {
                    // Try to parse as JSON for better error formatting
                    const jsonData = JSON.parse(errorData);
                    errorData = JSON.stringify(jsonData, null, 2);
                } catch (e) {
                    // Not JSON, keep as is
                }
            } catch (e) {
                console.error('Error reading error response:', e);
            }
            
            if (!url.includes('/rest/v1/rpc/pgrst_watch')) {
                console.error(`🔴 [${response.status}] ${method} ${url} - ${errorData}`);
            }
        } else if (!url.includes('/rest/v1/rpc/pgrst_watch')) {
            console.log(`🟢 [${response.status}] ${method} ${url}`);
        }
        
        return response;
    } catch (error) {
        if (!url.includes('/rest/v1/rpc/pgrst_watch')) {
            console.error(`🔴 [ERROR] ${method} ${url} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        throw error;
    }
};

// Create Supabase client with enhanced configuration
let supabase: SupabaseClient;

try {
    // Common headers for all requests
    const headers = {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation'
    };

    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
            storageKey: 'svc',
            storage: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {}
            },
            flowType: 'pkce'
        },
        global: {
            headers: headers,
            fetch: customFetch
        },
        db: {
            schema: 'public'
        }
    });

    // Test the connection with a simple query
    (async () => {
        try {
            console.log('🔍 Testing Supabase connection...');
            const { data, error } = await supabase
                .from('articles')
                .select('id')
                .limit(1);
                
            if (error) throw error;
            console.log('✅ Successfully connected to Supabase');
            console.log('📊 Database connection test passed');
        } catch (error) {
            console.error('❌ Failed to connect to Supabase:', error);
        }
    })();
    
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    throw error;
}

// Clear any existing schema cache in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
    try {
        window.localStorage.removeItem('supabase.auth.token');
    } catch (e) {
        console.warn('⚠️ Could not clear localStorage:', e);
    }
}

// Export default for backward compatibility
export default supabase;
