# Admin Wireframe Plan

## 1. Access
- Route: `/admin/login`
- Goal: Admin authentication entry
- Core blocks: Brand title, email input, password input, sign-in button

## 2. Dashboard
- Route: `/admin`
- Goal: One-screen status and quick navigation
- Core blocks:
  - KPI cards (post count, project count, featured count)
  - Recent updates feed
  - Quick links to edit research/projects/blog

## 3. Research Manager
- Route: `/admin/research`
- Goal: Manage research profile entries
- Entry form fields:
  - title
  - role
  - date_range
  - summary
  - publications
  - result_visual_url
  - tools
  - keywords
  - is_featured

## 4. Projects Manager
- Route: `/admin/projects`
- Goal: STAR-based project entries
- Entry form fields:
  - title
  - context
  - star_situation
  - star_task
  - star_action
  - star_result
  - tech_stack
  - github_url
  - demo_url
  - cover_image_url
  - is_featured

## 5. Blog Manager
- Route: `/admin/blog`
- Goal: Publish and maintain knowledge articles
- Entry form fields:
  - title
  - slug
  - excerpt
  - category
  - tags
  - markdown_body
  - latex_enabled
  - reading_time_minutes
  - status (draft/published)
  - published_at

## 6. Life/About Manager
- Route: `/admin/life`
- Goal: Manage personal branding content
- Entry form fields:
  - about_intro
  - gallery_images
  - reading_list
  - footprints (event + date + place)
  - skills (optional)
  - resume_file

## 7. Site Settings
- Route: `/admin/site-settings`
- Goal: Centralized global config
- Fields:
  - site_title
  - hero_slogan
  - current_status
  - contact_email
  - linkedin_url
  - github_url
  - footer_cta_text
  - seo_default_description

## 8. Media Library
- Route: `/admin/media`
- Goal: Upload and reuse assets
- Features:
  - file upload
  - type filter (project/blog/life/avatar/resume)
  - metadata (size, upload time, usage count)
