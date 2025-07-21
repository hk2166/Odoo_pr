import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://mock.supabase.co' &&
  supabaseAnonKey !== 'mock-key' &&
  supabaseUrl.includes('supabase.co');

if (!isSupabaseConfigured) {
  console.error('Supabase configuration invalid or missing:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  console.error('Please check your .env file and ensure you have valid Supabase credentials');
}

// Create Supabase client (will work even with missing env vars in dev)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://mock.supabase.co',
  supabaseAnonKey || 'mock-key'
);

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: { name: string; location?: string }) => {
    if (!isSupabaseConfigured) {
      return { 
        data: null, 
        error: { 
          message: 'Supabase not configured properly. Please check your environment variables and ensure you have a valid Supabase project URL and anon key.' 
        } 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            location: userData.location || null,
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        return { data, error };
      }
      
      return { data, error };
    } catch (networkError) {
      console.error('Network error during signup:', networkError);
      return { 
        data: null, 
        error: { 
          message: 'Unable to connect to Supabase. Please check your internet connection and Supabase configuration.' 
        } 
      };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { 
        data: null, 
        error: { 
          message: 'Supabase not configured properly. Please check your environment variables.' 
        } 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Supabase signin error:', error);
      }
      
      return { data, error };
    } catch (networkError) {
      console.error('Network error during signin:', networkError);
      return { 
        data: null, 
        error: { 
          message: 'Unable to connect to Supabase. Please check your internet connection and Supabase configuration.' 
        } 
      };
    }
  },

  // Sign out
  signOut: async () => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (networkError) {
      console.error('Network error during signout:', networkError);
      return { error: { message: 'Unable to sign out. Network error.' } };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    if (!isSupabaseConfigured) {
      return { user: null, error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (networkError) {
      console.error('Network error getting user:', networkError);
      return { user: null, error: { message: 'Unable to get user. Network error.' } };
    }
  },

  // Get current session
  getCurrentSession: async () => {
    if (!isSupabaseConfigured) {
      return { session: null, error: { message: 'Supabase not configured.' } };
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (networkError) {
      console.error('Network error getting session:', networkError);
      return { session: null, error: { message: 'Unable to get session. Network error.' } };
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, auth state changes will not work');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
}; 