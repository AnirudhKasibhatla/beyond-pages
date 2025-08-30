-- Add role column to group_memberships table for moderator status
ALTER TABLE group_memberships ADD COLUMN role text DEFAULT 'member' NOT NULL;

-- Update existing memberships for group creators to be moderators
UPDATE group_memberships 
SET role = 'moderator' 
WHERE user_id IN (
  SELECT creator_id FROM book_groups WHERE book_groups.id = group_memberships.group_id
);