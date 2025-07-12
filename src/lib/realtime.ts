import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeSwapUpdate {
  id: string;
  type: 'new_request' | 'request_accepted' | 'request_rejected' | 'request_completed' | 'request_cancelled';
  data: any;
  userId: string;
}

// Subscribe to real-time swap request updates
export function subscribeToSwapUpdates(
  userId: string, 
  onUpdate: (update: RealtimeSwapUpdate) => void
): RealtimeChannel | null {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://mock.supabase.co') {
      console.warn('Supabase not configured, real-time updates disabled');
      return null;
    }

    const channel = supabase
      .channel('swap_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'swap_requests',
          filter: `or(from_user_id.eq.${userId},to_user_id.eq.${userId})`
        },
        (payload) => {
          console.log('Real-time swap update:', payload);
          
          let updateType: RealtimeSwapUpdate['type'] = 'new_request';
          
          if (payload.eventType === 'INSERT') {
            updateType = 'new_request';
          } else if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            switch (newRecord.status) {
              case 'accepted':
                updateType = 'request_accepted';
                break;
              case 'rejected':
                updateType = 'request_rejected';
                break;
              case 'completed':
                updateType = 'request_completed';
                break;
              case 'cancelled':
                updateType = 'request_cancelled';
                break;
              default:
                updateType = 'new_request';
            }
          }

          onUpdate({
            id: payload.new?.id || payload.old?.id,
            type: updateType,
            data: payload.new || payload.old,
            userId: userId
          });
        }
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Error setting up real-time subscription:', error);
    return null;
  }
}

// Subscribe to user profile updates
export function subscribeToUserUpdates(
  userId: string,
  onUpdate: (user: any) => void
): RealtimeChannel | null {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://mock.supabase.co') {
      return null;
    }

    const channel = supabase
      .channel('user_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id.eq.${userId}`
        },
        (payload) => {
          console.log('User profile updated:', payload);
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return channel;
  } catch (error) {
    console.error('Error setting up user updates subscription:', error);
    return null;
  }
}

// Send real-time notification
export async function sendNotification(
  toUserId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) {
  try {
    // In a real app, you might use Supabase Edge Functions or a notification service
    // For now, we'll just log the notification
    console.log('Sending notification:', {
      toUserId,
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString()
    });
    
    // You could implement push notifications, email notifications, etc. here
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}