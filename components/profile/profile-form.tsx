"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { UserService } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfileForm() {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const userService = new UserService();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const userProfile = await userService.getUserProfile(user.id);
        setProfile({
          full_name: userProfile.full_name || "",
          phone: userProfile.phone || "",
          avatar_url: userProfile.avatar_url || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await userService.updateUserProfile(user.id, profile);
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information and how others see you on the
          platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile.phone || ""}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={profile.avatar_url || ""}
              onChange={(e) =>
                setProfile({ ...profile, avatar_url: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
