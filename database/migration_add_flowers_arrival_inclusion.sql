-- =============================================================================
-- LUXPATH TRAVEL — ALLOW FLOWERS ON ARRIVAL PACKAGE INCLUSION
-- =============================================================================
-- Run once in the Supabase SQL Editor after deploying the dashboard change.
-- =============================================================================

ALTER TABLE public.package_inclusions
    DROP CONSTRAINT IF EXISTS package_inclusions_icon_check;

ALTER TABLE public.package_inclusions
    ADD CONSTRAINT package_inclusions_icon_check
    CHECK (icon IN (
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
        'flowers_arrival',
        'photo_session',
        'water_activities',
        'spa',
        'custom'
    ));
