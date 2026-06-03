-- =============================================================================
-- LUXPATH TRAVEL — SUPABASE STORAGE SETUP
-- =============================================================================
-- Run this AFTER schema.sql.
-- The luxpath-media bucket must be created first via the Supabase Dashboard
-- or the Management API (see instructions below).
-- =============================================================================


-- =============================================================================
-- STEP 1: CREATE THE BUCKET
-- =============================================================================
-- Run this in the Supabase Dashboard → Storage → New Bucket, OR via API:
--
-- Option A — Dashboard:
--   Name:           luxpath-media
--   Public bucket:  YES  (images are served publicly via CDN URL)
--   File size limit: 10 MB
--   Allowed MIME types: image/jpeg, image/webp, image/png, image/svg+xml
--
-- Option B — Management API (run once from your terminal):
--   curl -X POST 'https://<project-ref>.supabase.co/storage/v1/bucket' \
--     -H 'Authorization: Bearer <service_role_key>' \
--     -H 'Content-Type: application/json' \
--     -d '{
--           "id": "luxpath-media",
--           "name": "luxpath-media",
--           "public": true,
--           "file_size_limit": 10485760,
--           "allowed_mime_types": ["image/jpeg","image/webp","image/png","image/svg+xml"]
--         }'
--
-- Option C — Supabase JS client (run once from admin panel setup script):
--   const { data, error } = await supabase.storage.createBucket('luxpath-media', {
--       public: true,
--       fileSizeLimit: 10 * 1024 * 1024,   // 10 MB
--       allowedMimeTypes: ['image/jpeg', 'image/webp', 'image/png', 'image/svg+xml']
--   });
-- =============================================================================


-- =============================================================================
-- STEP 2: STORAGE RLS POLICIES
-- =============================================================================
-- Supabase Storage enforces RLS on the storage.objects table.
-- Run these policies after the bucket is created.
-- =============================================================================

-- Public: anyone can view/download any file in luxpath-media.
-- This is what serves images to website visitors.
CREATE POLICY "rls_storage_public_select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'luxpath-media');


-- Admins only: upload new files.
CREATE POLICY "rls_storage_admin_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'luxpath-media'
        AND (SELECT is_admin())
    );


-- Admins only: replace/update existing files.
CREATE POLICY "rls_storage_admin_update"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'luxpath-media'
        AND (SELECT is_admin())
    )
    WITH CHECK (
        bucket_id = 'luxpath-media'
        AND (SELECT is_admin())
    );


-- Admins only: delete files.
CREATE POLICY "rls_storage_admin_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'luxpath-media'
        AND (SELECT is_admin())
    );


-- =============================================================================
-- STEP 3: FOLDER STRUCTURE CONVENTION
-- =============================================================================
-- Supabase Storage is flat (no real folders), but prefixes simulate folders.
-- Always follow this path convention when uploading via the admin panel.
--
-- luxpath-media/
-- │
-- ├── site/
-- │   ├── logo.svg                    Brand logo (dark background version)
-- │   ├── logo-dark.svg               Brand logo (light background version)
-- │   ├── og-default.jpg              1200×630 — default Open Graph share image
-- │   └── hero-poster.jpg             Hero section background image
-- │
-- ├── destinations/
-- │   ├── bali-hero.webp              1920×1080 — Bali destination page hero
-- │   ├── bali-card.webp              800×600  — Bali homepage card
-- │   ├── jakarta-hero.webp
-- │   ├── jakarta-card.webp
-- │   ├── bandung-hero.webp
-- │   ├── bandung-card.webp
-- │   ├── lombok-hero.webp
-- │   └── lombok-card.webp
-- │
-- └── packages/
--     └── {slug_en}/                  Use the package's English slug as folder name
--         ├── hero.webp               1200×800  — Main card/header image
--         └── gallery/
--             ├── 01.webp             1200×800  — Gallery image 1
--             ├── 02.webp             Gallery image 2
--             ├── 03.webp             Gallery image 3
--             └── ...                 Up to 10 gallery images recommended
--
-- Image specifications:
--   Format:  WebP preferred. JPEG acceptable. PNG for logos/SVG elements.
--   Hero:    1920×1080, max 400 KB
--   Cards:   800×600,   max 150 KB
--   Gallery: 1200×800,  max 200 KB
--   Logo:    SVG (vector, any size)
--   OG:      1200×630,  max 200 KB
--
-- Naming convention: lowercase, hyphens only, no spaces, no special characters.
--   ✓ bali-rice-terraces-sunset.webp
--   ✗ Bali Rice Terraces (Sunset).JPG
-- =============================================================================


-- =============================================================================
-- STEP 4: PUBLIC URL PATTERN
-- =============================================================================
-- All storage URLs follow this pattern:
--
--   https://<project-ref>.supabase.co/storage/v1/object/public/luxpath-media/<path>
--
-- Example:
--   https://xyzabc.supabase.co/storage/v1/object/public/luxpath-media/packages/bali-honeymoon-7d/hero.webp
--
-- Store only the path suffix in the database (not the full URL).
-- This allows the base URL to be configured once in config.js.
--
-- In database columns (e.g. packages.hero_image_url), store:
--   'packages/bali-honeymoon-7d/hero.webp'
--
-- In JavaScript, construct the full URL:
--   const img = `${SUPABASE_URL}/storage/v1/object/public/luxpath-media/${row.hero_image_url}`
-- =============================================================================
