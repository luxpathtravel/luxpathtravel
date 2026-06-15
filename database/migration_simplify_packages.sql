-- =============================================================================
-- LUXPATH — MIGRATION: Simplify Packages Schema
-- Run this in Supabase SQL Editor if you already ran schema.sql previously.
-- If you haven't run schema.sql yet, just run the updated schema.sql instead.
-- =============================================================================

-- 1. Drop package_itinerary table (itinerary tab removed from admin form)
DROP TABLE IF EXISTS package_itinerary CASCADE;

-- 2. Remove group size columns from packages (not shown in admin form)
ALTER TABLE packages
    DROP COLUMN IF EXISTS min_persons,
    DROP COLUMN IF EXISTS max_persons;

-- 3. Add multi-currency price columns (SAR is already price_value; IDR and USD are new)
ALTER TABLE packages
    ADD COLUMN IF NOT EXISTS price_value_idr          numeric(14,2) CHECK (price_value_idr IS NULL OR price_value_idr >= 0),
    ADD COLUMN IF NOT EXISTS original_price_value_idr numeric(14,2),
    ADD COLUMN IF NOT EXISTS price_value_usd          numeric(10,2) CHECK (price_value_usd IS NULL OR price_value_usd >= 0),
    ADD COLUMN IF NOT EXISTS original_price_value_usd numeric(10,2);

-- 4. Remove all 'excluded' inclusions and restrict the type constraint
DELETE FROM package_inclusions WHERE type = 'excluded';
ALTER TABLE package_inclusions
    DROP CONSTRAINT IF EXISTS package_inclusions_type_check;
ALTER TABLE package_inclusions
    ADD CONSTRAINT package_inclusions_type_check CHECK (type IN ('included'));
