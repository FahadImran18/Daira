"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Session, User, SupabaseClient } from "@supabase/supabase-js";

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const supabase = createClient();

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  supabase,
  signUp: async () => {},
  signIn: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const signUp = async (email: string, password: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created successfully");
        router.push("/auth/verification");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user role
      const { data: userData, error: roleError } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", authData.user?.id)
        .single();

      if (roleError) throw roleError;

      // Redirect based on role
      const role = userData?.role;
      let redirectPath = "/dashboard";
      if (role === "realtor") {
        redirectPath = "/dashboard/realtor";
      } else if (role === "advisor") {
        redirectPath = "/dashboard/advisor";
      } else if (role === "customer") {
        redirectPath = "/dashboard/customer";
      }

      toast.success("Signed in successfully");
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  return (
    <SupabaseContext.Provider
      value={{ user, loading, signOut, supabase, signUp, signIn }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
