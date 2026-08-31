export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AssetStatus = "available" | "borrowed" | "maintenance";
export type TransactionType = "borrow" | "return";
export type ReturnCondition = "good" | "damaged_minor" | "damaged_repair";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          department: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          department?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          department?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          prefix_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          prefix_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          prefix_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          id: string;
          asset_code: string;
          name: string;
          category_id: string | null;
          brand_model: string | null;
          serial_number: string | null;
          quantity: number;
          available_quantity: number;
          status: AssetStatus;
          image_url: string | null;
          location: string | null;
          department: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_code: string;
          name: string;
          category_id?: string | null;
          brand_model?: string | null;
          serial_number?: string | null;
          quantity?: number;
          available_quantity?: number;
          status?: AssetStatus;
          image_url?: string | null;
          location?: string | null;
          department?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          asset_code?: string;
          name?: string;
          category_id?: string | null;
          brand_model?: string | null;
          serial_number?: string | null;
          quantity?: number;
          available_quantity?: number;
          status?: AssetStatus;
          image_url?: string | null;
          location?: string | null;
          department?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          asset_id: string;
          borrower_name: string;
          borrower_department: string | null;
          type: TransactionType;
          borrowed_at: string;
          due_date: string | null;
          returned_at: string | null;
          status: string;
          notes: string | null;
          condition_on_return: ReturnCondition | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_id: string;
          borrower_name: string;
          borrower_department?: string | null;
          type?: TransactionType;
          borrowed_at?: string;
          due_date?: string | null;
          returned_at?: string | null;
          status?: string;
          notes?: string | null;
          condition_on_return?: ReturnCondition | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          borrower_name?: string;
          borrower_department?: string | null;
          type?: TransactionType;
          borrowed_at?: string;
          due_date?: string | null;
          returned_at?: string | null;
          status?: string;
          notes?: string | null;
          condition_on_return?: ReturnCondition | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      borrow_asset_rpc: {
        Args: {
          p_asset_id: string;
          p_borrower_name: string;
          p_borrower_dept?: string | null;
          p_due_date?: string | null;
          p_notes?: string | null;
          p_user_id?: string | null;
        };
        Returns: string;
      };
      return_asset_rpc: {
        Args: {
          p_transaction_id: string;
          p_condition?: ReturnCondition;
          p_notes?: string | null;
        };
        Returns: string;
      };
    };
    Enums: {
      asset_status: AssetStatus;
      transaction_type: TransactionType;
      return_condition: ReturnCondition;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
