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
        id,
        chat_id,
        sender_id,
        message,
        created_at,
        sender:user_profiles!chat_messages_sender_id_fkey(email)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data as unknown as ChatMessage[];
  }

  async sendMessage(chatId: string, senderId: string, message: string) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        message,
      })
      .select(`
        id,
        chat_id,
        sender_id,
        message,
        created_at,
        sender:user_profiles!chat_messages_sender_id_fkey(email)
      `)
      .single();
    
    if (error) throw error;

    // Update chat's updated_at timestamp
    await this.supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data as unknown as ChatMessage;
  }

  async archiveChat(chatId: string) {
    const { error } = await this.supabase
      .from('chats')
      .update({ status: 'archived' as ChatStatus })
      .eq('id', chatId);
    
    if (error) throw error;
  }
} 