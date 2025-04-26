"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { AdviceService } from "@/lib/services/advice-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AdviceRequestFormProps {
  propertyId: string;
  onSuccess?: () => void;
}

export default function AdviceRequestForm({
  propertyId,
  onSuccess,
}: AdviceRequestFormProps) {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [advisors, setAdvisors] = useState<any[]>([]);
  const adviceService = new AdviceService();

  const loadAdvisors = async () => {
    try {
      const advisorsList = await adviceService.getAdvisors();
      setAdvisors(advisorsList);
    } catch (error) {
      console.error("Error loading advisors:", error);
      toast({
        title: "Error",
        description: "Failed to load advisors. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAdvisor || !question.trim()) return;

    setIsLoading(true);
    try {
      await adviceService.createAdviceRequest({
        user_id: user.id,
        advisor_id: selectedAdvisor,
        property_id: propertyId,
        question: question.trim(),
      });

      toast({
        title: "Success",
        description: "Your advice request has been sent.",
      });

      setQuestion("");
      setSelectedAdvisor("");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating advice request:", error);
      toast({
        title: "Error",
        description: "Failed to send advice request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Advisor</label>
        <Select
          value={selectedAdvisor}
          onValueChange={setSelectedAdvisor}
          onOpenChange={(open) => open && loadAdvisors()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose an advisor" />
          </SelectTrigger>
          <SelectContent>
            {advisors.map((advisor) => (
              <SelectItem key={advisor.id} value={advisor.id}>
                {advisor.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Question</label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to know about this property?"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Request Advice"}
      </Button>
    </form>
  );
}
