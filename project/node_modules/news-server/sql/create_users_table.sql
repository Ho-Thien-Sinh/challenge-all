-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a table for public users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);

-- Set up Row Level Security (RLS)
-- Allow public read access to all users (for profile viewing)
CREATE POLICY "Allow public read access" ON public.users
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow individual update access" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to update any user
CREATE POLICY "Allow admin update access" ON public.users
  FOR UPDATE USING (auth.role() = 'authenticated' AND 
                  EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() AND role = 'admin'
                  ));

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, is_verified)
  VALUES (NEW.id, NEW.email, 'user', FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
