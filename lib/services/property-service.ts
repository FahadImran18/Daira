import { createClient } from '@/lib/supabase/client';
import { Property, PropertyStatus } from '@/lib/types';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

export class PropertyService {
  private supabase = createClient();

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const { data, error } = await this.supabase
      .from("properties")
      .insert([property])
      .select()
      .single() as PostgrestSingleResponse<Property>;

    if (error) throw error;
    if (!data) throw new Error('Failed to create property');
    return data;
  }

  async getPropertiesByRealtor(realtorId: string): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from("properties")
      .select("*")
      .eq("realtor_id", realtorId)
      .order("created_at", { ascending: false }) as PostgrestResponse<Property>;

    if (error) throw error;
    return data || [];
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await this.supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single() as PostgrestSingleResponse<Property>;

    if (error) throw error;
    return data;
  }

  async updateProperty(id: string, updates: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>): Promise<Property> {
    const { data, error } = await this.supabase
      .from("properties")
      .update(updates)
      .eq("id", id)
      .select()
      .single() as PostgrestSingleResponse<Property>;

    if (error) throw error;
    if (!data) throw new Error('Failed to update property');
    return data;
  }

  async deleteProperty(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async searchProperties(filters: {
    city?: string;
    property_type?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: PropertyStatus;
  }): Promise<Property[]> {
    let query = this.supabase.from("properties").select("*");

    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters.property_type) {
      query = query.eq("property_type", filters.property_type);
    }

    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", { ascending: false }) as PostgrestResponse<Property>;

    if (error) throw error;
    return data || [];
  }
} 