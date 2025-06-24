-- Thêm các cột thiếu vào bảng articles
-- Chạy các lệnh này trong Supabase SQL Editor

-- Thêm cột excerpt (tóm tắt ngắn)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Thêm cột image (link ảnh phụ)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Thêm cột link (liên kết bài viết)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS link TEXT;

-- Thêm cột source (nguồn bài viết)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS source TEXT;

-- Thêm cột url (URL bài viết)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Tạo index cho các cột hay được tìm kiếm
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_articles_link ON articles(link);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);

-- Kiểm tra cấu trúc bảng sau khi thêm
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'articles' 
-- ORDER BY ordinal_position;