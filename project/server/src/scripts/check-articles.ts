import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Thiếu cấu hình SUPABASE_URL hoặc SUPABASE_KEY trong file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticles() {
  try {
    console.log('🔍 Đang kiểm tra dữ liệu bài viết...');
    
    // Count total number of articles
    const { count, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    console.log(`📊 Tổng số bài viết trong database: ${count}`);
    
    // Get 5 latest articles
    const { data: latestArticles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5);
      
    if (articlesError) throw articlesError;
    
    console.log('\n📰 5 bài viết mới nhất:');
    console.log('─'.repeat(80));
    
    latestArticles?.forEach((article: any, index: number) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   📌 Danh mục: ${article.category || 'Chưa phân loại'}`);
      console.log(`   📅 ${new Date(article.published_at).toLocaleString()}`);
      console.log(`   🔗 ${article.url}`);
    });
    
    // Check number of articles per category
    // Way 2: Using RPC
const { data: categories, error: catError } = await supabase
.rpc('get_article_counts');

if (categories) {
console.log('\n📊 Số bài viết theo danh mục:');
console.log('─'.repeat(30));
categories.forEach((cat: any) => {
  console.log(`- ${cat.category}: ${cat.count} bài`);
});
}
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dữ liệu:');
    console.error(error);
  }
}

checkArticles();
