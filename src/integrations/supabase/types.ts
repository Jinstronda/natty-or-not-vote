export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      expert_reviews: {
        Row: {
          author: string | null
          content: string
          created_at: string
          expert_id: string | null
          id: string
          influencer_id: string
          likes: number
          link_url: string | null
          rating: number
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          expert_id?: string | null
          id?: string
          influencer_id: string
          likes?: number
          link_url?: string | null
          rating: number
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          expert_id?: string | null
          id?: string
          influencer_id?: string
          likes?: number
          link_url?: string | null
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_reviews_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_reviews_backup: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          expert_id: string | null
          id: string | null
          influencer_id: string | null
          likes: number | null
          link_url: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          expert_id?: string | null
          id?: string | null
          influencer_id?: string | null
          likes?: number | null
          link_url?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string | null
          expert_id?: string | null
          id?: string | null
          influencer_id?: string | null
          likes?: number | null
          link_url?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      experts: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          influencer_id: string | null
          instagram: string | null
          name: string
          profile_picture_url: string | null
          twitter: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          influencer_id?: string | null
          instagram?: string | null
          name: string
          profile_picture_url?: string | null
          twitter?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          influencer_id?: string | null
          instagram?: string | null
          name?: string
          profile_picture_url?: string | null
          twitter?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sale_timer: {
        Row: {
          active: boolean
          auto_reset: boolean
          created_at: string
          duration_hours: number
          id: string
          sale_end_time: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          auto_reset?: boolean
          created_at?: string
          duration_hours?: number
          id?: string
          sale_end_time: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          auto_reset?: boolean
          created_at?: string
          duration_hours?: number
          id?: string
          sale_end_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      influencer_info_suggestions: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          influencer_id: string
          reason: string | null
          status: string
          submitted_by: string
          suggested_description: string | null
          suggested_height: string | null
          suggested_images: Json | null
          suggested_training: string | null
          suggested_weight: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          reason?: string | null
          status?: string
          submitted_by: string
          suggested_description?: string | null
          suggested_height?: string | null
          suggested_images?: Json | null
          suggested_training?: string | null
          suggested_weight?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          reason?: string | null
          status?: string
          submitted_by?: string
          suggested_description?: string | null
          suggested_height?: string | null
          suggested_images?: Json | null
          suggested_training?: string | null
          suggested_weight?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_info_suggestions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_info_suggestions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_info_suggestions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_photos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          influencer_id: string
          order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          influencer_id: string
          order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          influencer_id?: string
          order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_photos_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencer_photos_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_suggestions: {
        Row: {
          id: string
          image_url: string | null
          influencer_name: string
          social_links: Json | null
          status: string
          submitted_by: string
          timestamp: string
        }
        Insert: {
          id?: string
          image_url?: string | null
          influencer_name: string
          social_links?: Json | null
          status?: string
          submitted_by: string
          timestamp?: string
        }
        Update: {
          id?: string
          image_url?: string | null
          influencer_name?: string
          social_links?: Json | null
          status?: string
          submitted_by?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "influencer_suggestions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          claimed_status: string | null
          controversial: boolean | null
          created_at: string
          description: string | null
          height: string | null
          id: string
          image: string | null
          name: string
          social_links: Json | null
          trending: boolean
          updated_at: string
          weight: string | null
          years_training: string | null
          youtube: string | null
        }
        Insert: {
          claimed_status?: string | null
          controversial?: boolean | null
          created_at?: string
          description?: string | null
          height?: string | null
          id?: string
          image?: string | null
          name: string
          social_links?: Json | null
          trending?: boolean
          updated_at?: string
          weight?: string | null
          years_training?: string | null
          youtube?: string | null
        }
        Update: {
          claimed_status?: string | null
          controversial?: boolean | null
          created_at?: string
          description?: string | null
          height?: string | null
          id?: string
          image?: string | null
          name?: string
          social_links?: Json | null
          trending?: boolean
          updated_at?: string
          weight?: string | null
          years_training?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          profile_picture_url: string | null
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          profile_picture_url?: string | null
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          profile_picture_url?: string | null
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reply_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reply_reactions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "review_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reply_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          content: string
          created_at: string | null
          dislikes: number | null
          id: string
          likes: number | null
          parent_reply_id: string | null
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          parent_reply_id?: string | null
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          parent_reply_id?: string | null
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "review_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          dislikes: number
          id: string
          influencer_id: string
          likes: number
          timestamp: string
          user_id: string
          vote: string
        }
        Insert: {
          content: string
          dislikes?: number
          id?: string
          influencer_id: string
          likes?: number
          timestamp?: string
          user_id: string
          vote: string
        }
        Update: {
          content?: string
          dislikes?: number
          id?: string
          influencer_id?: string
          likes?: number
          timestamp?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          id: string
          influencer_id: string
          timestamp: string
          user_id: string
          vote: string
        }
        Insert: {
          id?: string
          influencer_id: string
          timestamp?: string
          user_id: string
          vote: string
        }
        Update: {
          id?: string
          influencer_id?: string
          timestamp?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      influencer_vote_counts: {
        Row: {
          influencer_id: string | null
          juicy_percentage: number | null
          juicy_votes: number | null
          natty_percentage: number | null
          natty_votes: number | null
          total_votes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers_sorted_by_votes"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers_sorted_by_votes: {
        Row: {
          claimed_status: string | null
          controversial: boolean | null
          created_at: string | null
          description: string | null
          height: string | null
          id: string | null
          image: string | null
          juicy_percentage: number | null
          juicy_votes: number | null
          name: string | null
          natty_percentage: number | null
          natty_votes: number | null
          social_links: Json | null
          total_votes: number | null
          trending: boolean | null
          updated_at: string | null
          weight: string | null
          years_training: string | null
          youtube: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_reply_rate_limit: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_upload_rate_limit: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_vote_rate_limit: {
        Args: { user_id: string }
        Returns: boolean
      }
      create_user_profile: {
        Args: { user_id: string; user_email: string; username?: string }
        Returns: string
      }
      get_nested_replies: {
        Args: { p_review_id: string; p_max_depth?: number }
        Returns: {
          id: string
          review_id: string
          parent_reply_id: string
          user_id: string
          content: string
          likes: number
          dislikes: number
          created_at: string
          updated_at: string
          username: string
          profile_picture_url: string
          depth: number
        }[]
      }
      get_reply_count: {
        Args: { review_id: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_safe: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      refresh_vote_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      truncate_review_content: {
        Args: { content_text: string }
        Returns: string
      }
      validate_review_content: {
        Args: { content_text: string }
        Returns: boolean
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
