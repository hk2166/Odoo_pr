import { supabase } from './supabase';

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'ban_user' | 'unban_user' | 'delete_content' | 'send_message' | 'moderate_skill';
  targetId: string;
  reason?: string;
  details?: any;
  createdAt: string;
}

export interface ContentModeration {
  id: string;
  type: 'skill_description' | 'user_profile' | 'swap_message';
  content: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  moderatorId?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin user management
export async function banUser(userId: string, reason: string, adminId: string): Promise<{ error: string | null }> {
  try {
    // Update user profile to banned status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId);

    if (profileError) {
      return { error: profileError.message };
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'ban_user',
        target_id: userId,
        reason: reason
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function unbanUser(userId: string, adminId: string): Promise<{ error: string | null }> {
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_banned: false })
      .eq('id', userId);

    if (profileError) {
      return { error: profileError.message };
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'unban_user',
        target_id: userId
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Content moderation
export async function moderateContent(
  contentId: string, 
  status: 'approved' | 'rejected', 
  reason: string,
  moderatorId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('content_moderation')
      .update({
        status,
        moderator_id: moderatorId,
        reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Platform messaging
export async function sendPlatformMessage(
  title: string,
  content: string,
  type: 'info' | 'warning' | 'maintenance' | 'feature',
  adminId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('admin_messages')
      .insert({
        title,
        content,
        type,
        is_active: true,
        created_by: adminId
      });

    if (error) {
      return { error: error.message };
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action: 'send_message',
        target_id: 'platform',
        details: { title, type }
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Analytics and reporting
export async function getAdminAnalytics() {
  try {
    // Get user statistics
    const { data: userStats, error: userError } = await supabase
      .from('profiles')
      .select('is_banned, is_public, rating, total_swaps, created_at');

    if (userError) {
      throw userError;
    }

    // Get swap statistics
    const { data: swapStats, error: swapError } = await supabase
      .from('swap_requests')
      .select('status, created_at, updated_at');

    if (swapError) {
      throw swapError;
    }

    // Calculate analytics
    const totalUsers = userStats?.length || 0;
    const activeUsers = userStats?.filter(u => !u.is_banned).length || 0;
    const bannedUsers = userStats?.filter(u => u.is_banned).length || 0;
    const publicUsers = userStats?.filter(u => u.is_public).length || 0;

    const totalSwaps = swapStats?.length || 0;
    const pendingSwaps = swapStats?.filter(s => s.status === 'pending').length || 0;
    const completedSwaps = swapStats?.filter(s => s.status === 'completed').length || 0;
    const successRate = totalSwaps > 0 ? (completedSwaps / totalSwaps) * 100 : 0;

    const averageRating = userStats && userStats.length > 0 
      ? userStats.reduce((sum, u) => sum + (u.rating || 0), 0) / userStats.length 
      : 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        public: publicUsers,
        averageRating
      },
      swaps: {
        total: totalSwaps,
        pending: pendingSwaps,
        completed: completedSwaps,
        successRate
      }
    };
  } catch (error) {
    console.error('Error getting admin analytics:', error);
    return null;
  }
}

// Export user and swap data for reports
export async function exportUserData() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        location,
        is_public,
        is_banned,
        rating,
        total_swaps,
        created_at,
        updated_at
      `);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error exporting user data:', error);
    return null;
  }
}

export async function exportSwapData() {
  try {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        id,
        from_user_id,
        to_user_id,
        skill_offered_id,
        skill_wanted_id,
        message,
        status,
        created_at,
        updated_at,
        from_profile:profiles!swap_requests_from_user_id_fkey(name),
        to_profile:profiles!swap_requests_to_user_id_fkey(name),
        skill_offered:skills!swap_requests_skill_offered_id_fkey(name),
        skill_wanted:skills!swap_requests_skill_wanted_id_fkey(name)
      `);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error exporting swap data:', error);
    return null;
  }
}