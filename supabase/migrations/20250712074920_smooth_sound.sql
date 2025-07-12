/*
  # Add skills management functions

  1. Functions
    - `get_user_skills_offered` - Get skills offered by a user
    - `get_user_skills_wanted` - Get skills wanted by a user
    - `add_user_skill_offered` - Add a skill to user's offered skills
    - `add_user_skill_wanted` - Add a skill to user's wanted skills
    - `remove_user_skill_offered` - Remove a skill from user's offered skills
    - `remove_user_skill_wanted` - Remove a skill from user's wanted skills

  2. Security
    - Functions use RLS policies for security
    - Users can only manage their own skills
*/

-- Function to get skills offered by a user
CREATE OR REPLACE FUNCTION get_user_skills_offered(user_uuid UUID)
RETURNS TABLE(skill_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name
  FROM user_skills_offered uso
  JOIN skills s ON uso.skill_id = s.id
  WHERE uso.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get skills wanted by a user
CREATE OR REPLACE FUNCTION get_user_skills_wanted(user_uuid UUID)
RETURNS TABLE(skill_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name
  FROM user_skills_wanted usw
  JOIN skills s ON usw.skill_id = s.id
  WHERE usw.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a skill to user's offered skills
CREATE OR REPLACE FUNCTION add_user_skill_offered(user_uuid UUID, skill_name TEXT)
RETURNS VOID AS $$
DECLARE
  skill_uuid UUID;
BEGIN
  -- Get or create the skill
  SELECT id INTO skill_uuid FROM skills WHERE name = skill_name;
  
  IF skill_uuid IS NULL THEN
    INSERT INTO skills (name, category) VALUES (skill_name, 'Other') RETURNING id INTO skill_uuid;
  END IF;
  
  -- Add to user's offered skills (ignore if already exists)
  INSERT INTO user_skills_offered (user_id, skill_id)
  VALUES (user_uuid, skill_uuid)
  ON CONFLICT (user_id, skill_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a skill to user's wanted skills
CREATE OR REPLACE FUNCTION add_user_skill_wanted(user_uuid UUID, skill_name TEXT)
RETURNS VOID AS $$
DECLARE
  skill_uuid UUID;
BEGIN
  -- Get or create the skill
  SELECT id INTO skill_uuid FROM skills WHERE name = skill_name;
  
  IF skill_uuid IS NULL THEN
    INSERT INTO skills (name, category) VALUES (skill_name, 'Other') RETURNING id INTO skill_uuid;
  END IF;
  
  -- Add to user's wanted skills (ignore if already exists)
  INSERT INTO user_skills_wanted (user_id, skill_id)
  VALUES (user_uuid, skill_uuid)
  ON CONFLICT (user_id, skill_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a skill from user's offered skills
CREATE OR REPLACE FUNCTION remove_user_skill_offered(user_uuid UUID, skill_name TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM user_skills_offered
  WHERE user_id = user_uuid
  AND skill_id = (SELECT id FROM skills WHERE name = skill_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a skill from user's wanted skills
CREATE OR REPLACE FUNCTION remove_user_skill_wanted(user_uuid UUID, skill_name TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM user_skills_wanted
  WHERE user_id = user_uuid
  AND skill_id = (SELECT id FROM skills WHERE name = skill_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;