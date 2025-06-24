# Hướng dẫn thêm cột thiếu vào bảng articles trong Supabase

## Bước 1: Đăng nhập vào Supabase Dashboard
1. Vào [https://supabase.com](https://supabase.com)
2. Đăng nhập vào project của bạn

## Bước 2: Mở SQL Editor
1. Vào tab **SQL Editor** trong dashboard
2. Tạo một query mới

## Bước 3: Chạy các lệnh SQL sau

```sql
-- Thêm cột excerpt (tóm tắt ngắn bài viết)
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

-- Tạo index để tối ưu hóa tìm kiếm
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_articles_link ON articles(link);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
```

## Bước 4: Kiểm tra kết quả

```sql
-- Kiểm tra cấu trúc bảng
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;
```

## Các cột được thêm:

1. **excerpt** - Tóm tắt ngắn của bài viết
2. **image** - Đường dẫn ảnh phụ (ngoài image_url chính)
3. **link** - Liên kết đến bài viết gốc
4. **source** - Tên nguồn tin (ví dụ: "tuoitre.vn")
5. **url** - URL đầy đủ của bài viết

Sau khi thêm xong, chạy lại server để kiểm tra!