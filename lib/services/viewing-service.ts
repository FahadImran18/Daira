import { createClient } from '@/lib/supabase/client';
import { Viewing } from '@/lib/types';

export class ViewingService {
  private supabase = createClient();

  async scheduleViewing(viewing: Omit<Viewing, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    const { data, error } = await this.supabase
      .from('viewings')
      .insert({
        ...viewing,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as Viewing;
  }

  async getViewings(propertyId: string) {
    const { data, error } = await this.supabase
      .from('viewings')
      .select(`
        *,
        user:user_profiles!user_id(email, full_name),
        property:properties(title, location)
      `)
      .eq('property_id', propertyId)
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data as unknown as Viewing[];
  }

  async updateViewingStatus(viewingId: string, status: 'approved' | 'rejected' | 'completed') {
    const { data, error } = await this.supabase
      .from('viewings')
      .update({ status })
      .eq('id', viewingId)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as Viewing;
  }

  async getUserViewings(userId: string) {
    const { data, error } = await this.supabase
      .from('viewings')
      .select(`
        *,
        property:properties(title, location, images)
      `)
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data as unknown as Viewing[];
  }
} 