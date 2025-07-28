-- Reelax Application Schema
-- This schema defines the tables needed for the Reelax application
-- User authentication is handled by Supabase Auth

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles
-- Extends the auth.users table from Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
-- Content projects that users create and manage
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  platform VARCHAR(20) NOT NULL, -- 'YouTube', 'TikTok', etc.
  status VARCHAR(20) NOT NULL, -- 'Draft', 'In Progress', 'Published'
  thumbnail_url TEXT,
  views_count BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Project Tags
-- Tags associated with projects
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Project-Tag Relationships
CREATE TABLE project_tag_relations (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES project_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- Content Items
-- Individual content pieces within a project (videos, posts, etc.)
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) NOT NULL, -- 'video', 'image', 'text', etc.
  content_url TEXT,
  duration INTEGER, -- in seconds, for video/audio content
  status VARCHAR(20) NOT NULL, -- 'Draft', 'Ready', 'Published'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- AI Generations
-- Stores AI-generated content for projects
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  generation_type VARCHAR(50) NOT NULL, -- 'title', 'description', 'thumbnail', 'script', etc.
  prompt TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics
-- Stores analytics data for projects and content
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  watch_time BIGINT DEFAULT 0, -- in seconds
  date DATE NOT NULL,
  CONSTRAINT project_or_content_required CHECK (
    (project_id IS NOT NULL) OR (content_item_id IS NOT NULL)
  )
);

-- User Settings
-- Application settings for users
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  language VARCHAR(10) DEFAULT 'en',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_content_items_project_id ON content_items(project_id);
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_project_id ON ai_generations(project_id);
CREATE INDEX idx_analytics_project_id ON analytics(project_id);
CREATE INDEX idx_analytics_content_item_id ON analytics(content_item_id);
CREATE INDEX idx_analytics_date ON analytics(date);

-- Create RLS (Row Level Security) policies
-- These policies ensure users can only access their own data

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select_policy ON projects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY projects_insert_policy ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update_policy ON projects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY projects_delete_policy ON projects
  FOR DELETE USING (user_id = auth.uid());

-- Content Items RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_items_select_policy ON content_items
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY content_items_insert_policy ON content_items
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY content_items_update_policy ON content_items
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY content_items_delete_policy ON content_items
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- AI Generations RLS
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_generations_select_policy ON ai_generations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY ai_generations_insert_policy ON ai_generations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Analytics RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_select_policy ON analytics
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()) OR
    content_item_id IN (SELECT id FROM content_items WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  );

-- User Settings RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_settings_select_policy ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_settings_insert_policy ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_settings_update_policy ON user_settings
  FOR UPDATE USING (user_id = auth.uid());
