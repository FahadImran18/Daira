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
    return data as AdviceRequest;
  }

  async getAdviceRequests(userId: string, role: string) {
    const query = this.supabase
      .from('advice_requests')
      .select(`
        *,
        property:properties(title, location),
        user:user_profiles!advice_requests_user_id_fkey(email),
        advisor:user_profiles!advice_requests_advisor_id_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (role === 'customer') {
      query.eq('user_id', userId);
    } else if (role === 'advisor') {
      query.eq('advisor_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
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
    return data as AdviceRequest;
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
    return data as AdviceRequest;
  }
} 