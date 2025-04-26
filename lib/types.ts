export type PropertyStatus = 'active' | 'pending' | 'rejected';
export type ChatStatus = 'active' | 'archived';
export type AdviceStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type UserRole = 'customer' | 'realtor' | 'advisor';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  city: string;
  property_type: string;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area: string;
  images: string[];
  features: string[];
  realtor_id: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
}

export interface Chat {
  id: string;
  property_id: string;
  user_id: string;
  realtor_id: string;
  status: ChatStatus;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    location: string;
  };
  user?: {
    email: string;
  };
  realtor?: {
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface AdviceRequest {
  id: string;
  user_id: string;
  advisor_id: string;
  property_id: string;
  question: string;
  status: AdviceStatus;
  response: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    location: string;
  };
  user?: {
    email: string;
  };
  advisor?: {
    email: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Viewing {
  id: string;
  property_id: string;
  user_id: string;
  scheduled_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string;
  };
  property?: {
    title: string;
    location: string;
    images?: string[];
  };
} 