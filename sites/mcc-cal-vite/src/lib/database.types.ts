export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          status: 'new' | 'in_progress' | 'resolved' | 'spam';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          status?: 'new' | 'in_progress' | 'resolved' | 'spam';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          status?: 'new' | 'in_progress' | 'resolved' | 'spam';
          created_at?: string;
          updated_at?: string;
        };
      };
      quote_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          event_type: string;
          event_date: string | null;
          location: string | null;
          budget_range: string | null;
          details: string | null;
          status: 'pending' | 'quoted' | 'booked' | 'declined';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          event_type: string;
          event_date?: string | null;
          location?: string | null;
          budget_range?: string | null;
          details?: string | null;
          status?: 'pending' | 'quoted' | 'booked' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          event_type?: string;
          event_date?: string | null;
          location?: string | null;
          budget_range?: string | null;
          details?: string | null;
          status?: 'pending' | 'quoted' | 'booked' | 'declined';
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          service_type: string;
          booking_date: string;
          booking_time: string | null;
          duration_minutes: number;
          location: string | null;
          notes: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          deposit_paid: boolean;
          total_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          service_type: string;
          booking_date: string;
          booking_time?: string | null;
          duration_minutes?: number;
          location?: string | null;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          deposit_paid?: boolean;
          total_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          service_type?: string;
          booking_date?: string;
          booking_time?: string | null;
          duration_minutes?: number;
          location?: string | null;
          notes?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          deposit_paid?: boolean;
          total_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          slot_date: string;
          slot_time: string;
          is_available: boolean;
          service_type: string | null;
          booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_date: string;
          slot_time: string;
          is_available?: boolean;
          service_type?: string | null;
          booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slot_date?: string;
          slot_time?: string;
          is_available?: boolean;
          service_type?: string | null;
          booking_id?: string | null;
          created_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          featured_image: string | null;
          author: string;
          published: boolean;
          published_at: string | null;
          tags: string[] | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content: string;
          featured_image?: string | null;
          author?: string;
          published?: boolean;
          published_at?: string | null;
          tags?: string[] | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          featured_image?: string | null;
          author?: string;
          published?: boolean;
          published_at?: string | null;
          tags?: string[] | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_images: {
        Row: {
          id: string;
          portfolio_type: 'journalism' | 'concert' | 'portrait' | 'events' | 'nature';
          collection_name: string;
          storage_path: string;
          filename: string;
          alt_text: string | null;
          caption: string | null;
          width: number | null;
          height: number | null;
          focal_point_x: number | null;
          focal_point_y: number | null;
          tags: string[];
          is_featured: boolean;
          sort_order: number;
          migrated_from: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          portfolio_type: 'journalism' | 'concert' | 'portrait' | 'events' | 'nature';
          collection_name: string;
          storage_path: string;
          filename: string;
          alt_text?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          focal_point_x?: number | null;
          focal_point_y?: number | null;
          tags?: string[];
          is_featured?: boolean;
          sort_order?: number;
          migrated_from?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          portfolio_type?: 'journalism' | 'concert' | 'portrait' | 'events' | 'nature';
          collection_name?: string;
          storage_path?: string;
          filename?: string;
          alt_text?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          focal_point_x?: number | null;
          focal_point_y?: number | null;
          tags?: string[];
          is_featured?: boolean;
          sort_order?: number;
          migrated_from?: string | null;
          created_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_title: string | null;
          source: 'google' | 'linkedin' | 'direct';
          rating: number | null;
          content: string;
          is_featured: boolean;
          is_approved: boolean;
          external_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_title?: string | null;
          source: 'google' | 'linkedin' | 'direct';
          rating?: number | null;
          content: string;
          is_featured?: boolean;
          is_approved?: boolean;
          external_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          author_title?: string | null;
          source?: 'google' | 'linkedin' | 'direct';
          rating?: number | null;
          content?: string;
          is_featured?: boolean;
          is_approved?: boolean;
          external_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
