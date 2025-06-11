export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expert_reviews: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          influencer_id: string
          likes: number
          link_url: string | null
          rating: number
          updated_at: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          influencer_id: string
          likes?: number
          link_url?: string | null
          rating: number
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          influencer_id?: string
          likes?: number
          link_url?: string | null
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_reviews_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
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
          created_at: string
          description: string | null
          height: string | null
          id: string
          image: string | null
          name: string
          social_links: Json | null
          updated_at: string
          weight: string | null
          years_training: string | null
        }
        Insert: {
          claimed_status?: string | null
          created_at?: string
          description?: string | null
          height?: string | null
          id?: string
          image?: string | null
          name: string
          social_links?: Json | null
          updated_at?: string
          weight?: string | null
          years_training?: string | null
        }
        Update: {
          claimed_status?: string | null
          created_at?: string
          description?: string | null
          height?: string | null
          id?: string
          image?: string | null
          name?: string
          social_links?: Json | null
          updated_at?: string
          weight?: string | null
          years_training?: string | null
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
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_photos: {
        Row: {
          id: string;
          influencer_id: string;
          image_url: string;
          description: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          influencer_id: string;
          image_url: string;
          description?: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          influencer_id?: string;
          image_url?: string;
          description?: string;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "influencer_photos_influencer_id_fkey",
            columns: ["influencer_id"],
            isOneToOne: false,
            referencedRelation: "influencers",
            referencedColumns: ["id"]
          }
        ];
      };
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
        ]
      }
    }
    Functions: {
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
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_safe: {
        Args: { user_id: string }
        Returns: boolean
      }
      refresh_vote_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
