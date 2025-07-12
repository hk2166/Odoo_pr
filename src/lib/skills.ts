import { supabase } from './supabase';

export interface UserSkills {
  offered: string[];
  wanted: string[];
}

export interface UserSkillRecord {
  id: string;
  user_id: string;
  skill_id: string;
  skill_offered: boolean;
  skill_wanted: boolean;
  user_name: string;
  created_at: string;
  skill_name?: string; // From joined skills table
}

// Get user's skills from the new single table
export async function getUserSkills(userId: string): Promise<UserSkills> {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills(name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user skills:', error);
      return { offered: [], wanted: [] };
    }

    const offered = data
      ?.filter(record => record.skill_offered)
      .map(record => record.skills?.name)
      .filter(Boolean) || [];

    const wanted = data
      ?.filter(record => record.skill_wanted)
      .map(record => record.skills?.name)
      .filter(Boolean) || [];

    return { offered, wanted };
  } catch (error) {
    console.error('Error in getUserSkills:', error);
    return { offered: [], wanted: [] };
  }
}

// Add a skill to user's offered skills
export async function addUserSkillOffered(userId: string, skillName: string, userName: string): Promise<{ error: string | null }> {
  try {
    // First, get or create the skill
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();

    if (skillError && skillError.code !== 'PGRST116') {
      console.error('Error finding skill:', skillError);
      return { error: skillError.message };
    }

    let skillId = skillData?.id;

    // If skill doesn't exist, create it
    if (!skillId) {
      const { data: newSkill, error: createError } = await supabase
        .from('skills')
        .insert({ name: skillName, category: 'Other' })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating skill:', createError);
        return { error: createError.message };
      }

      skillId = newSkill.id;
    }

    // Insert or update user skill record
    const { error } = await supabase
      .from('user_skills')
      .upsert({
        user_id: userId,
        skill_id: skillId,
        skill_offered: true,
        skill_wanted: false,
        user_name: userName
      }, {
        onConflict: 'user_id,skill_id,skill_offered,skill_wanted'
      });

    if (error) {
      console.error('Error adding offered skill:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in addUserSkillOffered:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Add a skill to user's wanted skills
export async function addUserSkillWanted(userId: string, skillName: string, userName: string): Promise<{ error: string | null }> {
  try {
    // First, get or create the skill
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();

    if (skillError && skillError.code !== 'PGRST116') {
      console.error('Error finding skill:', skillError);
      return { error: skillError.message };
    }

    let skillId = skillData?.id;

    // If skill doesn't exist, create it
    if (!skillId) {
      const { data: newSkill, error: createError } = await supabase
        .from('skills')
        .insert({ name: skillName, category: 'Other' })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating skill:', createError);
        return { error: createError.message };
      }

      skillId = newSkill.id;
    }

    // Insert or update user skill record
    const { error } = await supabase
      .from('user_skills')
      .upsert({
        user_id: userId,
        skill_id: skillId,
        skill_offered: false,
        skill_wanted: true,
        user_name: userName
      }, {
        onConflict: 'user_id,skill_id,skill_offered,skill_wanted'
      });

    if (error) {
      console.error('Error adding wanted skill:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in addUserSkillWanted:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Remove a skill from user's offered skills
export async function removeUserSkillOffered(userId: string, skillName: string): Promise<{ error: string | null }> {
  try {
    // Get skill ID
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();

    if (skillError) {
      console.error('Error finding skill:', skillError);
      return { error: skillError.message };
    }

    // Delete the user skill record
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillData.id)
      .eq('skill_offered', true);

    if (error) {
      console.error('Error removing offered skill:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in removeUserSkillOffered:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Remove a skill from user's wanted skills
export async function removeUserSkillWanted(userId: string, skillName: string): Promise<{ error: string | null }> {
  try {
    // Get skill ID
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();

    if (skillError) {
      console.error('Error finding skill:', skillError);
      return { error: skillError.message };
    }

    // Delete the user skill record
    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillData.id)
      .eq('skill_wanted', true);

    if (error) {
      console.error('Error removing wanted skill:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in removeUserSkillWanted:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update user's profile information
export async function updateUserProfile(userId: string, updates: {
  name?: string;
  location?: string;
  availability?: string[];
  is_public?: boolean;
}): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get all user skills for browsing/searching
export async function getAllUserSkills(): Promise<UserSkillRecord[]> {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all user skills:', error);
      return [];
    }

    return data?.map(record => ({
      ...record,
      skill_name: record.skills?.name
    })) || [];
  } catch (error) {
    console.error('Error in getAllUserSkills:', error);
    return [];
  }
}