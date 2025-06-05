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
      animal_attachments: {
        Row: {
          animal_id: string
          attachment_type: string | null
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          animal_id: string
          attachment_type?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          animal_id?: string
          attachment_type?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      animals: {
        Row: {
          birth_date: string | null
          breed: string | null
          color: string | null
          created_at: string | null
          father_id: string | null
          gender: string | null
          health_status: string | null
          id: string
          image_url: string | null
          mother_id: string | null
          name: string
          notes: string | null
          species: string
          tag: string
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string | null
          father_id?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          mother_id?: string | null
          name: string
          notes?: string | null
          species: string
          tag: string
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string | null
          father_id?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          mother_id?: string | null
          name?: string
          notes?: string | null
          species?: string
          tag?: string
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      breeding_records: {
        Row: {
          actual_birth_date: string | null
          breeding_date: string
          breeding_method: string
          breeding_notes: string | null
          cost: number | null
          created_at: string
          expected_due_date: string | null
          father_id: string
          gestation_length: number | null
          id: string
          mother_id: string
          offspring_count: number | null
          pregnancy_confirmation_date: string | null
          pregnancy_confirmed: boolean | null
          pregnancy_method: string | null
          status: string
          updated_at: string
          user_id: string
          veterinarian: string | null
        }
        Insert: {
          actual_birth_date?: string | null
          breeding_date: string
          breeding_method: string
          breeding_notes?: string | null
          cost?: number | null
          created_at?: string
          expected_due_date?: string | null
          father_id: string
          gestation_length?: number | null
          id?: string
          mother_id: string
          offspring_count?: number | null
          pregnancy_confirmation_date?: string | null
          pregnancy_confirmed?: boolean | null
          pregnancy_method?: string | null
          status?: string
          updated_at?: string
          user_id: string
          veterinarian?: string | null
        }
        Update: {
          actual_birth_date?: string | null
          breeding_date?: string
          breeding_method?: string
          breeding_notes?: string | null
          cost?: number | null
          created_at?: string
          expected_due_date?: string | null
          father_id?: string
          gestation_length?: number | null
          id?: string
          mother_id?: string
          offspring_count?: number | null
          pregnancy_confirmation_date?: string | null
          pregnancy_confirmed?: boolean | null
          pregnancy_method?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "breeding_records_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breeding_records_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          animal_id: string | null
          cost: number | null
          created_at: string
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          recurrence_pattern: string | null
          recurring: boolean | null
          reminder_minutes: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
          veterinarian: string | null
        }
        Insert: {
          all_day?: boolean | null
          animal_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type: string
          id?: string
          location?: string | null
          notes?: string | null
          recurrence_pattern?: string | null
          recurring?: boolean | null
          reminder_minutes?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          veterinarian?: string | null
        }
        Update: {
          all_day?: boolean | null
          animal_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          recurrence_pattern?: string | null
          recurring?: boolean | null
          reminder_minutes?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          veterinarian?: string | null
        }
        Relationships: []
      }
      health_records: {
        Row: {
          animal_id: string
          cost: number | null
          created_at: string
          date_administered: string
          description: string | null
          dosage: string | null
          id: string
          medication: string | null
          next_due_date: string | null
          notes: string | null
          record_type: string
          title: string
          updated_at: string
          user_id: string
          veterinarian: string | null
        }
        Insert: {
          animal_id: string
          cost?: number | null
          created_at?: string
          date_administered: string
          description?: string | null
          dosage?: string | null
          id?: string
          medication?: string | null
          next_due_date?: string | null
          notes?: string | null
          record_type: string
          title: string
          updated_at?: string
          user_id: string
          veterinarian?: string | null
        }
        Update: {
          animal_id?: string
          cost?: number | null
          created_at?: string
          date_administered?: string
          description?: string | null
          dosage?: string | null
          id?: string
          medication?: string | null
          next_due_date?: string | null
          notes?: string | null
          record_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      offspring: {
        Row: {
          animal_id: string | null
          birth_status: string | null
          birth_weight: number | null
          breeding_record_id: string
          created_at: string
          gender: string | null
          id: string
          notes: string | null
        }
        Insert: {
          animal_id?: string | null
          birth_status?: string | null
          birth_weight?: number | null
          breeding_record_id: string
          created_at?: string
          gender?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          animal_id?: string | null
          birth_status?: string | null
          birth_weight?: number | null
          breeding_record_id?: string
          created_at?: string
          gender?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offspring_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offspring_breeding_record_id_fkey"
            columns: ["breeding_record_id"]
            isOneToOne: false
            referencedRelation: "breeding_records"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          date_range: Json | null
          filters: Json | null
          id: string
          name: string
          report_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_range?: Json | null
          filters?: Json | null
          id?: string
          name: string
          report_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_range?: Json | null
          filters?: Json | null
          id?: string
          name?: string
          report_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
