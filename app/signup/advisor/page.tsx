"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function AdvisorSignupPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    city: "",
    area: "",
    expertise: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Starting advisor signup process...");
      console.log("Form data:", formData);

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error("Stripe publishable key is missing");
        throw new Error("Stripe key not configured");
      }

      // 1. Create user account
      console.log("Creating user account...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: "advisor",
            name: formData.name,
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      console.log("User account created:", authData.user?.id);

      // 2. Create advisor profile in the database
      console.log("Creating advisor profile...");
      const { error: profileError } = await supabase
        .from("advisor_profiles")
        .insert({
          user_id: authData.user?.id,
          name: formData.name,
          city: formData.city,
          area: formData.area,
          expertise: formData.expertise,
          bio: formData.bio,
          payment_status: "pending",
          is_active: false,
        });

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }
      console.log("Advisor profile created");

      // 3. Create Stripe checkout session
      console.log("Creating Stripe session...");
      const response = await fetch("/api/stripe/create-advisor-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authData.user?.id,
          email: formData.email,
        }),
      });

      console.log("Stripe session response status:", response.status);
      const responseData = await response.json();
      console.log("Stripe session response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.error || "Failed to create payment session"
        );
      }

      const { url: stripeUrl } = responseData;
      if (!stripeUrl) {
        throw new Error("No checkout URL returned from payment service");
      }
      console.log("Got Stripe URL:", stripeUrl);

      // Redirect directly to Stripe checkout URL
      window.location.href = stripeUrl;
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to sign up. Please try again.");
      toast.error(error.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Sign up as an Advisor</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area of Interest</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                placeholder="e.g., Downtown, West End"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise</Label>
              <Select
                value={formData.expertise}
                onValueChange={(value) =>
                  setFormData({ ...formData, expertise: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about your experience and expertise..."
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : "Sign Up & Pay $20 Registration Fee"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
