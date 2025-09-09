export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      book_events: {
        Row: {
          additional_info: string | null
          category: string
          created_at: string
          creator_id: string
          description: string | null
          event_date: string
          event_time: string
          featured: boolean
          host_bio: string | null
          host_xp: number
          id: string
          image_url: string | null
          location: string
          max_attendees: number | null
          recurring: boolean | null
          recurring_days: string[] | null
          recurring_duration: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          category: string
          created_at?: string
          creator_id: string
          description?: string | null
          event_date: string
          event_time: string
          featured?: boolean
          host_bio?: string | null
          host_xp?: number
          id?: string
          image_url?: string | null
          location: string
          max_attendees?: number | null
          recurring?: boolean | null
          recurring_days?: string[] | null
          recurring_duration?: number | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          category?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          event_date?: string
          event_time?: string
          featured?: boolean
          host_bio?: string | null
          host_xp?: number
          id?: string
          image_url?: string | null
          location?: string
          max_attendees?: number | null
          recurring?: boolean | null
          recurring_days?: string[] | null
          recurring_duration?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_groups: {
        Row: {
          activity_level: string
          additional_info: string | null
          book_cover_url: string | null
          created_at: string
          creator_id: string
          current_book: string | null
          current_members: number
          description: string | null
          genre: string | null
          id: string
          image_url: string | null
          location: string
          name: string
          privacy: string
          total_slots: number
          type: string
          updated_at: string
        }
        Insert: {
          activity_level?: string
          additional_info?: string | null
          book_cover_url?: string | null
          created_at?: string
          creator_id: string
          current_book?: string | null
          current_members?: number
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          privacy?: string
          total_slots: number
          type: string
          updated_at?: string
        }
        Update: {
          activity_level?: string
          additional_info?: string | null
          book_cover_url?: string | null
          created_at?: string
          creator_id?: string
          current_book?: string | null
          current_members?: number
          description?: string | null
          genre?: string | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          privacy?: string
          total_slots?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          created_at: string
          genres: string[] | null
          id: string
          isbn: string | null
          progress: string | null
          rating: number | null
          review_text: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author: string
          created_at?: string
          genres?: string[] | null
          id?: string
          isbn?: string | null
          progress?: string | null
          rating?: number | null
          review_text?: string | null
          status: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string
          genres?: string[] | null
          id?: string
          isbn?: string | null
          progress?: string | null
          rating?: number | null
          review_text?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_post_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          book_author: string | null
          book_id: string | null
          book_title: string | null
          content: string
          created_at: string
          id: string
          is_repost: boolean
          likes_count: number
          original_post_id: string | null
          rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_author?: string | null
          book_id?: string | null
          book_title?: string | null
          content: string
          created_at?: string
          id?: string
          is_repost?: boolean
          likes_count?: number
          original_post_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_author?: string | null
          book_id?: string | null
          book_title?: string | null
          content?: string
          created_at?: string
          id?: string
          is_repost?: boolean
          likes_count?: number
          original_post_id?: string | null
          rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_details: {
        Row: {
          additional_details: string | null
          created_at: string
          event_id: string
          host_bio: string | null
          id: string
          updated_at: string
        }
        Insert: {
          additional_details?: string | null
          created_at?: string
          event_id: string
          host_bio?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          additional_details?: string | null
          created_at?: string
          event_id?: string
          host_bio?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_details_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "book_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_messages: {
        Row: {
          content: string
          created_at: string
          event_id: string
          id: string
          message_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id: string
          id?: string
          message_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string
          id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "book_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "book_events"
            referencedColumns: ["id"]
          },
        ]
      }
      group_details: {
        Row: {
          additional_details: string | null
          book_covers: string[] | null
          created_at: string
          group_id: string
          id: string
          updated_at: string
        }
        Insert: {
          additional_details?: string | null
          book_covers?: string[] | null
          created_at?: string
          group_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          additional_details?: string | null
          book_covers?: string[] | null
          created_at?: string
          group_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_details_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "book_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "book_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          message_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          message_type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "book_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      highlight_follows: {
        Row: {
          created_at: string
          highlight_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          highlight_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          highlight_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      highlights: {
        Row: {
          book_author: string | null
          book_title: string
          created_at: string
          id: string
          page_number: string | null
          quote_text: string
          user_id: string
        }
        Insert: {
          book_author?: string | null
          book_title: string
          created_at?: string
          id?: string
          page_number?: string | null
          quote_text: string
          user_id: string
        }
        Update: {
          book_author?: string | null
          book_title?: string
          created_at?: string
          id?: string
          page_number?: string | null
          quote_text?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          phone: string | null
          profile_picture_url: string | null
          public_profile: boolean | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          public_profile?: boolean | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          public_profile?: boolean | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      reading_challenges: {
        Row: {
          best_month: string | null
          completed: number
          created_at: string
          favorite_genre: string | null
          goal: number
          id: string
          status: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          best_month?: string | null
          completed?: number
          created_at?: string
          favorite_genre?: string | null
          goal?: number
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          best_month?: string | null
          completed?: number
          created_at?: string
          favorite_genre?: string | null
          goal?: number
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_availability: {
        Args: { username_input: string }
        Returns: boolean
      }
      generate_username: {
        Args: { first_name_input?: string; last_name_input?: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
