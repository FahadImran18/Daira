"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { ChatService } from "@/lib/services/chat-service";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ChatButtonProps {
  propertyId: string;
  realtorId: string;
  propertyTitle: string;
}

export default function ChatButton({
  propertyId,
  realtorId,
  propertyTitle,
}: ChatButtonProps) {
  const { user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const chatService = new ChatService();

  const handleStartChat = async () => {
    if (!user) {
      toast.error("Please sign in to chat with the realtor", {
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/login"),
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      const chat = await chatService.getOrCreateChat(
        propertyId,
        user.id,
        realtorId
      );

      toast.success("Chat started", {
        description: "You can now chat with the realtor about this property",
      });

      // Dispatch a custom event to open the chat sidebar
      const event = new CustomEvent("openChat", {
        detail: {
          chatId: chat.id,
          propertyTitle,
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStartChat} disabled={isLoading} className="w-full">
      <MessageSquare className="mr-2 h-4 w-4" />
      {isLoading ? "Starting chat..." : "Chat with Realtor"}
    </Button>
  );
}
