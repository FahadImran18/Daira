"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { ChatService } from "@/lib/services/chat-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";
import { format } from "date-fns";

interface ChatWindowProps {
  chatId: string;
  propertyTitle: string;
  onClose: () => void;
}

export default function ChatWindow({
  chatId,
  propertyTitle,
  onClose,
}: ChatWindowProps) {
  const { user } = useSupabase();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll for new messages
    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
      setIsLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await chatService.sendMessage(chatId, user.id, newMessage.trim());
      setNewMessage("");
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-background border rounded-lg shadow-lg flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Chat about {propertyTitle}</h3>
          <p className="text-sm text-muted-foreground">Property Inquiry</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[80%] ${
                    message.sender_id === user?.id
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.sender.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender_id === user?.id
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
        )}
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
