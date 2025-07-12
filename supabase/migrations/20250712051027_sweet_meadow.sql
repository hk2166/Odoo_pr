/*
  # Initial Schema Setup for SkillSwap Platform

  1. New Tables
    - `profiles` - User profile information extending Supabase auth.users
    - `skills` - Available skills in the platform
    - `user_skills_offered` - Skills that users offer
    - `user_skills_wanted` - Skills that users want to learn
    - `swap_requests` - Skill swap requests between users
    - `ratings` - User ratings and feedback
    - `admin_messages` - Platform-wide admin messages

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own data or public profiles
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  name text NOT NULL,
  location text,
  profile_photo text,
  availability text[] DEFAULT '{}',
  is_public boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0.0,
  total_swaps integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_skills_offered table
CREATE TABLE IF NOT EXISTS user_skills_offered (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Create user_skills_wanted table
CREATE TABLE IF NOT EXISTS user_skills_wanted (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Create swap_requests table
CREATE TABLE IF NOT EXISTS swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_offered_id uuid REFERENCES skills(id),
  skill_wanted_id uuid REFERENCES skills(id),
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_request_id uuid REFERENCES swap_requests(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now()
);

-- Create admin_messages table
CREATE TABLE IF NOT EXISTS admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'maintenance')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills_offered ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills_wanted ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_public = true OR id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Skills policies (read-only for regular users)
CREATE POLICY "Anyone can view skills"
  ON skills
  FOR SELECT
  TO authenticated
  USING (true);

-- User skills offered policies
CREATE POLICY "Users can view offered skills"
  ON user_skills_offered
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM profiles WHERE is_public = true)
  );

CREATE POLICY "Users can manage own offered skills"
  ON user_skills_offered
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- User skills wanted policies
CREATE POLICY "Users can view wanted skills"
  ON user_skills_wanted
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    user_id IN (SELECT id FROM profiles WHERE is_public = true)
  );

CREATE POLICY "Users can manage own wanted skills"
  ON user_skills_wanted
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Swap requests policies
CREATE POLICY "Users can view their swap requests"
  ON swap_requests
  FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create swap requests"
  ON swap_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update swap requests they're involved in"
  ON swap_requests
  FOR UPDATE
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Ratings policies
CREATE POLICY "Users can view ratings for their swaps"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create ratings for their swaps"
  ON ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- Admin messages policies
CREATE POLICY "Everyone can view active admin messages"
  ON admin_messages
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin policies (for admin users)
CREATE POLICY "Admins can manage everything"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Apply admin policies to all tables
CREATE POLICY "Admins can manage skills"
  ON skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage user skills"
  ON user_skills_offered
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage user skills wanted"
  ON user_skills_wanted
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage swap requests"
  ON swap_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage ratings"
  ON ratings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage admin messages"
  ON admin_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert default skills
INSERT INTO skills (name, category) VALUES
  -- Technology
  ('JavaScript', 'Technology'),
  ('Python', 'Technology'),
  ('React', 'Technology'),
  ('Node.js', 'Technology'),
  ('Photoshop', 'Technology'),
  ('Excel', 'Technology'),
  ('Data Analysis', 'Technology'),
  ('UI/UX Design', 'Technology'),
  ('WordPress', 'Technology'),
  ('SEO', 'Technology'),
  
  -- Languages
  ('Spanish', 'Languages'),
  ('French', 'Languages'),
  ('German', 'Languages'),
  ('Mandarin', 'Languages'),
  ('Japanese', 'Languages'),
  ('Italian', 'Languages'),
  ('Portuguese', 'Languages'),
  ('Arabic', 'Languages'),
  ('Korean', 'Languages'),
  ('Russian', 'Languages'),
  
  -- Creative
  ('Photography', 'Creative'),
  ('Video Editing', 'Creative'),
  ('Graphic Design', 'Creative'),
  ('Illustration', 'Creative'),
  ('Writing', 'Creative'),
  ('Music Production', 'Creative'),
  ('Painting', 'Creative'),
  ('3D Modeling', 'Creative'),
  ('Animation', 'Creative'),
  ('Logo Design', 'Creative'),
  
  -- Business
  ('Marketing', 'Business'),
  ('Accounting', 'Business'),
  ('Project Management', 'Business'),
  ('Sales', 'Business'),
  ('Business Strategy', 'Business'),
  ('Finance', 'Business'),
  ('HR', 'Business'),
  ('Legal Advice', 'Business'),
  ('Networking', 'Business'),
  ('Leadership', 'Business'),
  
  -- Lifestyle
  ('Cooking', 'Lifestyle'),
  ('Fitness Training', 'Lifestyle'),
  ('Yoga', 'Lifestyle'),
  ('Meditation', 'Lifestyle'),
  ('Gardening', 'Lifestyle'),
  ('Home Repair', 'Lifestyle'),
  ('Car Maintenance', 'Lifestyle'),
  ('Fashion Advice', 'Lifestyle'),
  ('Interior Design', 'Lifestyle'),
  ('Travel Planning', 'Lifestyle')
ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swap_requests_updated_at
  BEFORE UPDATE ON swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();