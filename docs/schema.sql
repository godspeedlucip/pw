-- PostgreSQL schema draft for personal site CMS

CREATE TABLE admins (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE research_entries (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  date_range VARCHAR(120),
  summary TEXT,
  publications JSONB NOT NULL DEFAULT '[]',
  result_visual_url TEXT,
  tools JSONB NOT NULL DEFAULT '[]',
  keywords JSONB NOT NULL DEFAULT '[]',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_entries (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  context TEXT,
  star_situation TEXT,
  star_task TEXT,
  star_action TEXT,
  star_result TEXT,
  tech_stack JSONB NOT NULL DEFAULT '[]',
  github_url TEXT,
  demo_url TEXT,
  cover_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  category VARCHAR(120),
  tags JSONB NOT NULL DEFAULT '[]',
  markdown_body TEXT NOT NULL,
  latex_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reading_time_minutes INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE life_content (
  id UUID PRIMARY KEY,
  about_intro TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]',
  reading_list JSONB NOT NULL DEFAULT '[]',
  footprints JSONB NOT NULL DEFAULT '[]',
  skills JSONB NOT NULL DEFAULT '[]',
  resume_file_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE site_settings (
  id UUID PRIMARY KEY,
  site_title VARCHAR(255) NOT NULL,
  hero_slogan VARCHAR(255),
  current_status TEXT,
  contact_email VARCHAR(255),
  linkedin_url TEXT,
  github_url TEXT,
  footer_cta_text VARCHAR(255),
  seo_default_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media_assets (
  id UUID PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(120),
  file_size BIGINT,
  usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
