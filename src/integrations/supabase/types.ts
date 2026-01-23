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
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
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
          campaign_name: string
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          updated_at: string
        }
        Insert: {
          campaign_name: string
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          updated_at?: string
        }
        Update: {
          campaign_name?: string
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_type: string
          link_value: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_type?: string
          link_value?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_type?: string
          link_value?: string | null
          title?: string
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
        ]
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
          id: string
          images: string[] | null
          price_pkr: number
          seller_id: string
          sku: string | null
          slug: string | null
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
          id?: string
          images?: string[] | null
          price_pkr: number
          seller_id: string
          sku?: string | null
          slug?: string | null
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
          id?: string
          images?: string[] | null
          price_pkr?: number
          seller_id?: string
          sku?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
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
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          father_husband_name: string | null
          gender: string | null
          iban: string
          id: string
          legal_name: string
          ntn_number: string | null
          rejection_reason: string | null
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
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          father_husband_name?: string | null
          gender?: string | null
          iban: string
          id?: string
          legal_name: string
          ntn_number?: string | null
          rejection_reason?: string | null
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
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          father_husband_name?: string | null
          gender?: string | null
          iban?: string
          id?: string
          legal_name?: string
          ntn_number?: string | null
          rejection_reason?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      decrease_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      decrease_variant_stock: {
        Args: { p_quantity: number; p_variant_id: string }
        Returns: boolean
      }
      generate_order_number: { Args: never; Returns: string }
      generate_product_slug: { Args: { title: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "seller" | "customer"
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
      app_role: ["admin", "seller", "customer"],
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
      ],
    },
  },
} as const
