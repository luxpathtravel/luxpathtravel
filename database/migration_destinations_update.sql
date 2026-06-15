-- =============================================================================
-- LUXPATH — MIGRATION: Destinations Update + Remove is_primary
-- Run this in Supabase SQL Editor if you already ran schema.sql previously.
-- =============================================================================

-- 1. Drop the partial unique index enforcing one primary destination per package
DROP INDEX IF EXISTS uidx_package_destinations_one_primary;

-- 2. Remove is_primary column from package_destinations
ALTER TABLE package_destinations
    DROP COLUMN IF EXISTS is_primary;

-- 3. Shift existing destination display_orders to make room for Puncak (slot 3)
UPDATE destinations SET display_order = 5 WHERE slug = 'lombok';
UPDATE destinations SET display_order = 4 WHERE slug = 'bandung';

-- 4. Insert Puncak (between Jakarta and Bandung) and Gili Islands (after Lombok)
INSERT INTO destinations (slug, name_ar, name_en, tagline_ar, tagline_en, display_order)
VALUES
    ('puncak', 'بونشاك',   'Puncak',       'جبال الطبيعة الخضراء', 'A Magical Mountain Escape', 3),
    ('gili',   'جزر جيلي', 'Gili Islands', 'جنة استوائية',          'Tropical Paradise',         6)
ON CONFLICT (slug) DO NOTHING;
