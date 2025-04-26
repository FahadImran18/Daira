import { createClient } from '@/lib/supabase/client';
import { Chat, ChatMessage } from '@/lib/types';

export class ChatService {
  private supabase = createClient();

  async createChat(propertyId: string, userId: string, realtorId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .insert({
        property_id: propertyId,
        user_id: userId,
        realtor_id: realtorId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Chat;
  }

  async getChats(userId: string) {
    const { data, error } = await this.supabase
      .from('chats')
      .select(`
        *,
        property:properties(title, location),
        user:user_profiles!chats_user_id_fkey(email),
        realtor:user_profiles!chats_realtor_id_fkey(email)
      `)
      .or(`user_id.eq.${userId},realtor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getChatMessages(chatId: string) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select(`
        *,
        sender:user_profiles!chat_messages_sender_id_fkey(email)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async sendMessage(chatId: string, senderId: string, message: string) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: senderId,
        message,
      })
      .select()
      .single();
    
    if (error) throw error;

    // Update chat's updated_at timestamp
    await this.supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data as ChatMessage;
  }

  async archiveChat(chatId: string) {
    const { error } = await this.supabase
      .from('chats')
      .update({ status: 'archived' })
      .eq('id', chatId);
    
    if (error) throw error;
  }
} 