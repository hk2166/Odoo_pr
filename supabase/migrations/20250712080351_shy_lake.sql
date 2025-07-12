/*
  # Create single user_skills table

  1. New Table
    - `user_skills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `skill_id` (uuid, references skills table)
      - `skill_offered` (boolean, true if offering, false if wanting)
      - `skill_wanted` (boolean, true if wanting, false if offering)
      - `user_name` (text, name of the logged in user)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_skills` table
    - Add policies for users to manage their own skills
    - Add policy for viewing public user skills
*/

-- Create the user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES skills(id) ON DELETE CASCADE,
  skill_offered boolean DEFAULT false,
  skill_wanted boolean DEFAULT false,
  user_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own skills"
  ON user_skills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public skills"
  ON user_skills
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE is_public = true
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Service role can manage all skills"
  ON user_skills
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_skills_user_id_idx ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS user_skills_skill_id_idx ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS user_skills_offered_idx ON user_skills(skill_offered) WHERE skill_offered = true;
CREATE INDEX IF NOT EXISTS user_skills_wanted_idx ON user_skills(skill_wanted) WHERE skill_wanted = true;

-- Create unique constraint to prevent duplicate skill entries for same user
CREATE UNIQUE INDEX IF NOT EXISTS user_skills_unique_skill_per_user 
  ON user_skills(user_id, skill_id, skill_offered, skill_wanted);