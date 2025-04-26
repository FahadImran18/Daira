import { createClient } from '@/lib/supabase/client';
import { Chat, ChatMessage, ChatStatus } from '@/lib/types';

export class ChatService {
  private supabase = createClient();

  async createChat(propertyId: string, userId: string, realtorId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .insert({
        property_id: propertyId,
        user_id: userId,
        realtor_id: realtorId,
        status: 'active' as ChatStatus,
      })
      .select(`
        id,
        property_id,
        user_id,
        realtor_id,
        status,
        created_at,
        updated_at,
        property:properties(title, location),
        user:user_profiles!chats_user_id_fkey(email),
        realtor:user_profiles!chats_realtor_id_fkey(email)
      `)
      .single();
    
    if (error) throw error;
    return data as unknown as Chat;
  }

  async getOrCreateChat(propertyId: string, userId: string, realtorId: string) {
    // Try to find existing chat
    const { data: existingChat, error: findError } = await this.supabase
      .from('chats')
      .select('*')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .eq('realtor_id', realtorId)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw findError;
    }

    if (existingChat) {
      return existingChat as unknown as Chat;
    }

    // Create new chat if none exists
    return this.createChat(propertyId, userId, realtorId);
  }

  async getChats(userId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .select(`
        id,
        property_id,
        user_id,
        realtor_id,
        status,
        created_at,
        updated_at,
        property:properties(title, location),
        user:user_profiles!chats_user_id_fkey(email),
        realtor:user_profiles!chats_realtor_id_fkey(email)
      `)
      .or(`user_id.eq.${userId},realtor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as Chat[];
  }

  async getChatsByRealtor(realtorId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .select(`
        id,
        property_id,
        user_id,
        realtor_id,
        status,
        created_at,
        updated_at,
        property:properties(title, location),
        user:user_profiles!chats_user_id_fkey(email),
        realtor:user_profiles!chats_realtor_id_fkey(email)
      `)
      .eq('realtor_id', realtorId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as Chat[];
  }

  async getChatsByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .select(`
        id,
        property_id,
        user_id,
        realtor_id,
        status,
        created_at,
        updated_at,
        property:properties(title, location),
        user:user_profiles!chats_user_id_fkey(email),
        realtor:user_profiles!chats_realtor_id_fkey(email)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as Chat[];
  }

  async getChatMessages(chatId: string) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select(`
        *,
        sender:user_profiles!sender_id(email, full_name)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as unknown as ChatMessage[];
  }

  async sendMessage(chatId: string, senderId: string, content: string) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as ChatMessage;
  }

  async archiveChat(chatId: string) {
    const { error } = await this.supabase
      .from('chats')
      .update({ status: 'archived' as ChatStatus })
      .eq('id', chatId);
    
    if (error) throw error;
  }

  async getUserChats(userId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .select(`
        *,
        property:properties(title, location, images),
        user:user_profiles!user_id(email, full_name),
        realtor:user_profiles!realtor_id(email, full_name),
        messages:chat_messages(*)
      `)
      .or(`user_id.eq.${userId},realtor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as Chat[];
  }
} 