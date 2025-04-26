import { createClient } from '@/lib/supabase/client';
import { Chat, ChatMessage, ChatStatus } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';

// Define types for database responses
interface DbChat {
  id: string;
  property_id: string;
  user_id: string;
  realtor_id: string;
  status: ChatStatus;
  created_at: string;
  updated_at: string;
}

interface DbProperty {
  id: string;
  title: string;
  location: string;
}

export class ChatService {
  private supabase = createClient();

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  async createChat(propertyId: string, userId: string, realtorId: string) {
    // First, create the chat
    const { data: chat, error: chatError } = await this.supabase
      .from('chats')
      .insert({
        property_id: propertyId,
        user_id: userId,
        realtor_id: realtorId,
        status: 'active' as ChatStatus,
      })
      .select()
      .single();

    if (chatError) throw chatError;

    // Then fetch the property details
    const { data: property, error: propertyError } = await this.supabase
      .from('properties')
      .select('title, location')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;

    // Combine the data
    return {
      ...chat,
      property,
    } as unknown as Chat;
  }

  async getOrCreateChat(propertyId: string, userId: string, realtorId: string) {
    // Try to find existing chat
    const { data: existingChats, error: findError } = await this.supabase
      .from('chats')
      .select()
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .eq('realtor_id', realtorId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (findError) {
      throw findError;
    }

    // If we found an existing chat, return it with property details
    if (existingChats && existingChats.length > 0) {
      const existingChat = existingChats[0];
      
      // Fetch property details for existing chat
      const propertyId = existingChat.property_id as string;
      const { data: property, error: propertyError } = await this.supabase
        .from('properties')
        .select('title, location')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      return {
        ...existingChat,
        property,
      } as unknown as Chat;
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
        properties!inner(title, location),
        user:user_profiles!chats_user_id_fkey(email),
        realtor:user_profiles!chats_realtor_id_fkey(email)
      `)
      .or(`user_id.eq.${userId},realtor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as Chat[];
  }

  async getChatsByRealtor(realtorId: string) {
    console.log("Fetching chats for realtor:", realtorId);
    
    // First get all chats for the realtor
    const { data: chats, error: chatsError } = await this.supabase
      .from('chats')
      .select()
      .eq('realtor_id', realtorId)
      .order('updated_at', { ascending: false });

    if (chatsError) {
      console.error("Error fetching chats for realtor:", chatsError);
      throw chatsError;
    }
    
    if (!chats || chats.length === 0) {
      console.log("No chats found for realtor");
      return [];
    }

    console.log(`Found ${chats.length} chats for realtor`);

    // Extract property IDs from chats
    const propertyIds = chats
      .map(chat => chat.property_id as string)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    // Then fetch property details for all chats
    const { data: properties, error: propertiesError } = await this.supabase
      .from('properties')
      .select('id, title, location')
      .in('id', propertyIds);

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw propertiesError;
    }

    // Fetch user profiles for all chats
    const userIds = chats
      .map(chat => chat.user_id as string)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    const { data: userProfiles, error: userProfilesError } = await this.supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', userIds);

    if (userProfilesError) {
      console.error("Error fetching user profiles:", userProfilesError);
      throw userProfilesError;
    }

    // Combine the data
    const result = chats.map(chat => {
      const propertyId = chat.property_id as string;
      const userId = chat.user_id as string;
      
      return {
        ...chat,
        property: properties?.find(p => p.id === propertyId),
        user: userProfiles?.find(u => u.id === userId),
      };
    });

    console.log("Returning combined chat data:", result);
    return result as unknown as Chat[];
  }

  async getChatsByUser(userId: string) {
    // First get all chats
    const { data: chats, error: chatsError } = await this.supabase
      .from('chats')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (chatsError) throw chatsError;
    if (!chats || chats.length === 0) return [];

    // Extract property IDs from chats
    const propertyIds = chats
      .map(chat => chat.property_id as string)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    // Then fetch property details for all chats
    const { data: properties, error: propertiesError } = await this.supabase
      .from('properties')
      .select('id, title, location')
      .in('id', propertyIds);

    if (propertiesError) throw propertiesError;

    // Combine the data
    return chats.map(chat => {
      const propertyId = chat.property_id as string;
      return {
        ...chat,
        property: properties?.find(p => p.id === propertyId),
      };
    }) as unknown as Chat[];
  }

  async getChatMessages(chatId: string) {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select(`
        *,
        sender:user_profiles!chat_messages_sender_id_fkey(email, full_name)
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
        message: content,
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
        id,
        property_id,
        user_id,
        realtor_id,
        status,
        created_at,
        updated_at,
        properties!inner(title, location, images),
        user:user_profiles!chats_user_id_fkey(email, full_name),
        realtor:user_profiles!chats_realtor_id_fkey(email, full_name),
        chat_messages!chat_id(*)
      `)
      .or(`user_id.eq.${userId},realtor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as Chat[];
  }

  async getPropertyDetails(propertyId: string) {
    const { data, error } = await this.supabase
      .from("properties")
      .select("id, realtor_id")
      .eq("id", propertyId)
      .single();
    
    if (error) throw error;
    return data;
  }
} 