// src/types/index.ts

export interface Campaign {
  id: string;
  title: string;
  description: string;
  organizer_name: string;
  category: string;
  target_amount: number;
  collected_amount: number;
  cover_image_key: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  title: string;
  amount: number;
  quantity: number;
  image: any; // Using 'any' for local image require
}

export interface Hopecard {
  id: string;
  campaign_id: string;
  purchased_by: string;
  amount: number;
  created_at: string;
}
