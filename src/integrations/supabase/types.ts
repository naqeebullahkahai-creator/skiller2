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
      activity_logs: {
        Row: {
          action_category: string
          action_type: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          role: string
          severity: string
          user_agent: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          action_category: string
          action_type: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          role: string
          severity?: string
          user_agent?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          action_category?: string
          action_type?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          role?: string
          severity?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_online_status: {
        Row: {
          created_at: string
          id: string
          is_online: boolean
          last_seen_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_performance: {
        Row: {
          agent_id: string
          created_at: string
          feedback_text: string | null
          id: string
          rating: number | null
          session_duration_minutes: number | null
          session_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          session_duration_minutes?: number | null
          session_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number | null
          session_duration_minutes?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "support_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_upload_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_log: Json | null
          failed_rows: number
          file_name: string
          id: string
          seller_id: string
          status: string
          successful_rows: number
          total_rows: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          failed_rows?: number
          file_name: string
          id?: string
          seller_id: string
          status?: string
          successful_rows?: number
          total_rows?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          failed_rows?: number
          file_name?: string
          id?: string
          seller_id?: string
          status?: string
          successful_rows?: number
          total_rows?: number
        }
        Relationships: []
      }
      bundle_deals: {
        Row: {
          bundle_type: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          min_quantity: number | null
          seller_id: string
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          bundle_type?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          min_quantity?: number | null
          seller_id: string
          starts_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          bundle_type?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          min_quantity?: number | null
          seller_id?: string
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundle_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_products: {
        Row: {
          campaign_id: string
          campaign_price_pkr: number | null
          created_at: string
          display_order: number | null
          id: string
          product_id: string
        }
        Insert: {
          campaign_id: string
          campaign_price_pkr?: number | null
          created_at?: string
          display_order?: number | null
          id?: string
          product_id: string
        }
        Update: {
          campaign_id?: string
          campaign_price_pkr?: number | null
          created_at?: string
          display_order?: number | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          banner_image_url: string | null
          campaign_type: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_label: string | null
          ends_at: string
          id: string
          is_active: boolean
          is_featured: boolean
          mobile_banner_url: string | null
          slug: string
          starts_at: string
          theme_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_label?: string | null
          ends_at: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          mobile_banner_url?: string | null
          slug: string
          starts_at: string
          theme_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_label?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          mobile_banner_url?: string | null
          slug?: string
          starts_at?: string
          theme_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cancellation_logs: {
        Row: {
          cancelled_by: string
          cancelled_by_role: string
          created_at: string
          id: string
          items_restocked: boolean | null
          order_id: string
          reason: string
          refund_amount: number | null
          refund_processed: boolean | null
        }
        Insert: {
          cancelled_by: string
          cancelled_by_role: string
          created_at?: string
          id?: string
          items_restocked?: boolean | null
          order_id: string
          reason: string
          refund_amount?: number | null
          refund_processed?: boolean | null
        }
        Update: {
          cancelled_by?: string
          cancelled_by_role?: string
          created_at?: string
          id?: string
          items_restocked?: boolean | null
          order_id?: string
          reason?: string
          refund_amount?: number | null
          refund_processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
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
      chat_shortcuts: {
        Row: {
          category: string | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          message: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          message: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          keywords: string[]
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          keywords?: string[]
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          keywords?: string[]
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      coin_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collected_daily_coupons: {
        Row: {
          collected_at: string
          coupon_id: string
          expires_at: string
          id: string
          is_used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          collected_at?: string
          coupon_id: string
          expires_at: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          collected_at?: string
          coupon_id?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collected_daily_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "daily_coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      collected_vouchers: {
        Row: {
          collected_at: string
          id: string
          used_at: string | null
          user_id: string
          voucher_id: string
        }
        Insert: {
          collected_at?: string
          id?: string
          used_at?: string | null
          user_id: string
          voucher_id: string
        }
        Update: {
          collected_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collected_vouchers_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_message: string | null
          last_message_at: string | null
          product_id: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          product_id?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          product_id?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      couriers: {
        Row: {
          base_rate_pkr: number | null
          code: string
          created_at: string
          display_order: number | null
          estimated_days: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          per_kg_rate_pkr: number | null
          supports_cod: boolean
          tracking_url_template: string | null
          updated_at: string
        }
        Insert: {
          base_rate_pkr?: number | null
          code: string
          created_at?: string
          display_order?: number | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          per_kg_rate_pkr?: number | null
          supports_cod?: boolean
          tracking_url_template?: string | null
          updated_at?: string
        }
        Update: {
          base_rate_pkr?: number | null
          code?: string
          created_at?: string
          display_order?: number | null
          estimated_days?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          per_kg_rate_pkr?: number | null
          supports_cod?: boolean
          tracking_url_template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          description: string | null
          id: string
          order_id: string | null
          return_request_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          return_request_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          return_request_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_wallet_transactions_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "customer_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_wallets: {
        Row: {
          balance: number
          created_at: string
          customer_id: string
          id: string
          total_refunds: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          customer_id: string
          id?: string
          total_refunds?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          customer_id?: string
          id?: string
          total_refunds?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_coupons: {
        Row: {
          available_date: string
          category_restriction: string | null
          code: string
          created_at: string
          current_collections: number
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_collections: number | null
          max_discount_pkr: number | null
          min_spend_pkr: number | null
          title: string
          valid_for_hours: number
        }
        Insert: {
          available_date?: string
          category_restriction?: string | null
          code: string
          created_at?: string
          current_collections?: number
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_collections?: number | null
          max_discount_pkr?: number | null
          min_spend_pkr?: number | null
          title: string
          valid_for_hours?: number
        }
        Update: {
          available_date?: string
          category_restriction?: string | null
          code?: string
          created_at?: string
          current_collections?: number
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_collections?: number | null
          max_discount_pkr?: number | null
          min_spend_pkr?: number | null
          title?: string
          valid_for_hours?: number
        }
        Relationships: []
      }
      deposit_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          payment_method_id: string
          processed_at: string | null
          processed_by: string | null
          requester_type: Database["public"]["Enums"]["deposit_requester_type"]
          screenshot_url: string
          status: Database["public"]["Enums"]["deposit_request_status"]
          transaction_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method_id: string
          processed_at?: string | null
          processed_by?: string | null
          requester_type: Database["public"]["Enums"]["deposit_requester_type"]
          screenshot_url: string
          status?: Database["public"]["Enums"]["deposit_request_status"]
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method_id?: string
          processed_at?: string | null
          processed_by?: string | null
          requester_type?: Database["public"]["Enums"]["deposit_requester_type"]
          screenshot_url?: string
          status?: Database["public"]["Enums"]["deposit_request_status"]
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_requests_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_logs: {
        Row: {
          amount_pkr: number
          commission_amount_pkr: number | null
          created_at: string
          customer_id: string | null
          description: string
          id: string
          log_type: string
          metadata: Json | null
          net_amount_pkr: number
          order_id: string | null
          return_request_id: string | null
          seller_id: string | null
        }
        Insert: {
          amount_pkr: number
          commission_amount_pkr?: number | null
          created_at?: string
          customer_id?: string | null
          description: string
          id?: string
          log_type: string
          metadata?: Json | null
          net_amount_pkr: number
          order_id?: string | null
          return_request_id?: string | null
          seller_id?: string | null
        }
        Update: {
          amount_pkr?: number
          commission_amount_pkr?: number | null
          created_at?: string
          customer_id?: string | null
          description?: string
          id?: string
          log_type?: string
          metadata?: Json | null
          net_amount_pkr?: number
          order_id?: string | null
          return_request_id?: string | null
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_logs_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sale_nominations: {
        Row: {
          admin_notes: string | null
          created_at: string
          fee_deducted: boolean
          fee_deducted_at: string | null
          flash_sale_id: string | null
          id: string
          original_price_pkr: number
          product_id: string
          proposed_price_pkr: number
          seller_id: string
          status: string
          stock_limit: number
          time_slot_end: string
          time_slot_start: string
          total_fee_pkr: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          fee_deducted?: boolean
          fee_deducted_at?: string | null
          flash_sale_id?: string | null
          id?: string
          original_price_pkr: number
          product_id: string
          proposed_price_pkr: number
          seller_id: string
          status?: string
          stock_limit?: number
          time_slot_end: string
          time_slot_start: string
          total_fee_pkr?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          fee_deducted?: boolean
          fee_deducted_at?: string | null
          flash_sale_id?: string | null
          id?: string
          original_price_pkr?: number
          product_id?: string
          proposed_price_pkr?: number
          seller_id?: string
          status?: string
          stock_limit?: number
          time_slot_end?: string
          time_slot_start?: string
          total_fee_pkr?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flash_sale_nominations_flash_sale_id_fkey"
            columns: ["flash_sale_id"]
            isOneToOne: false
            referencedRelation: "flash_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sale_products: {
        Row: {
          created_at: string
          flash_price_pkr: number
          flash_sale_id: string
          id: string
          original_price_pkr: number
          product_id: string
          sold_count: number
          stock_limit: number
        }
        Insert: {
          created_at?: string
          flash_price_pkr: number
          flash_sale_id: string
          id?: string
          original_price_pkr: number
          product_id: string
          sold_count?: number
          stock_limit?: number
        }
        Update: {
          created_at?: string
          flash_price_pkr?: number
          flash_sale_id?: string
          id?: string
          original_price_pkr?: number
          product_id?: string
          sold_count?: number
          stock_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "flash_sale_products_flash_sale_id_fkey"
            columns: ["flash_sale_id"]
            isOneToOne: false
            referencedRelation: "flash_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_sale_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_sales: {
        Row: {
          application_deadline: string | null
          campaign_name: string
          created_at: string
          end_date: string
          fee_per_product_pkr: number
          id: string
          is_active: boolean
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          campaign_name: string
          created_at?: string
          end_date: string
          fee_per_product_pkr?: number
          id?: string
          is_active?: boolean
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          campaign_name?: string
          created_at?: string
          end_date?: string
          fee_per_product_pkr?: number
          id?: string
          is_active?: boolean
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_buy_deals: {
        Row: {
          created_at: string
          current_participants: number
          ends_at: string
          group_price_pkr: number
          id: string
          max_participants: number | null
          min_participants: number
          original_price_pkr: number
          product_id: string
          seller_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_participants?: number
          ends_at: string
          group_price_pkr: number
          id?: string
          max_participants?: number | null
          min_participants?: number
          original_price_pkr: number
          product_id: string
          seller_id: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_participants?: number
          ends_at?: string
          group_price_pkr?: number
          id?: string
          max_participants?: number | null
          min_participants?: number
          original_price_pkr?: number
          product_id?: string
          seller_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_buy_deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      group_buy_participants: {
        Row: {
          deal_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          deal_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          deal_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_buy_participants_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "group_buy_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          animation_type: string | null
          button_color: string | null
          button_text: string | null
          button_text_color: string | null
          created_at: string
          display_order: number
          gradient_direction: string | null
          id: string
          image_url: string
          is_active: boolean
          link_type: string
          link_value: string | null
          overlay_color: string | null
          overlay_opacity: number | null
          subtitle: string | null
          subtitle_bold: boolean | null
          subtitle_color: string | null
          subtitle_font: string | null
          subtitle_size: string | null
          text_alignment: string | null
          title: string
          title_bold: boolean | null
          title_color: string | null
          title_font: string | null
          title_size: string | null
          updated_at: string
        }
        Insert: {
          animation_type?: string | null
          button_color?: string | null
          button_text?: string | null
          button_text_color?: string | null
          created_at?: string
          display_order?: number
          gradient_direction?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_type?: string
          link_value?: string | null
          overlay_color?: string | null
          overlay_opacity?: number | null
          subtitle?: string | null
          subtitle_bold?: boolean | null
          subtitle_color?: string | null
          subtitle_font?: string | null
          subtitle_size?: string | null
          text_alignment?: string | null
          title: string
          title_bold?: boolean | null
          title_color?: string | null
          title_font?: string | null
          title_size?: string | null
          updated_at?: string
        }
        Update: {
          animation_type?: string | null
          button_color?: string | null
          button_text?: string | null
          button_text_color?: string | null
          created_at?: string
          display_order?: number
          gradient_direction?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_type?: string
          link_value?: string | null
          overlay_color?: string | null
          overlay_opacity?: number | null
          subtitle?: string | null
          subtitle_bold?: boolean | null
          subtitle_color?: string | null
          subtitle_font?: string | null
          subtitle_size?: string | null
          text_alignment?: string | null
          title?: string
          title_bold?: boolean | null
          title_color?: string | null
          title_font?: string | null
          title_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      installment_orders: {
        Row: {
          created_at: string
          id: string
          monthly_amount_pkr: number
          next_due_date: string | null
          order_id: string
          paid_installments: number
          plan_id: string
          status: string
          total_amount_pkr: number
          total_installments: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_amount_pkr: number
          next_due_date?: string | null
          order_id: string
          paid_installments?: number
          plan_id: string
          status?: string
          total_amount_pkr: number
          total_installments: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_amount_pkr?: number
          next_due_date?: string | null
          order_id?: string
          paid_installments?: number
          plan_id?: string
          status?: string
          total_amount_pkr?: number
          total_installments?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installment_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installment_orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_payments: {
        Row: {
          amount_pkr: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          installment_order_id: string
          paid_at: string | null
          status: string
        }
        Insert: {
          amount_pkr: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          installment_order_id: string
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount_pkr?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          installment_order_id?: string
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "installment_payments_installment_order_id_fkey"
            columns: ["installment_order_id"]
            isOneToOne: false
            referencedRelation: "installment_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_plans: {
        Row: {
          created_at: string
          id: string
          interest_rate: number
          is_active: boolean
          min_order_amount_pkr: number
          months: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_rate?: number
          is_active?: boolean
          min_order_amount_pkr?: number
          months: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_rate?: number
          is_active?: boolean
          min_order_amount_pkr?: number
          months?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string
          price_pkr: number
          product_id: string
          quantity: number
          seller_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id: string
          price_pkr: number
          product_id: string
          quantity?: number
          seller_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string
          price_pkr?: number
          product_id?: string
          quantity?: number
          seller_id?: string
          title?: string
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
          address_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          courier_id: string | null
          courier_name: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_instructions: string | null
          id: string
          items: Json
          order_number: string | null
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          shipped_at: string | null
          shipping_address: string
          total_amount_pkr: number
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          courier_id?: string | null
          courier_name?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_instructions?: string | null
          id?: string
          items?: Json
          order_number?: string | null
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipped_at?: string | null
          shipping_address: string
          total_amount_pkr: number
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          courier_id?: string | null
          courier_name?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_instructions?: string | null
          id?: string
          items?: Json
          order_number?: string | null
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          shipped_at?: string | null
          shipping_address?: string
          total_amount_pkr?: number
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "couriers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_name: string
          account_number: string | null
          created_at: string
          display_order: number
          iban: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          method_name: string
          till_id: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          created_at?: string
          display_order?: number
          iban?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          method_name: string
          till_id?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          created_at?: string
          display_order?: number
          iban?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          method_name?: string
          till_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          account_title: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string
          iban: string
          id: string
          processed_at: string | null
          processed_by: string | null
          receipt_url: string | null
          seller_id: string
          status: Database["public"]["Enums"]["payout_status"]
          transaction_reference: string | null
          updated_at: string
          wallet_id: string
        }
        Insert: {
          account_title: string
          admin_notes?: string | null
          amount: number
          bank_name: string
          created_at?: string
          iban: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          receipt_url?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["payout_status"]
          transaction_reference?: string | null
          updated_at?: string
          wallet_id: string
        }
        Update: {
          account_title?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string
          created_at?: string
          iban?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          receipt_url?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          transaction_reference?: string | null
          updated_at?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "seller_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_memberships: {
        Row: {
          auto_renew: boolean
          benefits: Json | null
          created_at: string
          expires_at: string
          id: string
          plan_type: string
          price_pkr: number
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          benefits?: Json | null
          created_at?: string
          expires_at: string
          id?: string
          plan_type?: string
          price_pkr?: number
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          benefits?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          plan_type?: string
          price_pkr?: number
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_questions: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          asked_at: string
          created_at: string
          customer_id: string
          id: string
          is_visible: boolean
          product_id: string
          question_text: string
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          asked_at?: string
          created_at?: string
          customer_id: string
          id?: string
          is_visible?: boolean
          product_id: string
          question_text: string
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          asked_at?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_visible?: boolean
          product_id?: string
          question_text?: string
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          hidden_at: string | null
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          images: string[] | null
          is_hidden: boolean | null
          order_id: string
          product_id: string
          rating: number
          review_text: string | null
          seller_replied_at: string | null
          seller_reply: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          images?: string[] | null
          is_hidden?: boolean | null
          order_id: string
          product_id: string
          rating: number
          review_text?: string | null
          seller_replied_at?: string | null
          seller_reply?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          images?: string[] | null
          is_hidden?: boolean | null
          order_id?: string
          product_id?: string
          rating?: number
          review_text?: string | null
          seller_replied_at?: string | null
          seller_reply?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          additional_price_pkr: number
          created_at: string
          id: string
          image_urls: string[] | null
          product_id: string
          stock_count: number
          updated_at: string
          variant_name: string
          variant_value: string
        }
        Insert: {
          additional_price_pkr?: number
          created_at?: string
          id?: string
          image_urls?: string[] | null
          product_id: string
          stock_count?: number
          updated_at?: string
          variant_name: string
          variant_value: string
        }
        Update: {
          additional_price_pkr?: number
          created_at?: string
          id?: string
          image_urls?: string[] | null
          product_id?: string
          stock_count?: number
          updated_at?: string
          variant_name?: string
          variant_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string | null
          discount_price_pkr: number | null
          display_id: string | null
          free_shipping: boolean
          id: string
          images: string[] | null
          location: string | null
          price_pkr: number
          seller_id: string
          size_guide_id: string | null
          sku: string | null
          slug: string | null
          sold_count: number
          status: Database["public"]["Enums"]["product_status"]
          stock_count: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          discount_price_pkr?: number | null
          display_id?: string | null
          free_shipping?: boolean
          id?: string
          images?: string[] | null
          location?: string | null
          price_pkr: number
          seller_id: string
          size_guide_id?: string | null
          sku?: string | null
          slug?: string | null
          sold_count?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          discount_price_pkr?: number | null
          display_id?: string | null
          free_shipping?: boolean
          id?: string
          images?: string[] | null
          location?: string | null
          price_pkr?: number
          seller_id?: string
          size_guide_id?: string | null
          sku?: string | null
          slug?: string | null
          sold_count?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_size_guide_id_fkey"
            columns: ["size_guide_id"]
            isOneToOne: false
            referencedRelation: "size_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          display_id: string | null
          email: string
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          display_id?: string | null
          email: string
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          display_id?: string | null
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recently_viewed_products: {
        Row: {
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          commission_percentage: number
          created_at: string
          id: string
          is_active: boolean
          total_earnings_pkr: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          commission_percentage?: number
          created_at?: string
          id?: string
          is_active?: boolean
          total_earnings_pkr?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          commission_percentage?: number
          created_at?: string
          id?: string
          is_active?: boolean
          total_earnings_pkr?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          commission_amount_pkr: number
          created_at: string
          id: string
          order_id: string | null
          referred_user_id: string
          referrer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          commission_amount_pkr?: number
          created_at?: string
          id?: string
          order_id?: string | null
          referred_user_id: string
          referrer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          commission_amount_pkr?: number
          created_at?: string
          id?: string
          order_id?: string | null
          referred_user_id?: string
          referrer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      return_requests: {
        Row: {
          additional_comments: string | null
          admin_decided_at: string | null
          admin_decision: string | null
          admin_id: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          order_item_id: string
          photos: string[] | null
          product_id: string
          quantity: number
          reason: Database["public"]["Enums"]["return_reason"]
          refund_amount: number
          refund_processed_at: string | null
          seller_id: string
          seller_responded_at: string | null
          seller_response: string | null
          status: Database["public"]["Enums"]["return_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          additional_comments?: string | null
          admin_decided_at?: string | null
          admin_decision?: string | null
          admin_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          order_item_id: string
          photos?: string[] | null
          product_id: string
          quantity?: number
          reason: Database["public"]["Enums"]["return_reason"]
          refund_amount?: number
          refund_processed_at?: string | null
          seller_id: string
          seller_responded_at?: string | null
          seller_response?: string | null
          status?: Database["public"]["Enums"]["return_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          additional_comments?: string | null
          admin_decided_at?: string | null
          admin_decision?: string | null
          admin_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          order_item_id?: string
          photos?: string[] | null
          product_id?: string
          quantity?: number
          reason?: Database["public"]["Enums"]["return_reason"]
          refund_amount?: number
          refund_processed_at?: string | null
          seller_id?: string
          seller_responded_at?: string | null
          seller_response?: string | null
          status?: Database["public"]["Enums"]["return_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          feature: Database["public"]["Enums"]["permission_feature"]
          id: string
          role_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          feature: Database["public"]["Enums"]["permission_feature"]
          id?: string
          role_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          feature?: Database["public"]["Enums"]["permission_feature"]
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "staff_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_commissions: {
        Row: {
          created_at: string
          custom_commission_percentage: number | null
          grace_commission_percentage: number | null
          grace_period_months: number | null
          grace_start_date: string | null
          id: string
          notes: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_commission_percentage?: number | null
          grace_commission_percentage?: number | null
          grace_period_months?: number | null
          grace_start_date?: string | null
          id?: string
          notes?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_commission_percentage?: number | null
          grace_commission_percentage?: number | null
          grace_period_months?: number | null
          grace_start_date?: string | null
          id?: string
          notes?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_profiles: {
        Row: {
          account_title: string
          bank_cheque_url: string | null
          bank_name: string
          business_address: string
          city: string
          cnic_back_url: string | null
          cnic_expiry_date: string | null
          cnic_front_url: string | null
          cnic_issue_date: string | null
          cnic_number: string
          created_at: string
          date_of_birth: string | null
          display_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          father_husband_name: string | null
          gender: string | null
          iban: string
          id: string
          is_official_store: boolean
          legal_name: string
          ntn_number: string | null
          official_store_approved_at: string | null
          official_store_approved_by: string | null
          official_store_badge: string | null
          rejection_reason: string | null
          selfie_url: string | null
          shop_name: string
          submitted_at: string
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["seller_verification_status"]
          verified_at: string | null
        }
        Insert: {
          account_title: string
          bank_cheque_url?: string | null
          bank_name: string
          business_address: string
          city: string
          cnic_back_url?: string | null
          cnic_expiry_date?: string | null
          cnic_front_url?: string | null
          cnic_issue_date?: string | null
          cnic_number: string
          created_at?: string
          date_of_birth?: string | null
          display_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          father_husband_name?: string | null
          gender?: string | null
          iban: string
          id?: string
          is_official_store?: boolean
          legal_name: string
          ntn_number?: string | null
          official_store_approved_at?: string | null
          official_store_approved_by?: string | null
          official_store_badge?: string | null
          rejection_reason?: string | null
          selfie_url?: string | null
          shop_name: string
          submitted_at?: string
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["seller_verification_status"]
          verified_at?: string | null
        }
        Update: {
          account_title?: string
          bank_cheque_url?: string | null
          bank_name?: string
          business_address?: string
          city?: string
          cnic_back_url?: string | null
          cnic_expiry_date?: string | null
          cnic_front_url?: string | null
          cnic_issue_date?: string | null
          cnic_number?: string
          created_at?: string
          date_of_birth?: string | null
          display_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          father_husband_name?: string | null
          gender?: string | null
          iban?: string
          id?: string
          is_official_store?: boolean
          legal_name?: string
          ntn_number?: string | null
          official_store_approved_at?: string | null
          official_store_approved_by?: string | null
          official_store_badge?: string | null
          rejection_reason?: string | null
          selfie_url?: string | null
          shop_name?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["seller_verification_status"]
          verified_at?: string | null
        }
        Relationships: []
      }
      seller_wallets: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          pending_clearance: number
          seller_id: string
          total_earnings: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          pending_clearance?: number
          seller_id: string
          total_earnings?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          pending_clearance?: number
          seller_id?: string
          total_earnings?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          is_active: boolean
          page: string
          section_key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page: string
          section_key: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page?: string
          section_key?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          setting_key: string
          setting_type: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          setting_key: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      size_guides: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          measurement_unit: string
          name: string
          size_chart: Json
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          measurement_unit?: string
          name: string
          size_chart?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          measurement_unit?: string
          name?: string
          size_chart?: Json
          updated_at?: string
        }
        Relationships: []
      }
      spin_wheel_config: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          probability: number
          reward_type: string
          reward_value: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          probability?: number
          reward_type: string
          reward_value?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          probability?: number
          reward_type?: string
          reward_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      spin_wheel_entries: {
        Row: {
          config_id: string | null
          id: string
          reward_label: string | null
          reward_type: string | null
          reward_value: number | null
          spun_at: string
          user_id: string
        }
        Insert: {
          config_id?: string | null
          id?: string
          reward_label?: string | null
          reward_type?: string | null
          reward_value?: number | null
          spun_at?: string
          user_id: string
        }
        Update: {
          config_id?: string | null
          id?: string
          reward_label?: string | null
          reward_type?: string | null
          reward_value?: number | null
          spun_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spin_wheel_entries_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "spin_wheel_config"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_products: {
        Row: {
          approved_by: string | null
          budget_pkr: number
          clicks: number
          cost_per_click_pkr: number
          created_at: string
          ends_at: string | null
          id: string
          impressions: number
          placement: string | null
          product_id: string
          seller_id: string
          spent_pkr: number
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          budget_pkr?: number
          clicks?: number
          cost_per_click_pkr?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          impressions?: number
          placement?: string | null
          product_id: string
          seller_id: string
          spent_pkr?: number
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          budget_pkr?: number
          clicks?: number
          cost_per_click_pkr?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          impressions?: number
          placement?: string | null
          product_id?: string
          seller_id?: string
          spent_pkr?: number
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_role_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "staff_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system_role: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_agent_status: {
        Row: {
          active_chats: number
          created_at: string
          id: string
          is_online: boolean
          last_seen_at: string
          max_concurrent_chats: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_chats?: number
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen_at?: string
          max_concurrent_chats?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_chats?: number
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen_at?: string
          max_concurrent_chats?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_chat_sessions: {
        Row: {
          agent_id: string | null
          created_at: string
          ended_at: string | null
          feedback_text: string | null
          id: string
          rating: number | null
          rating_comment: string | null
          started_at: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          ended_at?: string | null
          feedback_text?: string | null
          id?: string
          rating?: number | null
          rating_comment?: string | null
          started_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          ended_at?: string | null
          feedback_text?: string | null
          id?: string
          rating?: number | null
          rating_comment?: string | null
          started_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "support_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          area: string | null
          city: string
          created_at: string
          full_address: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string
          province: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          city: string
          created_at?: string
          full_address: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone: string
          province: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          full_address?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string
          province?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recently_viewed: {
        Row: {
          category: string
          id: string
          product_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          category: string
          id?: string
          product_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          category?: string
          id?: string
          product_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voucher_usage: {
        Row: {
          id: string
          order_id: string | null
          used_at: string
          user_id: string
          voucher_id: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
          voucher_id: string
        }
        Update: {
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_usage_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expiry_date: string
          id: string
          is_active: boolean
          minimum_spend_pkr: number
          one_per_customer: boolean
          product_id: string | null
          seller_id: string | null
          title: string | null
          updated_at: string
          usage_limit: number | null
          used_count: number
          voucher_type: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expiry_date: string
          id?: string
          is_active?: boolean
          minimum_spend_pkr?: number
          one_per_customer?: boolean
          product_id?: string | null
          seller_id?: string | null
          title?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          voucher_type?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expiry_date?: string
          id?: string
          is_active?: boolean
          minimum_spend_pkr?: number
          one_per_customer?: boolean
          product_id?: string | null
          seller_id?: string | null
          title?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          voucher_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          commission_amount: number
          commission_percentage: number
          created_at: string
          description: string | null
          gross_amount: number
          id: string
          net_amount: number
          order_id: string | null
          seller_id: string
          transaction_type: Database["public"]["Enums"]["wallet_transaction_type"]
          wallet_id: string
        }
        Insert: {
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          description?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          seller_id: string
          transaction_type: Database["public"]["Enums"]["wallet_transaction_type"]
          wallet_id: string
        }
        Update: {
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          description?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          seller_id?: string
          transaction_type?: Database["public"]["Enums"]["wallet_transaction_type"]
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "seller_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_customer_wallet_balance: {
        Args: {
          p_adjustment_type: string
          p_admin_id: string
          p_amount: number
          p_customer_id: string
          p_reason: string
        }
        Returns: Json
      }
      adjust_seller_wallet_balance: {
        Args: {
          p_adjustment_type: string
          p_admin_id: string
          p_amount: number
          p_reason: string
          p_seller_id: string
        }
        Returns: Json
      }
      approve_deposit_request: {
        Args: {
          p_admin_id: string
          p_admin_notes?: string
          p_deposit_id: string
        }
        Returns: Json
      }
      can_request_return: { Args: { p_order_id: string }; Returns: boolean }
      cancel_order_with_refund: {
        Args: {
          p_cancelled_by: string
          p_cancelled_by_role: string
          p_order_id: string
          p_reason: string
        }
        Returns: Json
      }
      check_email_role_conflict: {
        Args: {
          p_email: string
          p_target_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: {
          existing_role: Database["public"]["Enums"]["app_role"]
          has_conflict: boolean
        }[]
      }
      decrease_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      decrease_variant_stock: {
        Args: { p_quantity: number; p_variant_id: string }
        Returns: boolean
      }
      deduct_flash_sale_fee: {
        Args: { p_admin_id: string; p_nomination_id: string }
        Returns: Json
      }
      generate_order_number: { Args: never; Returns: string }
      generate_product_slug: { Args: { title: string }; Returns: string }
      get_role_display_name: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      get_seller_commission_rate: {
        Args: { p_seller_id: string }
        Returns: number
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          feature: Database["public"]["Enums"]["permission_feature"]
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: {
          _action: Database["public"]["Enums"]["permission_action"]
          _feature: Database["public"]["Enums"]["permission_feature"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_flash_sale_sold: {
        Args: {
          p_flash_sale_id: string
          p_product_id: string
          p_quantity: number
        }
        Returns: boolean
      }
      is_seller_verified: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_action_category: string
          p_action_type: string
          p_after_data?: Json
          p_before_data?: Json
          p_description: string
          p_ip_address?: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_role: string
          p_severity: string
          p_user_agent?: string
          p_user_email: string
          p_user_id: string
        }
        Returns: string
      }
      notify_sellers_flash_sale: {
        Args: { p_flash_sale_id: string }
        Returns: number
      }
      process_customer_refund: {
        Args: { p_admin_id: string; p_return_request_id: string }
        Returns: boolean
      }
      process_order_earnings: {
        Args: { p_order_id: string; p_sale_amount: number; p_seller_id: string }
        Returns: undefined
      }
      process_payout: {
        Args: {
          p_admin_id: string
          p_payout_id: string
          p_transaction_reference: string
        }
        Returns: boolean
      }
      process_refund_deduction: {
        Args: { p_amount: number; p_order_id: string; p_seller_id: string }
        Returns: undefined
      }
      process_subscription_deduction: {
        Args: { p_seller_id: string }
        Returns: Json
      }
      reject_deposit_request: {
        Args: { p_admin_id: string; p_deposit_id: string; p_reason: string }
        Returns: Json
      }
      restock_order_items: { Args: { p_order_id: string }; Returns: boolean }
      validate_voucher: {
        Args: { p_code: string; p_order_total: number; p_user_id: string }
        Returns: {
          discount_amount: number
          message: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "customer" | "support_agent"
      deposit_request_status: "pending" | "approved" | "rejected"
      deposit_requester_type: "customer" | "seller"
      discount_type: "fixed" | "percentage"
      notification_type: "order" | "price_drop" | "promotion" | "system"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "unpaid" | "paid"
      payout_status: "pending" | "approved" | "rejected" | "completed"
      permission_action: "view" | "create" | "edit" | "delete"
      permission_feature:
        | "banners"
        | "products"
        | "orders"
        | "payouts"
        | "flash_sales"
        | "users"
        | "categories"
        | "reviews"
        | "returns"
        | "analytics"
        | "settings"
        | "vouchers"
        | "support"
      product_status: "pending" | "active" | "rejected"
      return_reason:
        | "wrong_item"
        | "damaged"
        | "quality_not_as_expected"
        | "size_fit_issue"
        | "changed_mind"
        | "other"
      return_status:
        | "return_requested"
        | "under_review"
        | "approved"
        | "rejected"
        | "item_shipped"
        | "item_received"
        | "refund_issued"
      seller_verification_status: "pending" | "verified" | "rejected"
      wallet_transaction_type:
        | "earning"
        | "commission_deduction"
        | "withdrawal"
        | "refund_deduction"
        | "adjustment"
        | "platform_fee"
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
      app_role: ["admin", "seller", "customer", "support_agent"],
      deposit_request_status: ["pending", "approved", "rejected"],
      deposit_requester_type: ["customer", "seller"],
      discount_type: ["fixed", "percentage"],
      notification_type: ["order", "price_drop", "promotion", "system"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["unpaid", "paid"],
      payout_status: ["pending", "approved", "rejected", "completed"],
      permission_action: ["view", "create", "edit", "delete"],
      permission_feature: [
        "banners",
        "products",
        "orders",
        "payouts",
        "flash_sales",
        "users",
        "categories",
        "reviews",
        "returns",
        "analytics",
        "settings",
        "vouchers",
        "support",
      ],
      product_status: ["pending", "active", "rejected"],
      return_reason: [
        "wrong_item",
        "damaged",
        "quality_not_as_expected",
        "size_fit_issue",
        "changed_mind",
        "other",
      ],
      return_status: [
        "return_requested",
        "under_review",
        "approved",
        "rejected",
        "item_shipped",
        "item_received",
        "refund_issued",
      ],
      seller_verification_status: ["pending", "verified", "rejected"],
      wallet_transaction_type: [
        "earning",
        "commission_deduction",
        "withdrawal",
        "refund_deduction",
        "adjustment",
        "platform_fee",
      ],
    },
  },
} as const
