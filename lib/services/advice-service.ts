import { createClient } from '@/lib/supabase/client';
import { AdviceRequest } from '@/lib/types';

export class AdviceService {
  private supabase = createClient();

  async createAdviceRequest(request: Omit<AdviceRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'response'>) {
    const { data, error } = await this.supabase
      .from('advice_requests')
      .insert({
        ...request,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as AdviceRequest;
  }

  async getAdviceRequests(userId: string, role: string) {
    // First, get the advice requests
    const query = this.supabase
      .from('advice_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (role === 'customer') {
      query.eq('user_id', userId);
    } else if (role === 'advisor') {
      query.eq('advisor_id', userId);
    }

    const { data: adviceRequests, error } = await query;
    if (error) throw error;
    
    if (!adviceRequests || adviceRequests.length === 0) {
      return [] as unknown as AdviceRequest[];
    }
    
    // Then, get the related properties
    const propertyIds = adviceRequests.map(req => req.property_id);
    const { data: properties, error: propertiesError } = await this.supabase
      .from('properties')
      .select('id, title, location')
      .in('id', propertyIds);
    
    if (propertiesError) throw propertiesError;
    
    // Get user profiles for both users and advisors
    const userIds = adviceRequests.map(req => req.user_id);
    const advisorIds = adviceRequests.map(req => req.advisor_id);
    const allUserIds = [...new Set([...userIds, ...advisorIds])];
    
    const { data: userProfiles, error: userProfilesError } = await this.supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', allUserIds);
    
    if (userProfilesError) throw userProfilesError;
    
    // Create maps for quick lookups
    const propertyMap = new Map(properties?.map(p => [p.id, p]) || []);
    const userProfileMap = new Map(userProfiles?.map(p => [p.id, p]) || []);
    
    // Combine the data
    const enrichedAdviceRequests = adviceRequests.map(request => ({
      ...request,
      property: propertyMap.get(request.property_id) || { title: 'Unknown Property', location: 'Unknown Location' },
      user: userProfileMap.get(request.user_id) || { email: 'Unknown User' },
      advisor: userProfileMap.get(request.advisor_id) || { email: 'Unknown Advisor' }
    }));
    
    return enrichedAdviceRequests as unknown as AdviceRequest[];
  }

  async getAdvisors() {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'advisor');
    
    if (error) throw error;
    return data;
  }

  async respondToAdviceRequest(requestId: string, advisorId: string, response: string) {
    const { data, error } = await this.supabase
      .from('advice_requests')
      .update({
        status: 'completed',
        response,
      })
      .eq('id', requestId)
      .eq('advisor_id', advisorId)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as AdviceRequest;
  }

  async rejectAdviceRequest(requestId: string, advisorId: string) {
    const { data, error } = await this.supabase
      .from('advice_requests')
      .update({
        status: 'rejected',
      })
      .eq('id', requestId)
      .eq('advisor_id', advisorId)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as AdviceRequest;
  }
} 