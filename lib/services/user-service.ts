import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/lib/types';

export class UserService {
  private supabase = createClient();

  async createUserProfile(userId: string, email: string, role: 'customer' | 'realtor' | 'advisor', fullName?: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        role,
        full_name: fullName || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  }

  async getUserRole(userId: string) {
    const profile = await this.getUserProfile(userId);
    return profile.role;
  }

  async isRealtor(userId: string) {
    const role = await this.getUserRole(userId);
    return role === 'realtor';
  }

  async isAdvisor(userId: string) {
    const role = await this.getUserRole(userId);
    return role === 'advisor';
  }
} 