-- =============================================================================
-- LUXPATH TRAVEL — REFERENCE QUERIES
-- =============================================================================
-- Copy-paste ready queries for the most common frontend and admin operations.
-- These use standard PostgreSQL syntax and work directly in Supabase's
-- JavaScript client via the .rpc() or raw SQL approaches.
-- =============================================================================


-- =============================================================================
-- FRONTEND QUERIES (Public, read-only)
-- =============================================================================

-- ─── 1. Homepage: 6 featured active packages with primary destination ─────────
SELECT
    p.id,
    p.slug_en,
    p.slug_ar,
    p.title_ar,
    p.title_en,
    p.short_description_ar,
    p.short_description_en,
    p.category,
    p.price_type,
    p.price_value,
    p.original_price_value,
    p.currency,
    p.duration_nights,
    p.duration_days,
    p.hero_image_url,
    d.slug         AS destination_slug,
    d.name_ar      AS destination_name_ar,
    d.name_en      AS destination_name_en
FROM   packages p
JOIN   package_destinations pd ON pd.package_id    = p.id AND pd.is_primary = true
JOIN   destinations         d  ON d.id             = pd.destination_id
WHERE  p.is_active   = true
AND    p.is_featured = true
ORDER  BY p.display_order ASC, p.created_at DESC
LIMIT  6;


-- ─── 2. Packages page: all active packages with filters ───────────────────────
-- Supports: ?cat=honeymoon, ?dest=bali, ?min_price=2000, ?max_price=5000
-- Replace the WHERE conditions with your active filters.
SELECT
    p.id,
    p.slug_en,
    p.slug_ar,
    p.title_ar,
    p.title_en,
    p.short_description_ar,
    p.short_description_en,
    p.category,
    p.price_type,
    p.price_value,
    p.original_price_value,
    p.currency,
    p.duration_nights,
    p.duration_days,
    p.hero_image_url,
    -- Aggregate all destinations for this package (e.g. "Bali + Bandung")
    json_agg(
        json_build_object(
            'slug',    d.slug,
            'name_ar', d.name_ar,
            'name_en', d.name_en,
            'primary', pd.is_primary
        )
        ORDER BY pd.is_primary DESC, pd.display_order
    ) AS destinations
FROM   packages p
JOIN   package_destinations pd ON pd.package_id = p.id
JOIN   destinations         d  ON d.id          = pd.destination_id
WHERE  p.is_active = true
-- Optional filter: AND p.category = 'honeymoon'
-- Optional filter: AND d.slug     = 'bali'
-- Optional filter: AND p.price_value BETWEEN 2000 AND 5000
GROUP  BY p.id
ORDER  BY p.display_order ASC, p.price_value ASC;


-- ─── 3. Package detail page: full data for one package ────────────────────────
-- Replace 'bali-honeymoon-7d' with the slug from the URL parameter.
WITH pkg AS (
    SELECT * FROM packages
    WHERE  slug_en = 'bali-honeymoon-7d'   -- or slug_ar for Arabic URL
    AND    is_active = true
    LIMIT  1
)
SELECT
    pkg.*,
    -- Destinations
    (
        SELECT json_agg(
            json_build_object(
                'slug',    d.slug,
                'name_ar', d.name_ar,
                'name_en', d.name_en,
                'primary', pd.is_primary
            )
            ORDER BY pd.is_primary DESC
        )
        FROM   package_destinations pd
        JOIN   destinations d ON d.id = pd.destination_id
        WHERE  pd.package_id = pkg.id
    ) AS destinations,

    -- Gallery images
    (
        SELECT json_agg(
            json_build_object(
                'url',      pi.image_url,
                'alt_ar',   pi.alt_ar,
                'alt_en',   pi.alt_en,
                'is_hero',  pi.is_hero
            )
            ORDER BY pi.is_hero DESC, pi.display_order
        )
        FROM   package_images pi
        WHERE  pi.package_id = pkg.id
    ) AS images,

    -- Inclusions (included items)
    (
        SELECT json_agg(
            json_build_object(
                'icon',    inc.icon,
                'text_ar', inc.text_ar,
                'text_en', inc.text_en
            )
            ORDER BY inc.display_order
        )
        FROM   package_inclusions inc
        WHERE  inc.package_id = pkg.id
        AND    inc.type = 'included'
    ) AS inclusions,

    -- Exclusions (excluded items)
    (
        SELECT json_agg(
            json_build_object(
                'icon',    exc.icon,
                'text_ar', exc.text_ar,
                'text_en', exc.text_en
            )
            ORDER BY exc.display_order
        )
        FROM   package_inclusions exc
        WHERE  exc.package_id = pkg.id
        AND    exc.type = 'excluded'
    ) AS exclusions,

    -- Itinerary
    (
        SELECT json_agg(
            json_build_object(
                'day',           it.day_number,
                'title_ar',      it.title_ar,
                'title_en',      it.title_en,
                'description_ar',it.description_ar,
                'description_en',it.description_en,
                'location_ar',   it.location_ar,
                'location_en',   it.location_en,
                'meals',         it.meals_included,
                'image_url',     it.image_url
            )
            ORDER BY it.day_number
        )
        FROM   package_itinerary it
        WHERE  it.package_id = pkg.id
    ) AS itinerary

FROM pkg;


-- ─── 4. Destination detail page: destination + its packages ───────────────────
SELECT
    d.*,
    (
        SELECT json_agg(
            json_build_object(
                'slug_en',              p.slug_en,
                'slug_ar',              p.slug_ar,
                'title_ar',             p.title_ar,
                'title_en',             p.title_en,
                'short_description_ar', p.short_description_ar,
                'short_description_en', p.short_description_en,
                'category',             p.category,
                'price_type',           p.price_type,
                'price_value',          p.price_value,
                'original_price_value', p.original_price_value,
                'currency',             p.currency,
                'duration_nights',      p.duration_nights,
                'duration_days',        p.duration_days,
                'hero_image_url',       p.hero_image_url
            )
            ORDER BY p.display_order, p.price_value
        )
        FROM   packages p
        JOIN   package_destinations pd ON pd.package_id = p.id AND pd.destination_id = d.id
        WHERE  p.is_active = true
    ) AS packages
FROM destinations d
WHERE d.slug      = 'bali'   -- Replace with URL parameter
AND   d.is_active = true;


-- ─── 5. Homepage: featured testimonials ───────────────────────────────────────
SELECT
    t.reviewer_name_display,
    t.reviewer_city,
    t.reviewer_flag,
    t.rating,
    t.review_ar,
    t.review_en,
    t.trip_month,
    t.trip_year,
    t.trip_category,
    d.name_ar AS destination_name_ar,
    d.name_en AS destination_name_en
FROM   testimonials t
LEFT   JOIN destinations d ON d.id = t.destination_id
WHERE  t.is_approved = true
AND    t.is_featured = true
ORDER  BY t.display_order
LIMIT  3;


-- ─── 6. Site settings (load all at once for homepage) ─────────────────────────
SELECT key, value, value_ar, value_en
FROM   site_settings
ORDER  BY key;


-- =============================================================================
-- ADMIN QUERIES
-- =============================================================================

-- ─── 7. Admin dashboard stats ─────────────────────────────────────────────────
SELECT
    (SELECT COUNT(*)::int FROM packages      WHERE is_active  = true)  AS active_packages,
    (SELECT COUNT(*)::int FROM packages      WHERE is_featured = true) AS featured_packages,
    (SELECT COUNT(*)::int FROM inquiries     WHERE status = 'new')     AS new_inquiries,
    (SELECT COUNT(*)::int FROM inquiries
     WHERE  created_at > now() - interval '7 days')                    AS inquiries_this_week,
    (SELECT COUNT(*)::int FROM testimonials  WHERE is_approved = false) AS pending_testimonials,
    (SELECT COUNT(*)::int FROM blog_posts    WHERE is_published = true) AS published_posts;


-- ─── 8. Admin: packages list with destination names ───────────────────────────
SELECT
    p.id,
    p.slug_en,
    p.title_ar,
    p.title_en,
    p.category,
    p.price_type,
    p.price_value,
    p.currency,
    p.duration_nights,
    p.is_featured,
    p.is_active,
    p.inquiry_count,
    p.display_order,
    p.created_at,
    -- Primary destination name for display in the list
    d.name_ar AS primary_destination_ar,
    d.name_en AS primary_destination_en
FROM   packages p
LEFT   JOIN package_destinations pd ON pd.package_id = p.id AND pd.is_primary = true
LEFT   JOIN destinations         d  ON d.id = pd.destination_id
ORDER  BY p.display_order ASC, p.created_at DESC;


-- ─── 9. Admin: inquiries list with package info ───────────────────────────────
SELECT
    i.id,
    i.full_name,
    i.phone,
    i.whatsapp,
    i.email,
    i.status,
    i.adults_count,
    i.children_count,
    i.preferred_date,
    i.source_language,
    i.source_page,
    i.created_at,
    p.title_ar AS package_title_ar,
    p.slug_en  AS package_slug_en,
    d.name_ar  AS destination_name_ar
FROM   inquiries i
LEFT   JOIN packages     p ON p.id = i.package_id
LEFT   JOIN destinations d ON d.id = i.destination_id
ORDER  BY
    CASE i.status WHEN 'new' THEN 0 ELSE 1 END,
    i.created_at DESC;


-- ─── 10. Admin: update inquiry status ─────────────────────────────────────────
UPDATE inquiries
SET    status      = 'contacted',   -- new | contacted | quoted | confirmed | cancelled
       admin_notes = 'تم التواصل مع العميل عبر واتساب بتاريخ 2025-06-01'
WHERE  id = '<inquiry-uuid>';


-- ─── 11. Admin: reorder packages (update display_order) ───────────────────────
-- Call this once per save of the drag-and-drop reorder UI.
-- Pass an array of {id, display_order} and run one UPDATE per row.
UPDATE packages SET display_order = 0 WHERE id = '<uuid-1>';
UPDATE packages SET display_order = 1 WHERE id = '<uuid-2>';
UPDATE packages SET display_order = 2 WHERE id = '<uuid-3>';


-- ─── 12. Admin: search packages by title (uses trigram index) ─────────────────
SELECT id, slug_en, title_ar, title_en, is_active
FROM   packages
WHERE  title_ar ILIKE '%بالي%'
OR     title_en ILIKE '%bali%'
ORDER  BY is_active DESC, display_order;


-- =============================================================================
-- UTILITY QUERIES
-- =============================================================================

-- ─── 13. Check schema integrity: packages without a primary destination ────────
SELECT p.id, p.slug_en, p.title_en
FROM   packages p
WHERE  NOT EXISTS (
    SELECT 1 FROM package_destinations pd
    WHERE  pd.package_id = p.id
    AND    pd.is_primary = true
);

-- ─── 14. Check schema integrity: packages with no hero image ──────────────────
SELECT id, slug_en, title_en
FROM   packages
WHERE  hero_image_url IS NULL
AND    is_active = true;

-- ─── 15. Check schema integrity: packages with SEO fields missing ─────────────
SELECT id, slug_en, title_en, seo_title_ar, seo_description_ar
FROM   packages
WHERE  is_active = true
AND    (seo_title_ar IS NULL OR seo_description_ar IS NULL);
