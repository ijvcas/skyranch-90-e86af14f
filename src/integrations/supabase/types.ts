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
      animal_lot_assignments: {
        Row: {
          animal_id: string
          assigned_date: string
          assignment_reason: string | null
          created_at: string
          id: string
          lot_id: string
          notes: string | null
          removed_date: string | null
          user_id: string
        }
        Insert: {
          animal_id: string
          assigned_date?: string
          assignment_reason?: string | null
          created_at?: string
          id?: string
          lot_id: string
          notes?: string | null
          removed_date?: string | null
          user_id: string
        }
        Update: {
          animal_id?: string
          assigned_date?: string
          assignment_reason?: string | null
          created_at?: string
          id?: string
          lot_id?: string
          notes?: string | null
          removed_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_lot_assignments_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_lot_assignments_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          birth_date: string | null
          breed: string | null
          color: string | null
          created_at: string | null
          current_lot_id: string | null
          father_id: string | null
          gender: string | null
          health_status: string | null
          id: string
          image_url: string | null
          maternal_grandfather_id: string | null
          maternal_grandmother_id: string | null
          maternal_great_grandfather_maternal_id: string | null
          maternal_great_grandfather_paternal_id: string | null
          maternal_great_grandmother_maternal_id: string | null
          maternal_great_grandmother_paternal_id: string | null
          mother_id: string | null
          name: string
          notes: string | null
          paternal_grandfather_id: string | null
          paternal_grandmother_id: string | null
          paternal_great_grandfather_maternal_id: string | null
          paternal_great_grandfather_paternal_id: string | null
          paternal_great_grandmother_maternal_id: string | null
          paternal_great_grandmother_paternal_id: string | null
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
          current_lot_id?: string | null
          father_id?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          maternal_grandfather_id?: string | null
          maternal_grandmother_id?: string | null
          maternal_great_grandfather_maternal_id?: string | null
          maternal_great_grandfather_paternal_id?: string | null
          maternal_great_grandmother_maternal_id?: string | null
          maternal_great_grandmother_paternal_id?: string | null
          mother_id?: string | null
          name: string
          notes?: string | null
          paternal_grandfather_id?: string | null
          paternal_grandmother_id?: string | null
          paternal_great_grandfather_maternal_id?: string | null
          paternal_great_grandfather_paternal_id?: string | null
          paternal_great_grandmother_maternal_id?: string | null
          paternal_great_grandmother_paternal_id?: string | null
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
          current_lot_id?: string | null
          father_id?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          image_url?: string | null
          maternal_grandfather_id?: string | null
          maternal_grandmother_id?: string | null
          maternal_great_grandfather_maternal_id?: string | null
          maternal_great_grandfather_paternal_id?: string | null
          maternal_great_grandmother_maternal_id?: string | null
          maternal_great_grandmother_paternal_id?: string | null
          mother_id?: string | null
          name?: string
          notes?: string | null
          paternal_grandfather_id?: string | null
          paternal_grandmother_id?: string | null
          paternal_great_grandfather_maternal_id?: string | null
          paternal_great_grandfather_paternal_id?: string | null
          paternal_great_grandmother_maternal_id?: string | null
          paternal_great_grandmother_paternal_id?: string | null
          species?: string
          tag?: string
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_current_lot_id_fkey"
            columns: ["current_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      app_version: {
        Row: {
          build_number: number
          created_at: string
          created_by: string | null
          id: string
          is_current: boolean
          notes: string | null
          version: string
        }
        Insert: {
          build_number?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          version: string
        }
        Update: {
          build_number?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_current?: boolean
          notes?: string | null
          version?: string
        }
        Relationships: []
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
      cadastral_parcels: {
        Row: {
          area_hectares: number | null
          boundary_coordinates: Json
          classification: string | null
          created_at: string
          display_name: string | null
          id: string
          imported_from_file: string | null
          lot_number: string | null
          notes: string | null
          owner_info: string | null
          parcel_id: string
          property_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          area_hectares?: number | null
          boundary_coordinates: Json
          classification?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          imported_from_file?: string | null
          lot_number?: string | null
          notes?: string | null
          owner_info?: string | null
          parcel_id: string
          property_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          area_hectares?: number | null
          boundary_coordinates?: Json
          classification?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          imported_from_file?: string | null
          lot_number?: string | null
          notes?: string | null
          owner_info?: string | null
          parcel_id?: string
          property_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadastral_parcels_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      dashboard_banners: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      event_notifications: {
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
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
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
      lot_polygons: {
        Row: {
          area_hectares: number | null
          coordinates: Json
          created_at: string | null
          id: string
          lot_id: string
          property_id: string | null
          updated_at: string | null
        }
        Insert: {
          area_hectares?: number | null
          coordinates: Json
          created_at?: string | null
          id?: string
          lot_id: string
          property_id?: string | null
          updated_at?: string | null
        }
        Update: {
          area_hectares?: number | null
          coordinates?: Json
          created_at?: string | null
          id?: string
          lot_id?: string
          property_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_polygons_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_polygons_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_rotations: {
        Row: {
          animals_moved: number | null
          created_at: string
          from_lot_id: string | null
          id: string
          lot_id: string
          notes: string | null
          reason: string | null
          rotation_date: string
          rotation_type: string
          user_id: string
        }
        Insert: {
          animals_moved?: number | null
          created_at?: string
          from_lot_id?: string | null
          id?: string
          lot_id: string
          notes?: string | null
          reason?: string | null
          rotation_date: string
          rotation_type?: string
          user_id: string
        }
        Update: {
          animals_moved?: number | null
          created_at?: string
          from_lot_id?: string | null
          id?: string
          lot_id?: string
          notes?: string | null
          reason?: string | null
          rotation_date?: string
          rotation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_rotations_from_lot_id_fkey"
            columns: ["from_lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_rotations_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          auto_generated: boolean
          capacity: number | null
          created_at: string
          description: string | null
          grass_condition: string | null
          grass_type: string | null
          id: string
          last_rotation_date: string | null
          location_coordinates: string | null
          lot_type: string | null
          name: string
          next_rotation_date: string | null
          size_hectares: number | null
          source_parcel_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_generated?: boolean
          capacity?: number | null
          created_at?: string
          description?: string | null
          grass_condition?: string | null
          grass_type?: string | null
          id?: string
          last_rotation_date?: string | null
          location_coordinates?: string | null
          lot_type?: string | null
          name: string
          next_rotation_date?: string | null
          size_hectares?: number | null
          source_parcel_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_generated?: boolean
          capacity?: number | null
          created_at?: string
          description?: string | null
          grass_condition?: string | null
          grass_type?: string | null
          id?: string
          last_rotation_date?: string | null
          location_coordinates?: string | null
          lot_type?: string | null
          name?: string
          next_rotation_date?: string | null
          size_hectares?: number | null
          source_parcel_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_source_parcel_id_fkey"
            columns: ["source_parcel_id"]
            isOneToOne: false
            referencedRelation: "cadastral_parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_required: boolean | null
          animal_name: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          priority: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_required?: boolean | null
          animal_name?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          priority?: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_required?: boolean | null
          animal_name?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      properties: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_main_property: boolean | null
          name: string
          updated_at: string
          zoom_level: number | null
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_main_property?: boolean | null
          name: string
          updated_at?: string
          zoom_level?: number | null
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_main_property?: boolean | null
          name?: string
          updated_at?: string
          zoom_level?: number | null
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
      support_settings: {
        Row: {
          created_at: string
          email: string
          hours: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          hours: string
          id?: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          hours?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_lots_from_propiedad_parcels: {
        Args: Record<PropertyKey, never>
        Returns: {
          lots_created: number
          success: boolean
          message: string
        }[]
      }
      get_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          raw_user_meta_data: Json
          created_at: string
        }[]
      }
      sync_auth_users_to_app_users: {
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
