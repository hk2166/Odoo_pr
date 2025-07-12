import { supabase } from './supabase';

export interface SwapRequestData {
  fromUserId: string;
  toUserId: string;
  skillOfferedId: string;
  skillWantedId: string;
  message: string;
  exchangeGroup?: string; // Optional: to group multiple skill exchanges
}

export interface SwapRequestWithDetails {
  id: string;
  from_user_id: string;
  to_user_id: string;
  skill_offered_id: string;
  skill_wanted_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  from_profile: {
    name: string;
    profile_photo: string | null;
    location: string | null;
  };
  to_profile: {
    name: string;
    profile_photo: string | null;
    location: string | null;
  };
  skill_offered: {
    name: string;
  };
  skill_wanted: {
    name: string;
  };
}

// Create a new swap request
export async function createSwapRequest(data: SwapRequestData): Promise<{ error: string | null }> {
  try {
    // Skip if Supabase is not properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://mock.supabase.co') {
      console.warn('Supabase not configured, cannot create swap request');
      return { error: 'Database not configured' };
    }

    const { error } = await supabase
      .from('swap_requests')
      .insert({
        from_user_id: data.fromUserId,
        to_user_id: data.toUserId,
        skill_offered_id: data.skillOfferedId,
        skill_wanted_id: data.skillWantedId,
        message: data.message,
        status: 'pending'
      });

    if (error) {
      console.error('Error creating swap request:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in createSwapRequest:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Accept a swap request
export async function acceptSwapRequest(requestId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('swap_requests')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error accepting swap request:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in acceptSwapRequest:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Reject a swap request
export async function rejectSwapRequest(requestId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('swap_requests')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error rejecting swap request:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in rejectSwapRequest:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Cancel/Delete a swap request
export async function deleteSwapRequest(requestId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('swap_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Error deleting swap request:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteSwapRequest:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Complete a swap request
export async function completeSwapRequest(requestId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('swap_requests')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      console.error('Error completing swap request:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in completeSwapRequest:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get skill ID by name
export async function getSkillIdByName(skillName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skillName)
      .single();

    if (error) {
      console.error('Error finding skill:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getSkillIdByName:', error);
    return null;
  }
}

// Get user's swap requests with full details
export async function getUserSwapRequests(userId: string): Promise<SwapRequestWithDetails[]> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://mock.supabase.co') {
      console.warn('Supabase not configured, returning mock data');
      return [];
    }

    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        from_profile:profiles!swap_requests_from_user_id_fkey(name, profile_photo, location),
        to_profile:profiles!swap_requests_to_user_id_fkey(name, profile_photo, location),
        skill_offered:skills!swap_requests_skill_offered_id_fkey(name),
        skill_wanted:skills!swap_requests_skill_wanted_id_fkey(name)
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching swap requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserSwapRequests:', error);
    return [];
  }
}

// Create a rating for a completed swap
export async function createRating(data: {
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  feedback?: string;
}): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('ratings')
      .insert({
        swap_request_id: data.swapRequestId,
        from_user_id: data.fromUserId,
        to_user_id: data.toUserId,
        rating: data.rating,
        feedback: data.feedback || null
      });

    if (error) {
      console.error('Error creating rating:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in createRating:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get ratings for a user
export async function getUserRatings(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        from_profile:profiles!ratings_from_user_id_fkey(name, profile_photo),
        swap_request:swap_requests(*)
      `)
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user ratings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserRatings:', error);
    return [];
  }
}