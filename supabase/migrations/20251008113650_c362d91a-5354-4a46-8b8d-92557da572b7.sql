-- Allow everyone to view user badges (so other users can see badges on profiles)
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;

CREATE POLICY "Everyone can view all badges"
ON user_badges
FOR SELECT
USING (true);