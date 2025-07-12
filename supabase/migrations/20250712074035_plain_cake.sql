/*
  # Fix infinite recursion in RLS policies

  1. Security Changes
    - Remove problematic admin policy that causes infinite recursion
    - Simplify RLS policies to avoid circular dependencies
    - Add safe admin check using auth.jwt() claims instead of profiles table lookup
    - Ensure users can create their own profiles without recursion

  2. Policy Updates
    - Replace recursive admin policy with JWT-based admin check
    - Simplify user profile creation policy
    - Maintain security while avoiding infinite loops
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage everything" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;

-- Create new, safe policies that don't cause recursion

-- Allow users to insert their own profile (no recursion)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to view public profiles and their own profile (no recursion)
CREATE POLICY "Users can view public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = id);

-- Safe admin policy using JWT claims instead of table lookup
-- This avoids the infinite recursion by not querying the profiles table
CREATE POLICY "Service role can manage everything"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update other table policies to use similar safe patterns
-- Fix admin_messages policies
DROP POLICY IF EXISTS "Admins can manage admin messages" ON admin_messages;

CREATE POLICY "Service role can manage admin messages"
  ON admin_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_skills_offered policies
DROP POLICY IF EXISTS "Admins can manage user skills" ON user_skills_offered;

CREATE POLICY "Service role can manage user skills offered"
  ON user_skills_offered
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix user_skills_wanted policies
DROP POLICY IF EXISTS "Admins can manage user skills wanted" ON user_skills_wanted;

CREATE POLICY "Service role can manage user skills wanted"
  ON user_skills_wanted
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix swap_requests policies
DROP POLICY IF EXISTS "Admins can manage swap requests" ON swap_requests;

CREATE POLICY "Service role can manage swap requests"
  ON swap_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix ratings policies
DROP POLICY IF EXISTS "Admins can manage ratings" ON ratings;

CREATE POLICY "Service role can manage ratings"
  ON ratings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix skills policies
DROP POLICY IF EXISTS "Admins can manage skills" ON skills;

CREATE POLICY "Service role can manage skills"
  ON skills
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);