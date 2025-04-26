"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { ChatService } from "@/lib/services/chat-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  X,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { Chat, ChatMessage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ChatSidebar() {
  const { user, userRole } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();
  const [showChat, setShowChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load chats on component mount
  useEffect(() => {
    if (user) {
      console.log("User logged in, loading chats for role:", userRole);
      loadChats();
    }
  }, [user, userRole]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const supabase = chatService.getSupabaseClient();
    console.log(
      "Setting up real-time subscription for user:",
      user.id,
      "role:",
      userRole
    );

    // Subscribe to new messages for all chats
    const messagesSubscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          console.log("New message received:", payload);

          // If the message is for the currently selected chat, add it to the messages
          if (selectedChat && payload.new.chat_id === selectedChat.id) {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
            scrollToBottom();
          } else {
            // Otherwise, increment unread count and show notification
            setUnreadCount((prev) => prev + 1);

            // Show notification for realtors
            if (userRole === "realtor") {
              toast.info("New message received", {
                description: "You have a new message from a potential client",
                action: {
                  label: "View",
                  onClick: () => setIsOpen(true),
                },
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from real-time updates");
      messagesSubscription.unsubscribe();
    };
  }, [user, selectedChat, userRole]);

  // Listen for the openChat custom event
  useEffect(() => {
    const handleOpenChat = (event: CustomEvent) => {
      const { chatId, propertyTitle } = event.detail;
      console.log("OpenChat event received:", chatId, propertyTitle);

      // Find the chat in the list
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        console.log("Chat found in list, opening:", chat);
        setSelectedChat(chat);
        setIsOpen(true);
        setShowChat(true);
      } else {
        // If the chat is not in the list yet, reload chats
        console.log("Chat not found in list, reloading chats");
        loadChats().then(() => {
          const updatedChat = chats.find((c) => c.id === chatId);
          if (updatedChat) {
            console.log("Chat found after reload, opening:", updatedChat);
            setSelectedChat(updatedChat);
            setIsOpen(true);
            setShowChat(true);
          } else {
            console.log("Chat still not found after reload");
          }
        });
      }
    };

    window.addEventListener("openChat", handleOpenChat as EventListener);
    return () => {
      window.removeEventListener("openChat", handleOpenChat as EventListener);
    };
  }, [chats]);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      console.log(
        "Selected chat changed, loading messages for:",
        selectedChat.id
      );
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      console.log("Loading chats for user:", user!.id, "role:", userRole);

      let userChats: Chat[] = [];

      if (userRole === "realtor") {
        console.log("Loading chats for realtor");
        userChats = await chatService.getChatsByRealtor(user!.id);
      } else {
        console.log("Loading chats for user");
        userChats = await chatService.getChatsByUser(user!.id);
      }

      console.log("Loaded chats:", userChats);
      setChats(userChats);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
      setIsLoading(false);
      toast.error("Failed to load chats. Please try again.");
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      console.log("Loading messages for chat:", chatId);
      const chatMessages = await chatService.getChatMessages(chatId);
      console.log("Loaded messages:", chatMessages);
      setMessages(chatMessages);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages. Please try again.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedChat || isSending) return;

    try {
      setIsSending(true);
      console.log("Sending message:", newMessage);

      // Send the message
      const sentMessage = await chatService.sendMessage(
        selectedChat.id,
        user.id,
        newMessage.trim()
      );

      console.log("Message sent successfully:", sentMessage);

      // Add the message to the UI immediately
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const startChat = async (propertyId: string) => {
    if (!user) return;

    try {
      console.log("Starting chat for property:", propertyId);

      // Get the property details to find the realtor
      const property = await chatService.getPropertyDetails(propertyId);
      console.log("Property details:", property);

      if (!property || !property.realtor_id) {
        throw new Error("Property or realtor not found");
      }

      // Use the ChatService to get or create a chat
      const chat = await chatService.getOrCreateChat(
        propertyId,
        user.id,
        property.realtor_id as string
      );
      console.log("Chat created/found:", chat);

      // Fetch messages for this chat
      const messages = await chatService.getChatMessages(chat.id);
      console.log("Messages for chat:", messages);

      // Format the chat data
      const formattedChat = {
        ...chat,
        messages: messages || [],
      };

      console.log("Setting chat data:", formattedChat);

      // Set the chat and ensure UI is visible
      setSelectedChat(formattedChat);
      setIsOpen(true);
      setShowChat(true);

      // Force a re-render of the chat list
      loadChats();
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  // Add a useEffect to handle chat visibility
  useEffect(() => {
    if (selectedChat) {
      console.log("Selected chat changed, updating UI state");
      setIsOpen(true);
      setShowChat(true);
    }
  }, [selectedChat]);

  if (!user) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-screen flex flex-col transition-all duration-300 ${
        isOpen ? "w-96" : "w-12"
      }`}
    >
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="flex-1 bg-background border-l shadow-lg flex flex-col h-full">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Messages</h3>
            <p className="text-sm text-muted-foreground">
              {userRole === "realtor"
                ? "Chat with potential clients"
                : "Chat with realtors"}
            </p>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Chat list */}
            <div className="w-1/3 border-r">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading chats...</p>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No chats yet</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-3 rounded-md cursor-pointer hover:bg-muted ${
                          selectedChat?.id === chat.id ? "bg-muted" : ""
                        }`}
                        onClick={() => {
                          console.log("Chat selected:", chat);
                          setSelectedChat(chat);
                          setIsOpen(true);
                          setShowChat(true);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {userRole === "realtor"
                                ? chat.user?.email
                                    ?.substring(0, 2)
                                    .toUpperCase()
                                : chat.realtor?.email
                                    ?.substring(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {chat.property?.title || "Property Chat"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {userRole === "realtor"
                                ? chat.user?.email
                                : chat.realtor?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat messages */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">
                      {selectedChat.property?.title || "Property Chat"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userRole === "realtor"
                        ? `Chat with ${selectedChat.user?.email}`
                        : `Chat with ${selectedChat.realtor?.email}`}
                    </p>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-end space-x-2 max-w-[80%] ${
                              message.sender_id === user.id
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.sender_id === user.id
                                  ? user.email?.substring(0, 2).toUpperCase()
                                  : userRole === "realtor"
                                  ? selectedChat.user?.email
                                      ?.substring(0, 2)
                                      .toUpperCase()
                                  : selectedChat.realtor?.email
                                      ?.substring(0, 2)
                                      .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`rounded-lg p-3 ${
                                message.sender_id === user.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {format(new Date(message.created_at), "HH:mm")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={isSending}
                      />
                      <Button type="submit" size="icon" disabled={isSending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select a chat to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
