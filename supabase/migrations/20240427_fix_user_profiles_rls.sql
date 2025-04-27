-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
-- Create a new policy that allows users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR
INSERT TO authenticated WITH CHECK (auth.uid() = id);
-- Create a policy that allows users to view all profiles (needed for role checks)
CREATE POLICY "Users can view all profiles" ON user_profiles FOR
SELECT TO authenticated USING (true);
-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles FOR
UPDATE TO authenticated USING (auth.uid() = id);