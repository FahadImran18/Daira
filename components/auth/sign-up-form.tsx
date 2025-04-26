"use client";

import { useState } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { UserService } from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const userService = new UserService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create a user profile with the selected role
        await userService.createUserProfile(
          authData.user.id,
          email,
          role,
          fullName
        );

        toast.success("Account created successfully");

        // Redirect to the appropriate dashboard based on role
        if (role === "realtor") {
          router.push("/realtor/dashboard");
        } else if (role === "advisor") {
          router.push("/advisor/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(
        error.message || "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
        />
      </div>

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

      <div className="space-y-2">
        <label className="text-sm font-medium">I am a</label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">Property Seeker</SelectItem>
            <SelectItem value="realtor">Realtor</SelectItem>
            <SelectItem value="advisor">Property Advisor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
