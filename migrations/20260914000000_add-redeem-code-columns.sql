-- Migration: Add is_premium to profiles, update license_keys columns
-- Run this if you already have the tables created

-- Add is_premium column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Drop old columns from license_keys if they exist
ALTER TABLE public.license_keys DROP COLUMN IF EXISTS used_by_user_id;

-- Add new columns to license_keys
ALTER TABLE public.license_keys ADD COLUMN IF NOT EXISTS redeemed_by_email TEXT;
ALTER TABLE public.license_keys ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMPTZ;

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_license_keys_code ON public.license_keys(code);
CREATE INDEX IF NOT EXISTS idx_license_keys_is_used ON public.license_keys(is_used);