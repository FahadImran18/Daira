"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { UserService } from "@/lib/services/user-service";

export default function LoginForm() {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userService = new UserService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user role
        const role = await userService.getUserRole(data.user.id);

        toast({
          title: "Welcome back",
          description: "You have successfully signed in.",
        });

        // Redirect to the appropriate dashboard based on role
        const redirectTo = searchParams.get("redirectTo") || "/";

        if (redirectTo === "/" || redirectTo === "/properties") {
          router.push(redirectTo);
        } else if (role === "realtor") {
          router.push("/realtor/dashboard");
        } else if (role === "advisor") {
          router.push("/advisor/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
