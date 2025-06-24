/*
  # Create articles table for news website

  1. New Tables
    - `articles`
      - `id` (uuid, primary key) - Unique identifier for each article
      - `title` (text, required) - Article title
      - `content` (text, required) - Full article content in HTML format
      - `summary` (text, required) - Article summary/excerpt
      - `author` (text, required) - Article author name
      - `category` (text, required) - Article category (thoi-su, kinh-doanh, etc.)
      - `image_url` (text, optional) - URL to article featured image
      - `source_url` (text, required, unique) - Original URL from tuoitre.vn
      - `published_at` (timestamptz, required) - When the article was published
      - `created_at` (timestamptz, default now) - When record was created in our DB
      - `updated_at` (timestamptz, default now) - When record was last updated

  2. Security
    - Enable RLS on `articles` table
    - Add policies for public read access (since it's a news site)
    - Add policies for authenticated users to have full access

  3. Indexes
    - Add indexes for performance on frequently queried columns
    - Full-text search index for title, summary, and content
*/

-- Create the articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  summary text NOT NULL,
  author text NOT NULL DEFAULT 'Unknown',
  category text NOT NULL DEFAULT 'general',
  image_url text,
  source_url text NOT NULL UNIQUE,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (news articles should be publicly readable)
CREATE POLICY "Articles are publicly readable"
  ON articles
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users to insert/update (for the crawler)
CREATE POLICY "Authenticated users can insert articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author);

-- Create a full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_articles_search 
  ON articles 
  USING gin(to_tsvector('english', title || ' ' || summary || ' ' || content));

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();