import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function checkTableSchema() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        console.log('Kiểm tra cấu trúc bảng articles...');
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('Lỗi khi lấy thông tin bảng:', error);
            return;
        }
        
        if (data && data.length > 0) {
            console.log('Các cột hiện có trong bảng articles:');
            console.log(Object.keys(data[0]));
        } else {
            console.log('Bảng articles trống hoặc không có dữ liệu');
        }
        
        // Thử query thông tin schema
        const { data: schemaData, error: schemaError } = await supabase.rpc('get_table_columns', {
            table_name: 'articles'
        });
        
        if (!schemaError && schemaData) {
            console.log('Schema từ RPC:', schemaData);
        }
        
    } catch (error) {
        console.error('Lỗi khi kiểm tra cấu trúc bảng:', error);
    }
}

checkTableSchema();