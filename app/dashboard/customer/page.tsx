"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/lib/supabase/provider";
import { Building, Heart, MessageSquare, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CustomerDashboard() {
  const { user } = useSupabase();
  const [stats, setStats] = useState({
    viewedProperties: 0,
    savedProperties: 0,
    inquiries: 0,
    recommendations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      const supabase = createClient();

      // Fetch viewed properties
      const { data: viewedData } = await supabase
        .from("property_views")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      // Fetch saved properties
      const { data: savedData } = await supabase
        .from("property_favorites")
        .select("*", { count: "exact" })
        .eq("user_id", user.id);

      // Fetch inquiries
      const { data: inquiriesData } = await supabase
        .from("messages")
        .select("conversation_id", { count: "exact" })
        .eq("sender_id", user.id);

      setStats({
        viewedProperties: viewedData?.length || 0,
        savedProperties: savedData?.length || 0,
        inquiries: inquiriesData?.length || 0,
        recommendations: 5, // Placeholder for AI recommendations
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Customer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Viewed Properties
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viewedProperties}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Saved Properties
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savedProperties}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Inquiries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inquiries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recommendations
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recommendations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Recommendations sections will be added here */}
    </div>
  );
}
