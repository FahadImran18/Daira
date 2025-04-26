import { useState, useEffect } from "react";
import { UserService } from "@/lib/services/user-service";
import { UserProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const userService = new UserService();
const supabase = createClient();

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get the current user's ID from Supabase auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUser(null);
          return;
        }
        
        const userProfile = await userService.getUserProfile(authUser.id);
        setUser(userProfile);
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading };
} 