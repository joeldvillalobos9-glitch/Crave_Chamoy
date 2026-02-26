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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_activity: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          customer_id: string
          details: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          customer_id: string
          details?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          customer_id?: string
          details?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      inventory_adjustments: {
        Row: {
          adjusted_by: string
          created_at: string
          id: string
          new_quantity: number
          previous_quantity: number
          product_id: string
          reason: string | null
        }
        Insert: {
          adjusted_by: string
          created_at?: string
          id?: string
          new_quantity: number
          previous_quantity: number
          product_id: string
          reason?: string | null
        }
        Update: {
          adjusted_by?: string
          created_at?: string
          id?: string
          new_quantity?: number
          previous_quantity?: number
          product_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_ledger: {
        Row: {
          actor_id: string | null
          balance_after: number
          created_at: string
          customer_id: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
        }
        Insert: {
          actor_id?: string | null
          balance_after?: number
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type: string
        }
        Update: {
          actor_id?: string | null
          balance_after?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
        }
        Relationships: []
      }
      order_activity: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: string | null
          id: string
          metadata: Json | null
          order_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_activity_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          sku?: string | null
          subtotal?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          coupon_code: string | null
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          discount_amount: number | null
          discount_breakdown: Json | null
          discounts_stacked: boolean | null
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          internal_notes: string | null
          item_count: number | null
          loyalty_discount: number | null
          loyalty_points_earned: number | null
          loyalty_points_redeemed: number | null
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          referral_discount: number | null
          referral_reward_used: boolean | null
          referral_triggered: boolean | null
          refund_amount: number | null
          shipping_address: Json | null
          shipping_cost: number | null
          signup_discount_used: boolean | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax_amount: number | null
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          coupon_code?: string | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_breakdown?: Json | null
          discounts_stacked?: boolean | null
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          internal_notes?: string | null
          item_count?: number | null
          loyalty_discount?: number | null
          loyalty_points_earned?: number | null
          loyalty_points_redeemed?: number | null
          order_number: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          referral_discount?: number | null
          referral_reward_used?: boolean | null
          referral_triggered?: boolean | null
          refund_amount?: number | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          signup_discount_used?: boolean | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          coupon_code?: string | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_breakdown?: Json | null
          discounts_stacked?: boolean | null
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          internal_notes?: string | null
          item_count?: number | null
          loyalty_discount?: number | null
          loyalty_points_earned?: number | null
          loyalty_points_redeemed?: number | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          referral_discount?: number | null
          referral_reward_used?: boolean | null
          referral_triggered?: boolean | null
          refund_amount?: number | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          signup_discount_used?: boolean | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax_amount?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          candy_type: string | null
          canonical_url: string | null
          category_id: string | null
          collection_featured: boolean | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          description: string | null
          flavor_type: string | null
          frequently_bought_with_ids: string[] | null
          fruit_type: string | null
          homepage_eligible: boolean | null
          id: string
          is_best_seller: boolean | null
          is_featured: boolean | null
          is_limited_edition: boolean | null
          is_new_arrival: boolean | null
          is_visible: boolean | null
          low_stock_threshold: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          out_of_stock_behavior: string | null
          package_size: string | null
          price: number
          primary_image_url: string | null
          related_product_ids: string[] | null
          short_description: string | null
          sku: string | null
          slug: string
          spice_level: string | null
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          allow_backorder?: boolean | null
          candy_type?: string | null
          canonical_url?: string | null
          category_id?: string | null
          collection_featured?: boolean | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          flavor_type?: string | null
          frequently_bought_with_ids?: string[] | null
          fruit_type?: string | null
          homepage_eligible?: boolean | null
          id?: string
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_new_arrival?: boolean | null
          is_visible?: boolean | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          out_of_stock_behavior?: string | null
          package_size?: string | null
          price?: number
          primary_image_url?: string | null
          related_product_ids?: string[] | null
          short_description?: string | null
          sku?: string | null
          slug: string
          spice_level?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          allow_backorder?: boolean | null
          candy_type?: string | null
          canonical_url?: string | null
          category_id?: string | null
          collection_featured?: boolean | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          flavor_type?: string | null
          frequently_bought_with_ids?: string[] | null
          fruit_type?: string | null
          homepage_eligible?: boolean | null
          id?: string
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_new_arrival?: boolean | null
          is_visible?: boolean | null
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          out_of_stock_behavior?: string | null
          package_size?: string | null
          price?: number
          primary_image_url?: string | null
          related_product_ids?: string[] | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          spice_level?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          created_at: string
          display_name: string | null
          id: string
          internal_notes: string | null
          is_vip: boolean | null
          phone: string | null
          shipping_address: Json | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string
          display_name?: string | null
          id?: string
          internal_notes?: string | null
          is_vip?: boolean | null
          phone?: string | null
          shipping_address?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string
          display_name?: string | null
          id?: string
          internal_notes?: string | null
          is_vip?: boolean | null
          phone?: string | null
          shipping_address?: Json | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          qualifying_order_id: string | null
          referral_code: string
          referred_email: string | null
          referred_id: string | null
          referred_rewarded: boolean | null
          referrer_id: string
          referrer_rewarded: boolean | null
          reward_amount: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          qualifying_order_id?: string | null
          referral_code: string
          referred_email?: string | null
          referred_id?: string | null
          referred_rewarded?: boolean | null
          referrer_id: string
          referrer_rewarded?: boolean | null
          reward_amount?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          qualifying_order_id?: string | null
          referral_code?: string
          referred_email?: string | null
          referred_id?: string | null
          referred_rewarded?: boolean | null
          referrer_id?: string
          referrer_rewarded?: boolean | null
          reward_amount?: number | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "user" | "admin" | "super_admin"
      fulfillment_status:
        | "unfulfilled"
        | "packed"
        | "shipped"
        | "delivered"
        | "returned"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "completed"
        | "canceled"
        | "refunded"
        | "partially_refunded"
      payment_status:
        | "unpaid"
        | "paid"
        | "refunded"
        | "partially_refunded"
        | "failed"
      product_status: "draft" | "active" | "archived"
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
      app_role: ["user", "admin", "super_admin"],
      fulfillment_status: [
        "unfulfilled",
        "packed",
        "shipped",
        "delivered",
        "returned",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "completed",
        "canceled",
        "refunded",
        "partially_refunded",
      ],
      payment_status: [
        "unpaid",
        "paid",
        "refunded",
        "partially_refunded",
        "failed",
      ],
      product_status: ["draft", "active", "archived"],
    },
  },
} as const
