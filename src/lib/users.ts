import { supabase } from './supabase';
import { User } from '../types';

export interface UserProfile {
  id: string;
  name: string;
  location: string | null;
  profile_photo: string | null;
  availability: string[];
  is_public: boolean;
  is_admin: boolean;
  is_banned: boolean;
  rating: number;
  total_swaps: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithSkills extends UserProfile {
  skillsOffered: string[];
  skillsWanted: string[];
  email?: string;
  joinedDate: string;
  isPublic: boolean;
  profilePhoto?: string;
  totalSwaps: number;
  isAdmin?: boolean;
  isBanned?: boolean;
}

// Get all public users with their skills
export async function getAllUsersWithSkills(): Promise<UserWithSkills[]> {
  try {
    // Skip if Supabase is not properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://mock.supabase.co') {
      console.warn('Supabase not configured, returning mock data for development');
      // Return some mock data for development
      return [
        {
          id: 'mock-1',
          name: 'Demo User',
          location: 'Demo City',
          profile_photo: null,
          availability: ['Weekends'],
          is_public: true,
          is_admin: false,
          is_banned: false,
          rating: 4.5,
          total_swaps: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skillsOffered: ['JavaScript', 'React'],
          skillsWanted: ['Python', 'Design'],
          joinedDate: new Date().toISOString(),
          isPublic: true,
          totalSwaps: 5
        }
      ];
    }

    // Get all public profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .eq('is_banned', false)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profiles found in database');
      return [];
    }

    // Get all user skills
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        user_id,
        skill_offered,
        skill_wanted,
        skills(name)
      `)
      .in('user_id', profiles.map(p => p.id));

    if (skillsError) {
      console.error('Error fetching user skills:', skillsError);
      // Continue without skills if skills table fails
      console.warn('Continuing without skills data');
    }

    // Combine profiles with their skills
    const usersWithSkills: UserWithSkills[] = profiles.map(profile => {
      const userSkillRecords = userSkills?.filter(skill => skill.user_id === profile.id) || [];
      
      const skillsOffered = userSkillRecords
        .filter(record => record.skill_offered)
        .map(record => record.skills?.name)
        .filter(Boolean) as string[];

      const skillsWanted = userSkillRecords
        .filter(record => record.skill_wanted)
        .map(record => record.skills?.name)
        .filter(Boolean) as string[];

      return {
        ...profile,
        skillsOffered,
        skillsWanted,
        joinedDate: profile.created_at,
        isPublic: profile.is_public,
        profilePhoto: profile.profile_photo || undefined,
        totalSwaps: profile.total_swaps,
        isAdmin: profile.is_admin,
        isBanned: profile.is_banned
      };
    });

    console.log(`Loaded ${usersWithSkills.length} users with skills`);
    return usersWithSkills;
  } catch (error) {
    console.error('Error in getAllUsersWithSkills:', error);
    throw error;
  }
}

// Search users by name, location, or skills
export async function searchUsers(query: string): Promise<UserWithSkills[]> {
  try {
    if (!query.trim()) {
      return getAllUsersWithSkills();
    }

    const allUsers = await getAllUsersWithSkills();
    const searchLower = query.toLowerCase();

    return allUsers.filter(user => {
      const matchesName = user.name.toLowerCase().includes(searchLower);
      const matchesLocation = user.location?.toLowerCase().includes(searchLower);
      const matchesSkills = [...user.skillsOffered, ...user.skillsWanted]
        .some(skill => skill.toLowerCase().includes(searchLower));
      
      return matchesName || matchesLocation || matchesSkills;
    });
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return [];
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<UserWithSkills | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    // Get user skills
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skill_offered,
        skill_wanted,
        skills(name)
      `)
      .eq('user_id', userId);

    if (skillsError) {
      console.error('Error fetching user skills:', skillsError);
      return null;
    }

    const skillsOffered = userSkills
      ?.filter(record => record.skill_offered)
      .map(record => record.skills?.name)
      .filter(Boolean) as string[] || [];

    const skillsWanted = userSkills
      ?.filter(record => record.skill_wanted)
      .map(record => record.skills?.name)
      .filter(Boolean) as string[] || [];

    return {
      ...profile,
      skillsOffered,
      skillsWanted,
      joinedDate: profile.created_at,
      isPublic: profile.is_public,
      profilePhoto: profile.profile_photo || undefined,
      totalSwaps: profile.total_swaps,
      isAdmin: profile.is_admin,
      isBanned: profile.is_banned
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}