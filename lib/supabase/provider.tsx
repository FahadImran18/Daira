"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "@/lib/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserService } from "@/lib/services/user-service";

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  supabase: SupabaseClient;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  userRole: UserRole | null;
}

const supabase = createClient();

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  supabase,
  signUp: async () => {},
  signIn: async () => {},
  userRole: null,
});

export const useSupabase = () => useContext(SupabaseContext);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const userService = new UserService();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          try {
            const role = await userService.getUserRole(session.user.id);
            setUserRole(role);
          } catch (error) {
            console.error("Error fetching user role:", error);
            // Don't clear the user if we can't get the role
            // The role will be fetched again on the next request
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
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
        setUserRole(role as UserRole);
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

      // Set user role
      const role = userData?.role as UserRole;
      setUserRole(role);

      // Redirect based on role
      let redirectPath = "/dashboard";
      if (role === "realtor") {
        redirectPath = "/realtor/dashboard";
      } else if (role === "advisor") {
        redirectPath = "/advisor/dashboard";
      } else if (role === "customer") {
        redirectPath = "/dashboard";
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
      value={{ user, loading, signOut, supabase, signUp, signIn, userRole }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
