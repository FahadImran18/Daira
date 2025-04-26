import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    const { method, path } = req.url.match(/\/chat(?:\/([^/]+))?(?:\/([^/]+))?$/).slice(1, 3);
    
    // Create a new conversation
    if (req.method === "POST" && !method) {
      const { participants, title } = await req.json();
      
      // Validate input
      if (!participants || !Array.isArray(participants) || participants.length < 2) {
        throw new Error("At least two participants are required");
      }
      
      // Create a conversation
      const { data: conversation, error: conversationError } = await supabaseClient
        .from("conversations")
        .insert({ title })
        .select()
        .single();
      
      if (conversationError) throw conversationError;
      
      // Add participants
      const participantsData = participants.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }));
      
      const { error: participantsError } = await supabaseClient
        .from("conversation_participants")
        .insert(participantsData);
      
      if (participantsError) throw participantsError;
      
      return new Response(JSON.stringify(conversation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Get user conversations
    if (req.method === "GET" && !method) {
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      const { data, error } = await supabaseClient
        .from("conversations")
        .select(`
          *,
          conversation_participants!inner (user_id),
          conversation_participants:conversation_participants (
            user_id,
            user_profiles:user_id (email, full_name, role)
          )
        `)
        .eq("conversation_participants.user_id", userId)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Get conversation messages
    if (req.method === "GET" && method === "messages" && path) {
      const conversationId = path;
      
      const { data, error } = await supabaseClient
        .from("messages")
        .select(`
          *,
          sender:sender_id (email, full_name, role)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Send a message
    if (req.method === "POST" && method === "messages") {
      const { conversationId, content } = await req.json();
      
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError) throw authError;
      
      const senderId = authData.user.id;
      
      const { data, error } = await supabaseClient
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content
        })
        .select(`
          *,
          sender:sender_id (email, full_name, role)
        `)
        .single();
      
      if (error) throw error;
      
      // Update conversation timestamp
      await supabaseClient
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Mark messages as read
    if (req.method === "POST" && method === "read") {
      const { conversationId } = await req.json();
      
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      const { error } = await supabaseClient
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});