export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          name: string;
          location?: string | null;
          profile_photo?: string | null;
          availability?: string[];
          is_public?: boolean;
          is_admin?: boolean;
          is_banned?: boolean;
          rating?: number;
          total_swaps?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          profile_photo?: string | null;
          availability?: string[];
          is_public?: boolean;
          is_admin?: boolean;
          is_banned?: boolean;
          rating?: number;
          total_swaps?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          created_at?: string;
        };
      };
      user_skills_offered: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          created_at?: string;
        };
      };
      user_skills_wanted: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          created_at?: string;
        };
      };
      swap_requests: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          skill_offered_id: string;
          skill_wanted_id: string;
          message: string;
          status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_user_id: string;
          to_user_id: string;
          skill_offered_id: string;
          skill_wanted_id: string;
          message: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          from_user_id?: string;
          to_user_id?: string;
          skill_offered_id?: string;
          skill_wanted_id?: string;
          message?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          swap_request_id: string;
          from_user_id: string;
          to_user_id: string;
          rating: number;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          swap_request_id: string;
          from_user_id: string;
          to_user_id: string;
          rating: number;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          swap_request_id?: string;
          from_user_id?: string;
          to_user_id?: string;
          rating?: number;
          feedback?: string | null;
          created_at?: string;
        };
      };
      admin_messages: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'info' | 'warning' | 'maintenance';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type?: 'info' | 'warning' | 'maintenance';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'info' | 'warning' | 'maintenance';
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
  };
}