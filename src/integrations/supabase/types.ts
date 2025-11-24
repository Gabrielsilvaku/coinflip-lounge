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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      action_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          performed_by: string | null
          target_wallet: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_wallet?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
          target_wallet?: string | null
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_at: string | null
          banned_by: string | null
          id: string
          ip_address: string | null
          reason: string | null
          wallet_address: string
        }
        Insert: {
          banned_at?: string | null
          banned_by?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          wallet_address: string
        }
        Update: {
          banned_at?: string | null
          banned_by?: string | null
          id?: string
          ip_address?: string | null
          reason?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          room_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          room_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          room_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      coinflip_history: {
        Row: {
          bet_amount: number
          chosen_side: string
          created_at: string | null
          id: string
          player_wallet: string
          result: string
          won: boolean
        }
        Insert: {
          bet_amount: number
          chosen_side: string
          created_at?: string | null
          id?: string
          player_wallet: string
          result: string
          won: boolean
        }
        Update: {
          bet_amount?: number
          chosen_side?: string
          created_at?: string | null
          id?: string
          player_wallet?: string
          result?: string
          won?: boolean
        }
        Relationships: []
      }
      coinflip_rooms: {
        Row: {
          bet_amount: number
          created_at: string | null
          creator_side: string
          creator_wallet: string
          id: string
          joiner_wallet: string | null
          result: string | null
          status: string
          winner_wallet: string | null
        }
        Insert: {
          bet_amount: number
          created_at?: string | null
          creator_side: string
          creator_wallet: string
          id?: string
          joiner_wallet?: string | null
          result?: string | null
          status?: string
          winner_wallet?: string | null
        }
        Update: {
          bet_amount?: number
          created_at?: string | null
          creator_side?: string
          creator_wallet?: string
          id?: string
          joiner_wallet?: string | null
          result?: string | null
          status?: string
          winner_wallet?: string | null
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      muted_users: {
        Row: {
          created_at: string | null
          id: string
          muted_by: string | null
          muted_until: string | null
          reason: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          muted_by?: string | null
          muted_until?: string | null
          reason?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          muted_by?: string | null
          muted_until?: string | null
          reason?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      raffle_tickets: {
        Row: {
          id: string
          purchased_at: string | null
          raffle_id: string | null
          ticket_number: number
          wallet_address: string
        }
        Insert: {
          id?: string
          purchased_at?: string | null
          raffle_id?: string | null
          ticket_number: number
          wallet_address: string
        }
        Update: {
          id?: string
          purchased_at?: string | null
          raffle_id?: string | null
          ticket_number?: number
          wallet_address?: string
        }
        Relationships: []
      }
      raffle_winners: {
        Row: {
          id: string
          raffle_id: string | null
          selected_by: string | null
          ticket_number: number
          wallet_address: string
          won_at: string | null
        }
        Insert: {
          id?: string
          raffle_id?: string | null
          selected_by?: string | null
          ticket_number: number
          wallet_address: string
          won_at?: string | null
        }
        Update: {
          id?: string
          raffle_id?: string | null
          selected_by?: string | null
          ticket_number?: number
          wallet_address?: string
          won_at?: string | null
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          total_wagered: number | null
          transformation: string | null
          updated_at: string | null
          wallet_address: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          total_wagered?: number | null
          transformation?: string | null
          updated_at?: string | null
          wallet_address: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          total_wagered?: number | null
          transformation?: string | null
          updated_at?: string | null
          wallet_address?: string
          xp?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
