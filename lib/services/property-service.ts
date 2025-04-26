import { createClient } from '@/lib/supabase/client';
import { Property, PropertyStatus } from '@/lib/types';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

export class PropertyService {
  private supabase = createClient();

  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    console.log('Creating property with data:', property);
    
    // First check if user has realtor role
    const { data: userProfile, error: roleError } = await this.supabase
      .from('user_profiles')
      .select('role')
      .eq('id', property.realtor_id)
      .single();

    if (roleError) {
      console.error('Error checking user role:', roleError);
      throw new Error('Failed to verify user role');
    }

    if (!userProfile || userProfile.role !== 'realtor') {
      throw new Error('Only realtors can create properties');
    }

    // Prepare property data with required fields
    const propertyData = {
      ...property,
      // Ensure price and area are strings
      price: property.price.toString(),
      area: property.area.toString(),
      features: property.features || [],
      images: property.images || [],
      status: 'active' as PropertyStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.price || 
        !propertyData.location || !propertyData.city || !propertyData.property_type) {
      throw new Error('Missing required fields');
    }

    console.log('Inserting property data:', propertyData);
    
    const { data, error } = await this.supabase
      .from("properties")
      .insert([propertyData])
      .select()
      .single() as PostgrestSingleResponse<Property>;

    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create property: No data returned');
    }
    
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