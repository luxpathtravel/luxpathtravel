-- =============================================================================
-- LUXPATH TRAVEL — SUPABASE PRODUCTION SCHEMA
-- Version: 1.0.0
-- Description: Complete database for a bilingual (AR/EN) luxury travel site
--              targeting Saudi Arabia. Indonesia destinations only.
-- =============================================================================
-- Run order: This file is self-contained. Execute top to bottom.
-- Supabase project: luxpathtravel
-- =============================================================================


-- =============================================================================
-- SECTION 1: EXTENSIONS
-- =============================================================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram index support (enables fast ILIKE / fuzzy search in admin)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Unaccent for search normalization (optional, useful for Arabic diacritic-free search)
-- CREATE EXTENSION IF NOT EXISTS "unaccent";


-- =============================================================================
-- SECTION 2: SHARED UTILITY FUNCTION
-- =============================================================================

-- Automatically updates the `updated_at` column on any table that uses it.
-- Applied via trigger — never call manually.
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


-- =============================================================================
-- SECTION 3: ADMIN ROLE MANAGEMENT
-- =============================================================================

-- Links Supabase Auth users to application roles.
-- Only users in this table can write to protected tables.
-- The `super_admin` role can manage other admins.
CREATE TABLE IF NOT EXISTS user_roles (
    user_id     uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role        text        NOT NULL DEFAULT 'admin'
                            CHECK (role IN ('admin', 'super_admin')),
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  user_roles          IS 'Maps Supabase Auth users to application roles. Required for admin access.';
COMMENT ON COLUMN user_roles.role     IS 'admin: full content management. super_admin: can also manage other admins.';

-- Security-definer function: runs as the table owner, bypassing caller RLS.
-- Used in all RLS policies to check admin status without direct table access.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM   user_roles
        WHERE  user_id = auth.uid()
        AND    role    IN ('admin', 'super_admin')
    );
$$;

COMMENT ON FUNCTION is_admin() IS 'Returns true if the currently authenticated user has admin or super_admin role.';


-- =============================================================================
-- SECTION 4: DESTINATIONS TABLE
-- =============================================================================

-- Fixed set: Bali, Jakarta, Bandung, Lombok.
-- Content (descriptions, images) is editable via admin panel.
CREATE TABLE IF NOT EXISTS destinations (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug                text        UNIQUE NOT NULL,  -- e.g. 'bali', 'jakarta'

    -- Bilingual content
    name_ar             text        NOT NULL,
    name_en             text        NOT NULL,
    tagline_ar          text,                         -- 'جنة الآلهة'
    tagline_en          text,                         -- 'Island of the Gods'
    description_ar      text,                         -- Long destination overview (AR)
    description_en      text,                         -- Long destination overview (EN)

    -- Images (URLs from Supabase Storage)
    hero_image_url      text,                         -- Full-width destination hero
    card_image_url      text,                         -- Homepage destination card

    -- SEO fields
    meta_title_ar       text        CHECK (char_length(meta_title_ar)      <= 70),
    meta_title_en       text        CHECK (char_length(meta_title_en)      <= 70),
    meta_description_ar text        CHECK (char_length(meta_description_ar) <= 170),
    meta_description_en text        CHECK (char_length(meta_description_en) <= 170),

    -- Visibility & ordering
    is_active           boolean     NOT NULL DEFAULT true,
    display_order       smallint    NOT NULL DEFAULT 0,

    -- Timestamps
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  destinations IS 'Indonesia tourism destinations. Fixed set: Bali, Jakarta, Bandung, Lombok.';
COMMENT ON COLUMN destinations.slug IS 'URL-safe ASCII slug used in page URLs and Supabase Storage paths.';

CREATE TRIGGER trg_destinations_updated_at
    BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- SECTION 5: PACKAGES TABLE
-- =============================================================================

-- Core content table. One row per travel package.
-- Related data (images, inclusions, itinerary) live in child tables.
CREATE TABLE IF NOT EXISTS packages (
    id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- ─── Slugs ────────────────────────────────────────────────────────────
    slug_en                 text        UNIQUE NOT NULL,  -- 'bali-honeymoon-7d'
    slug_ar                 text        UNIQUE NOT NULL,  -- 'باقة-شهر-العسل-بالي'

    -- ─── Titles ───────────────────────────────────────────────────────────
    title_ar                text        NOT NULL,
    title_en                text        NOT NULL,

    -- ─── Descriptions ─────────────────────────────────────────────────────
    short_description_ar    text,                 -- Card teaser (100–150 chars)
    short_description_en    text,
    full_description_ar     text,                 -- Detail page body
    full_description_en     text,

    -- ─── Duration ─────────────────────────────────────────────────────────
    -- Stored independently to allow day-trips (0 nights) or custom combos.
    duration_nights         smallint    NOT NULL CHECK (duration_nights >= 0),
    duration_days           smallint    NOT NULL CHECK (duration_days   >= 1),

    CONSTRAINT duration_days_gte_nights
        CHECK (duration_days >= duration_nights),

    -- ─── Package Type ─────────────────────────────────────────────────────
    category                text        NOT NULL
                            CHECK (category IN ('honeymoon', 'family', 'luxury', 'adventure')),

    -- ─── Pricing ──────────────────────────────────────────────────────────
    price_type              text        NOT NULL DEFAULT 'starting_from'
                            CHECK (price_type IN ('exact', 'starting_from', 'approximate')),

    price_value             numeric(10,2) NOT NULL CHECK (price_value >= 0),

    -- Optional: original price to display a crossed-out "was" price.
    -- Only populate when a genuine discount exists — never fabricate.
    original_price_value    numeric(10,2) CHECK (
                                original_price_value IS NULL
                                OR original_price_value > price_value
                            ),

    currency                text        NOT NULL DEFAULT 'SAR'
                            CHECK (currency IN ('SAR', 'USD', 'EUR')),

    -- ─── Group Size ───────────────────────────────────────────────────────
    min_persons             smallint    NOT NULL DEFAULT 1  CHECK (min_persons >= 1),
    max_persons             smallint    CHECK (max_persons IS NULL OR max_persons >= min_persons),

    -- ─── Main Image ───────────────────────────────────────────────────────
    -- Denormalized for performance: avoids a join on every list page.
    -- Must stay in sync with the primary record in package_images.
    hero_image_url          text,

    -- ─── Flags ────────────────────────────────────────────────────────────
    is_featured             boolean     NOT NULL DEFAULT false,
    is_active               boolean     NOT NULL DEFAULT true,

    -- ─── Display ──────────────────────────────────────────────────────────
    display_order           smallint    NOT NULL DEFAULT 0,

    -- ─── Analytics (denormalized counters — updated by triggers) ──────────
    view_count              integer     NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    inquiry_count           integer     NOT NULL DEFAULT 0 CHECK (inquiry_count >= 0),

    -- ─── SEO Fields ───────────────────────────────────────────────────────
    seo_title_ar            text        CHECK (char_length(seo_title_ar)       <= 70),
    seo_title_en            text        CHECK (char_length(seo_title_en)       <= 70),
    seo_description_ar      text        CHECK (char_length(seo_description_ar) <= 170),
    seo_description_en      text        CHECK (char_length(seo_description_en) <= 170),
    seo_keywords            text[],     -- e.g. '{بكجات عرسان بالي, شهر العسل}'

    -- ─── Timestamps ───────────────────────────────────────────────────────
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  packages                   IS 'Travel packages offered by Luxpath. Each row is a bookable product.';
COMMENT ON COLUMN packages.slug_en           IS 'Used in page URLs and WhatsApp pre-fill messages. ASCII only.';
COMMENT ON COLUMN packages.slug_ar           IS 'Arabic slug for Arabic URL structure. May contain Arabic Unicode.';
COMMENT ON COLUMN packages.price_type        IS 'exact = fixed price; starting_from = minimum price; approximate = indicative.';
COMMENT ON COLUMN packages.hero_image_url    IS 'Denormalized from package_images for fast list queries. Keep in sync.';
COMMENT ON COLUMN packages.seo_keywords      IS 'PostgreSQL text array. Supports GIN index for keyword search.';

CREATE TRIGGER trg_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- SECTION 6: PACKAGE ↔ DESTINATIONS JUNCTION
-- =============================================================================

-- A package can cover multiple destinations (e.g. Bali + Bandung).
-- Exactly one destination per package must be marked is_primary = true.
CREATE TABLE IF NOT EXISTS package_destinations (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      uuid        NOT NULL REFERENCES packages(id)     ON DELETE CASCADE,
    destination_id  uuid        NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
    is_primary      boolean     NOT NULL DEFAULT false,
    display_order   smallint    NOT NULL DEFAULT 0,

    CONSTRAINT unique_package_destination UNIQUE (package_id, destination_id)
);

COMMENT ON TABLE  package_destinations            IS 'Many-to-many join: a package can span multiple destinations.';
COMMENT ON COLUMN package_destinations.is_primary IS 'Exactly one row per package_id must be true. Enforced by partial unique index.';

-- Database-level guarantee: at most one primary destination per package.
-- (Minimum one is enforced by the application on save.)
CREATE UNIQUE INDEX uidx_package_destinations_one_primary
    ON package_destinations (package_id)
    WHERE is_primary = true;


-- =============================================================================
-- SECTION 7: PACKAGE IMAGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS package_images (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      uuid        NOT NULL REFERENCES packages(id) ON DELETE CASCADE,

    image_url       text        NOT NULL,
    alt_ar          text,                     -- Arabic alt text for SEO & accessibility
    alt_en          text,                     -- English alt text
    is_hero         boolean     NOT NULL DEFAULT false,  -- The main card/header image
    display_order   smallint    NOT NULL DEFAULT 0,

    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  package_images         IS 'Gallery images for each package. The is_hero row matches packages.hero_image_url.';
COMMENT ON COLUMN package_images.is_hero IS 'Exactly one image per package should be the hero. Enforced by application on save.';

-- One hero image per package (partial unique index).
CREATE UNIQUE INDEX uidx_package_images_one_hero
    ON package_images (package_id)
    WHERE is_hero = true;


-- =============================================================================
-- SECTION 8: PACKAGE INCLUSIONS TABLE
-- =============================================================================

-- Stores both "what's included" and "what's excluded" items.
-- The `type` column distinguishes them.
CREATE TABLE IF NOT EXISTS package_inclusions (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      uuid        NOT NULL REFERENCES packages(id) ON DELETE CASCADE,

    type            text        NOT NULL CHECK (type IN ('included', 'excluded')),

    -- Icon key maps to a CSS/SVG icon in the frontend.
    -- Predefined set for consistency across packages.
    icon            text        CHECK (icon IN (
                                    'flight',
                                    'hotel',
                                    'meal_breakfast',
                                    'meal_lunch',
                                    'meal_dinner',
                                    'meals_all',
                                    'transfer',
                                    'guide_arabic',
                                    'guide_local',
                                    'tour',
                                    'visa',
                                    'insurance',
                                    'sim_card',
                                    'photo_session',
                                    'water_activities',
                                    'spa',
                                    'custom'          -- fallback for anything else
                                )),

    text_ar         text        NOT NULL,
    text_en         text        NOT NULL,
    display_order   smallint    NOT NULL DEFAULT 0
);

COMMENT ON TABLE  package_inclusions      IS 'Included and excluded items for a package. Displayed as checklist on detail page.';
COMMENT ON COLUMN package_inclusions.icon IS 'Maps to a frontend icon component. Use custom for one-off items.';


-- =============================================================================
-- SECTION 9: PACKAGE ITINERARY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS package_itinerary (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id      uuid        NOT NULL REFERENCES packages(id) ON DELETE CASCADE,

    day_number      smallint    NOT NULL CHECK (day_number >= 1),
    title_ar        text        NOT NULL,   -- 'اليوم الأول — الوصول والاستقبال'
    title_en        text        NOT NULL,   -- 'Day 1 — Arrival & Welcome'
    description_ar  text,                  -- Full day narrative (Arabic)
    description_en  text,                  -- Full day narrative (English)
    location_ar     text,                  -- Which area: 'نوسا دوا'
    location_en     text,                  -- Which area: 'Nusa Dua'

    -- Array of meal codes for this day.
    -- Values: 'breakfast', 'lunch', 'dinner'
    meals_included  text[]      DEFAULT '{}',

    -- Optional day-specific image (e.g. the temple visited that day).
    image_url       text,

    -- Each day number must be unique within a package.
    CONSTRAINT unique_package_day UNIQUE (package_id, day_number)
);

COMMENT ON TABLE  package_itinerary                 IS 'Day-by-day program for each package. Each row = one day of travel.';
COMMENT ON COLUMN package_itinerary.meals_included  IS 'Array of meals: breakfast, lunch, dinner. Empty array = no meals included.';


-- =============================================================================
-- SECTION 10: INQUIRIES TABLE
-- =============================================================================

-- Customer contact/booking requests submitted via the website.
-- Public can INSERT. Only admins can SELECT, UPDATE, DELETE.
CREATE TABLE IF NOT EXISTS inquiries (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Which package/destination prompted the inquiry (nullable = general inquiry).
    package_id          uuid        REFERENCES packages(id)     ON DELETE SET NULL,
    destination_id      uuid        REFERENCES destinations(id) ON DELETE SET NULL,

    -- ─── Contact Details ──────────────────────────────────────────────────
    full_name           text        NOT NULL CHECK (char_length(full_name) >= 2),
    phone               text        NOT NULL CHECK (phone ~ '^[+]?[0-9\s\-()]{7,20}$'),
    whatsapp            text,                -- May differ from phone
    email               text        CHECK (
                            email IS NULL
                            OR email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
                        ),

    -- ─── Trip Details ─────────────────────────────────────────────────────
    message             text,
    preferred_date      date        CHECK (preferred_date IS NULL OR preferred_date >= CURRENT_DATE),
    adults_count        smallint    NOT NULL DEFAULT 1 CHECK (adults_count  >= 1),
    children_count      smallint    NOT NULL DEFAULT 0 CHECK (children_count >= 0),

    -- ─── Attribution ──────────────────────────────────────────────────────
    source_language     text        NOT NULL DEFAULT 'ar'
                        CHECK (source_language IN ('ar', 'en')),
    source_page         text,       -- URL of page where form was submitted
    utm_source          text,       -- e.g. 'instagram'
    utm_medium          text,       -- e.g. 'paid_social'
    utm_campaign        text,       -- e.g. 'bali_honeymoon_may25'

    -- ─── Admin Workflow ───────────────────────────────────────────────────
    status              text        NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new', 'contacted', 'quoted', 'confirmed', 'cancelled')),
    admin_notes         text,

    -- ─── Timestamps ───────────────────────────────────────────────────────
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  inquiries              IS 'Customer booking/inquiry submissions. Admins manage these through the admin panel.';
COMMENT ON COLUMN inquiries.status       IS 'Workflow: new → contacted → quoted → confirmed (or cancelled at any step).';
COMMENT ON COLUMN inquiries.whatsapp     IS 'Customer may provide a different WhatsApp number for easier follow-up.';

CREATE TRIGGER trg_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- SECTION 11: TESTIMONIALS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Optional link to package/destination this review relates to.
    package_id          uuid        REFERENCES packages(id)     ON DELETE SET NULL,
    destination_id      uuid        REFERENCES destinations(id) ON DELETE SET NULL,

    -- ─── Reviewer ─────────────────────────────────────────────────────────
    -- Store initials + city rather than full name to respect Saudi privacy norms.
    reviewer_name_display text      NOT NULL,      -- 'سارة م.' or 'Sarah M.'
    reviewer_city         text,                    -- 'الرياض', 'Riyadh'
    reviewer_flag         text      DEFAULT '🇸🇦',  -- Country flag emoji

    -- ─── Review Content ───────────────────────────────────────────────────
    rating              smallint    NOT NULL DEFAULT 5
                        CHECK (rating BETWEEN 1 AND 5),
    review_ar           text        NOT NULL,
    review_en           text,

    -- ─── Trip Context (shown below the review for credibility) ────────────
    trip_month          smallint    CHECK (trip_month BETWEEN 1 AND 12),
    trip_year           smallint    CHECK (trip_year  BETWEEN 2020 AND 2030),
    trip_category       text        CHECK (trip_category IN ('honeymoon', 'family', 'luxury', 'adventure')),

    -- ─── Admin Controls ───────────────────────────────────────────────────
    is_approved         boolean     NOT NULL DEFAULT false,  -- Must be approved before showing
    is_featured         boolean     NOT NULL DEFAULT false,  -- Shown on homepage
    display_order       smallint    NOT NULL DEFAULT 0,

    created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  testimonials              IS 'Customer reviews. Must be approved by admin before appearing on site.';
COMMENT ON COLUMN testimonials.is_approved  IS 'Only approved testimonials are visible publicly (RLS enforced).';
COMMENT ON COLUMN testimonials.reviewer_name_display IS 'Display name — use initials for privacy. e.g. "سارة م." not full name.';


-- =============================================================================
-- SECTION 12: SITE SETTINGS TABLE
-- =============================================================================

-- Key-value store for dynamic site-wide content editable by admins.
-- Avoids hardcoding contact info, hero text, and counts in HTML.
CREATE TABLE IF NOT EXISTS site_settings (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    key         text        UNIQUE NOT NULL,  -- Machine-readable key, never changes
    value       text,                         -- Generic value (numbers, URLs, etc.)
    value_ar    text,                         -- Arabic content
    value_en    text,                         -- English content
    description text,                         -- Shown in admin panel as a hint
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  site_settings IS 'Admin-editable site-wide settings. Public read, admin write.';

CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- SECTION 13: BLOG POSTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

    slug                text        UNIQUE NOT NULL,   -- 'best-time-travel-bali-saudi'
    related_destination uuid        REFERENCES destinations(id) ON DELETE SET NULL,

    -- ─── Content ──────────────────────────────────────────────────────────
    title_ar            text        NOT NULL,
    title_en            text,
    content_ar          text,                -- Full post body (Arabic) — Markdown or HTML
    content_en          text,                -- Full post body (English)
    excerpt_ar          text,                -- Short teaser for cards (150 chars max)
    excerpt_en          text,

    -- ─── Media ────────────────────────────────────────────────────────────
    hero_image_url      text,

    -- ─── Taxonomy ─────────────────────────────────────────────────────────
    category            text        CHECK (category IN (
                                        'destination_guide',
                                        'honeymoon',
                                        'family',
                                        'travel_tips',
                                        'visa_info',
                                        'food_halal',
                                        'comparison'
                                    )),
    tags                text[],              -- e.g. '{بالي, شهر العسل, اندونيسيا}'

    -- ─── Publishing ───────────────────────────────────────────────────────
    is_published        boolean     NOT NULL DEFAULT false,
    is_featured         boolean     NOT NULL DEFAULT false,
    published_at        timestamptz,

    -- ─── Analytics ────────────────────────────────────────────────────────
    view_count          integer     NOT NULL DEFAULT 0 CHECK (view_count >= 0),

    -- ─── SEO ──────────────────────────────────────────────────────────────
    seo_title_ar        text        CHECK (char_length(seo_title_ar)       <= 70),
    seo_title_en        text        CHECK (char_length(seo_title_en)       <= 70),
    seo_description_ar  text        CHECK (char_length(seo_description_ar) <= 170),
    seo_description_en  text        CHECK (char_length(seo_description_en) <= 170),
    seo_keywords        text[],

    -- ─── Timestamps ───────────────────────────────────────────────────────
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  blog_posts IS 'SEO-focused blog posts. Arabic content required; English optional.';
COMMENT ON COLUMN blog_posts.published_at IS 'Set to now() when is_published flips to true. Determines sitemap lastmod.';

CREATE TRIGGER trg_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- SECTION 14: TRIGGERS — BUSINESS LOGIC
-- =============================================================================

-- ─── Trigger: Auto-increment inquiry counter on packages ─────────────────────
-- Keeps a fast denormalized count on the packages row.
-- Decrements if inquiry is deleted (rare but handled).

CREATE OR REPLACE FUNCTION fn_sync_inquiry_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.package_id IS NOT NULL THEN
        UPDATE packages
        SET    inquiry_count = inquiry_count + 1
        WHERE  id = NEW.package_id;

    ELSIF TG_OP = 'DELETE' AND OLD.package_id IS NOT NULL THEN
        UPDATE packages
        SET    inquiry_count = GREATEST(0, inquiry_count - 1)
        WHERE  id = OLD.package_id;

    ELSIF TG_OP = 'UPDATE'
          AND OLD.package_id IS DISTINCT FROM NEW.package_id THEN
        -- Package link changed: decrement old, increment new.
        IF OLD.package_id IS NOT NULL THEN
            UPDATE packages
            SET    inquiry_count = GREATEST(0, inquiry_count - 1)
            WHERE  id = OLD.package_id;
        END IF;
        IF NEW.package_id IS NOT NULL THEN
            UPDATE packages
            SET    inquiry_count = inquiry_count + 1
            WHERE  id = NEW.package_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_inquiry_count
    AFTER INSERT OR UPDATE OF package_id OR DELETE
    ON  inquiries
    FOR EACH ROW EXECUTE FUNCTION fn_sync_inquiry_count();


-- ─── Trigger: Sync hero_image_url on packages when package_images changes ─────
-- Keeps packages.hero_image_url in sync with the is_hero row in package_images.

CREATE OR REPLACE FUNCTION fn_sync_hero_image()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.is_hero = true THEN
        UPDATE packages
        SET    hero_image_url = NEW.image_url
        WHERE  id = NEW.package_id;

    ELSIF TG_OP = 'DELETE' AND OLD.is_hero = true THEN
        -- Hero image deleted: clear the denormalized field.
        -- Admin must set a new hero image.
        UPDATE packages
        SET    hero_image_url = NULL
        WHERE  id = OLD.package_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_sync_hero_image
    AFTER INSERT OR UPDATE OF is_hero, image_url OR DELETE
    ON  package_images
    FOR EACH ROW EXECUTE FUNCTION fn_sync_hero_image();


-- ─── Trigger: Auto-set published_at when a blog post is published ─────────────

CREATE OR REPLACE FUNCTION fn_set_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.is_published = true AND OLD.is_published = false THEN
        NEW.published_at = now();
    ELSIF NEW.is_published = false THEN
        NEW.published_at = NULL;  -- Reset if unpublished
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_blog_set_published_at
    BEFORE UPDATE OF is_published ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION fn_set_published_at();


-- =============================================================================
-- SECTION 15: INDEXES
-- =============================================================================
-- Strategy:
--   • Prefix all indexes: idx_<table>_<columns>
--   • Partial indexes (WHERE clause) for boolean filter hot paths
--   • GIN indexes for array fields (seo_keywords, tags)
--   • Trigram indexes for admin search (ILIKE queries)
-- =============================================================================

-- ─── destinations ─────────────────────────────────────────────────────────────
CREATE INDEX idx_destinations_slug         ON destinations (slug);
CREATE INDEX idx_destinations_active_order ON destinations (is_active, display_order)
    WHERE is_active = true;

-- ─── packages ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_packages_slug_en          ON packages (slug_en);
CREATE INDEX idx_packages_slug_ar          ON packages (slug_ar);
CREATE INDEX idx_packages_category         ON packages (category);

-- Hot path: homepage active package list
CREATE INDEX idx_packages_active_order     ON packages (is_active, display_order)
    WHERE is_active = true;

-- Hot path: homepage featured packages
CREATE INDEX idx_packages_featured         ON packages (is_active, is_featured, display_order)
    WHERE is_active = true AND is_featured = true;

-- Filter by category (active only)
CREATE INDEX idx_packages_active_category  ON packages (is_active, category, display_order)
    WHERE is_active = true;

-- Price range filtering
CREATE INDEX idx_packages_price            ON packages (price_value);

-- Admin full-text search on package titles
CREATE INDEX idx_packages_title_ar_trgm    ON packages USING gin (title_ar gin_trgm_ops);
CREATE INDEX idx_packages_title_en_trgm    ON packages USING gin (title_en gin_trgm_ops);

-- SEO keyword lookup (GIN on array)
CREATE INDEX idx_packages_seo_keywords     ON packages USING gin (seo_keywords);

-- Created date descending (admin "recent" sort)
CREATE INDEX idx_packages_created_at       ON packages (created_at DESC);

-- ─── package_destinations ─────────────────────────────────────────────────────
CREATE INDEX idx_pkg_dest_package          ON package_destinations (package_id);
CREATE INDEX idx_pkg_dest_destination      ON package_destinations (destination_id);

-- ─── package_images ───────────────────────────────────────────────────────────
CREATE INDEX idx_pkg_images_package        ON package_images (package_id, display_order);

-- ─── package_inclusions ───────────────────────────────────────────────────────
CREATE INDEX idx_pkg_inclusions_package    ON package_inclusions (package_id);
CREATE INDEX idx_pkg_inclusions_type       ON package_inclusions (package_id, type);

-- ─── package_itinerary ────────────────────────────────────────────────────────
CREATE INDEX idx_pkg_itinerary_package     ON package_itinerary (package_id, day_number);

-- ─── inquiries ────────────────────────────────────────────────────────────────
CREATE INDEX idx_inquiries_status          ON inquiries (status);
CREATE INDEX idx_inquiries_status_date     ON inquiries (status, created_at DESC);
CREATE INDEX idx_inquiries_package         ON inquiries (package_id)
    WHERE package_id IS NOT NULL;
CREATE INDEX idx_inquiries_phone_trgm      ON inquiries USING gin (phone gin_trgm_ops);
CREATE INDEX idx_inquiries_created         ON inquiries (created_at DESC);

-- ─── testimonials ─────────────────────────────────────────────────────────────
CREATE INDEX idx_testimonials_featured     ON testimonials (is_approved, is_featured, display_order)
    WHERE is_approved = true AND is_featured = true;
CREATE INDEX idx_testimonials_destination  ON testimonials (destination_id)
    WHERE destination_id IS NOT NULL AND is_approved = true;
CREATE INDEX idx_testimonials_package      ON testimonials (package_id)
    WHERE package_id IS NOT NULL AND is_approved = true;

-- ─── blog_posts ───────────────────────────────────────────────────────────────
CREATE INDEX idx_blog_slug                 ON blog_posts (slug);
CREATE INDEX idx_blog_published            ON blog_posts (is_published, published_at DESC)
    WHERE is_published = true;
CREATE INDEX idx_blog_destination          ON blog_posts (related_destination)
    WHERE related_destination IS NOT NULL;
CREATE INDEX idx_blog_tags                 ON blog_posts USING gin (tags);
CREATE INDEX idx_blog_seo_keywords         ON blog_posts USING gin (seo_keywords);


-- =============================================================================
-- SECTION 16: ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Policy naming convention: rls_<table>_<role>_<operation>
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE user_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_itinerary  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts         ENABLE ROW LEVEL SECURITY;


-- ─── user_roles ───────────────────────────────────────────────────────────────

-- Only super_admins can manage the admin user list.
CREATE POLICY rls_user_roles_super_admin_all
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND   ur.role    = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND   ur.role    = 'super_admin'
        )
    );

-- Admins can view their own role record.
CREATE POLICY rls_user_roles_self_select
    ON user_roles FOR SELECT
    USING (user_id = auth.uid());


-- ─── destinations ─────────────────────────────────────────────────────────────

-- Public: read active destinations only.
CREATE POLICY rls_destinations_public_select
    ON destinations FOR SELECT
    USING (is_active = true);

-- Admins: full access.
CREATE POLICY rls_destinations_admin_all
    ON destinations FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── packages ─────────────────────────────────────────────────────────────────

-- Public: read active packages only.
CREATE POLICY rls_packages_public_select
    ON packages FOR SELECT
    USING (is_active = true);

-- Admins: full access (can see inactive/draft packages too).
CREATE POLICY rls_packages_admin_all
    ON packages FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── package_destinations ─────────────────────────────────────────────────────

-- Public: readable (they need destination names on package cards).
CREATE POLICY rls_pkg_dest_public_select
    ON package_destinations FOR SELECT
    USING (true);

-- Admins: full access.
CREATE POLICY rls_pkg_dest_admin_all
    ON package_destinations FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── package_images ───────────────────────────────────────────────────────────

CREATE POLICY rls_pkg_images_public_select
    ON package_images FOR SELECT
    USING (true);

CREATE POLICY rls_pkg_images_admin_all
    ON package_images FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── package_inclusions ───────────────────────────────────────────────────────

CREATE POLICY rls_pkg_inclusions_public_select
    ON package_inclusions FOR SELECT
    USING (true);

CREATE POLICY rls_pkg_inclusions_admin_all
    ON package_inclusions FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── package_itinerary ────────────────────────────────────────────────────────

CREATE POLICY rls_pkg_itinerary_public_select
    ON package_itinerary FOR SELECT
    USING (true);

CREATE POLICY rls_pkg_itinerary_admin_all
    ON package_itinerary FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── inquiries ────────────────────────────────────────────────────────────────

-- Public: can submit (INSERT) inquiries. Cannot read any rows.
CREATE POLICY rls_inquiries_public_insert
    ON inquiries FOR INSERT
    WITH CHECK (
        -- Prevent status/admin_notes manipulation on insert.
        status      = 'new'
        AND admin_notes IS NULL
    );

-- Admins: full access to all inquiries.
CREATE POLICY rls_inquiries_admin_all
    ON inquiries FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── testimonials ─────────────────────────────────────────────────────────────

-- Public: only approved and featured testimonials are readable.
CREATE POLICY rls_testimonials_public_select
    ON testimonials FOR SELECT
    USING (is_approved = true);

-- Admins: full access.
CREATE POLICY rls_testimonials_admin_all
    ON testimonials FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── site_settings ────────────────────────────────────────────────────────────

-- Public: can read all settings (WhatsApp number, social links, etc.).
CREATE POLICY rls_settings_public_select
    ON site_settings FOR SELECT
    USING (true);

-- Admins: full access.
CREATE POLICY rls_settings_admin_all
    ON site_settings FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- ─── blog_posts ───────────────────────────────────────────────────────────────

-- Public: only published posts.
CREATE POLICY rls_blog_public_select
    ON blog_posts FOR SELECT
    USING (is_published = true);

-- Admins: full access.
CREATE POLICY rls_blog_admin_all
    ON blog_posts FOR ALL
    USING    (is_admin())
    WITH CHECK (is_admin());


-- =============================================================================
-- SECTION 17: SEED DATA
-- =============================================================================

-- ─── Destinations ─────────────────────────────────────────────────────────────

INSERT INTO destinations (slug, name_ar, name_en, tagline_ar, tagline_en, display_order)
VALUES
    ('bali',    'بالي',    'Bali',    'جنة الآلهة',     'Island of the Gods',   1),
    ('jakarta', 'جاكرتا',  'Jakarta', 'قلب إندونيسيا',  'Heart of Indonesia',   2),
    ('bandung', 'باندونغ', 'Bandung', 'مدينة الأزهار',  'City of Flowers',      3),
    ('lombok',  'لومبوك',  'Lombok',  'الجنة الخفية',   'Hidden Paradise',      4)
ON CONFLICT (slug) DO NOTHING;


-- ─── Site Settings ────────────────────────────────────────────────────────────

INSERT INTO site_settings (key, value, value_ar, value_en, description)
VALUES
    -- Contact
    ('whatsapp_number',       '+62500000000', NULL,                                    NULL,                                      'WhatsApp number with country code. Used in all CTA links.'),
    ('company_email',         'info@luxpathtravel.com', NULL,                           NULL,                                      'Primary contact email shown in footer.'),
    ('company_phone',         '+62500000000', NULL,                                    NULL,                                      'Phone number shown in footer.'),

    -- Social media
    ('instagram_url',         'https://instagram.com/luxpathtravel', NULL,              NULL,                                      'Instagram profile URL.'),
    ('twitter_url',           'https://twitter.com/luxpathtravel',   NULL,              NULL,                                      'Twitter/X profile URL.'),
    ('tiktok_url',            'https://tiktok.com/@luxpathtravel',   NULL,              NULL,                                      'TikTok profile URL.'),

    -- Homepage hero
    ('hero_title',            NULL, 'اكتشف سحر إندونيسيا',                             'Discover the Magic of Indonesia',         'H1 text on homepage hero section.'),
    ('hero_subtitle',         NULL, 'رحلات فاخرة مصممة لك من المملكة العربية السعودية','Luxury travel crafted for Saudi travelers','Subtitle below the H1 on homepage hero.'),
    ('hero_badge',            NULL, 'وجهة أكثر من 2,000 عائلة وعرسان سعوديين',                'Trusted by 2,000+ Saudi families & couples',        'Trust badge text above the hero H1.'),

    -- Homepage CTA
    ('hero_cta_whatsapp_ar',  NULL, 'احجز عبر واتساب الآن',                            NULL,                                      'Arabic WhatsApp CTA button text on hero.'),
    ('hero_cta_packages_ar',  NULL, 'تصفح باقاتنا',                                    NULL,                                      'Arabic secondary CTA button text on hero.'),
    ('hero_cta_whatsapp_en',  NULL, NULL,                                               'Book Now via WhatsApp',                   'English WhatsApp CTA button text on hero.'),
    ('hero_cta_packages_en',  NULL, NULL,                                               'Browse Our Packages',                     'English secondary CTA button text on hero.'),

    -- Stats bar
    ('stat_trips_count',      '500+',  NULL, NULL,  'Number displayed in homepage stats bar — trips completed.'),
    ('stat_families_count',   '2,000+',NULL, NULL,  'Number displayed in homepage stats bar — families served.'),
    ('stat_destinations',     '4',     NULL, NULL,  'Number displayed in homepage stats bar — destinations.'),
    ('stat_years',            '5+',    NULL, NULL,  'Number displayed in homepage stats bar — years of experience.'),

    -- Contact CTA section
    ('contact_cta_title',     NULL, 'جاهز لتخطيط رحلتك الفاخرة؟',                    'Ready to Plan Your Luxury Trip?',         'H2 on the full-width contact CTA section.'),
    ('contact_cta_subtitle',  NULL, 'تواصل معنا الآن وسنصمم لك رحلة الأحلام في اقل من ساعة', 'Contact us and we will design your dream trip in less than an hour.', 'Subtitle on the contact CTA section.'),

    -- Footer
    ('footer_tagline',        NULL, 'وكالتك المتخصصة لرحلات إندونيسيا من المملكة العربية السعودية', 'Your specialist agency for Indonesia travel from Saudi Arabia', 'Tagline shown below logo in footer.')

ON CONFLICT (key) DO NOTHING;
