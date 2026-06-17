-- Add status column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
