-- Add typeAccount field to profiles table
ALTER TABLE profiles 
ADD COLUMN type_account INTEGER NOT NULL DEFAULT 1;

-- Update existing profiles to have type_account = 1
UPDATE profiles
SET type_account = 1
WHERE type_account IS NULL;

-- Add comment to explain the field
COMMENT ON COLUMN profiles.type_account IS 'Account type identifier (default: 1 for standard accounts)';
