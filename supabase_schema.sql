-- Drop tables if they exist to ensure a clean slate (CAREFUL: This deletes data)
-- DROP TABLE IF EXISTS pages;
-- DROP TABLE IF EXISTS users;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT 'managed-by-supabase',
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    otp_secret TEXT,
    otp_expiry TEXT,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE
);

-- Create Pages Table
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content TEXT DEFAULT '{}',
    icon TEXT,
    cover_image TEXT,
    is_expanded BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tags TEXT[] DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON pages(parent_id);
