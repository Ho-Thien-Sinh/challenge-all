import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function addMissingColumns() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔧 Bắt đầu thêm các cột thiếu vào bảng articles...');
    
    const columnsToAdd = [
        { name: 'excerpt', type: 'TEXT', description: 'Tóm tắt ngắn bài viết' },
        { name: 'image', type: 'TEXT', description: 'Link ảnh phụ' },
        { name: 'link', type: 'TEXT', description: 'Liên kết bài viết' },
        { name: 'source', type: 'TEXT', description: 'Nguồn bài viết' },
        { name: 'url', type: 'TEXT', description: 'URL bài viết' }
    ];
    
    try {
        for (const column of columnsToAdd) {
            console.log(`📝 Thêm cột: ${column.name} (${column.description})`);
            
            const { data, error } = await supabase.rpc('exec_sql', {
                sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
            });
            
            if (error) {
                console.error(`❌ Lỗi khi thêm cột ${column.name}:`, error.message);
            } else {
                console.log(`✅ Đã thêm cột ${column.name} thành công`);
            }
        }
        
        // Tạo index cho các cột quan trọng
        console.log('🔍 Tạo index cho các cột...');
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);',
            'CREATE INDEX IF NOT EXISTS idx_articles_link ON articles(link);',
            'CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);'
        ];
        
        for (const indexSql of indexes) {
            const { error } = await supabase.rpc('exec_sql', { sql: indexSql });
            if (error) {
                console.error('❌ Lỗi khi tạo index:', error.message);
            } else {
                console.log('✅ Tạo index thành công');
            }
        }
        
        // Kiểm tra cấu trúc bảng sau khi thêm
        console.log('🔍 Kiểm tra cấu trúc bảng sau khi cập nhật...');
        const { data: tableData, error: tableError } = await supabase
            .from('articles')
            .select('*')
            .limit(1);
            
        if (!tableError && tableData && tableData.length > 0) {
            console.log('✅ Các cột hiện có trong bảng articles:');
            console.log(Object.keys(tableData[0]).sort());
        }
        
        console.log('🎉 Hoàn thành việc cập nhật cấu trúc bảng!');
        
    } catch (error) {
        console.error('❌ Lỗi tổng quát:', error);
    }
}

addMissingColumns();