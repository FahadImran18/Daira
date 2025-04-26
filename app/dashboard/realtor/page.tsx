"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from '@/lib/supabase/provider';
import { Building, Users, TrendingUp, MessageSquare } from 'lucide-react';

export default function RealtorDashboard() {
  const { user } = useSupabase();
  const [stats, setStats] = useState({
    activeListings: 0,
    totalViews: 0,
    inquiries: 0,
    interestedBuyers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      
      // Fetch active listings
      const { data: listingsData } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('owner_id', user?.id)
        .eq('status', 'approved');

      // Fetch total views
      const { data: viewsData } = await supabase
        .from('property_views')
        .select('property_id')
        .in('property_id', listingsData?.map(l => l.id) || []);

      // Fetch inquiries
      const { data: inquiriesData } = await supabase
        .from('messages')
        .select('conversation_id', { count: 'exact', distinct: true })
        .eq('sender_id', user?.id);

      setStats({
        activeListings: listingsData?.length || 0,
        totalViews: viewsData?.length || 0,
        inquiries: inquiriesData?.length || 0,
        interestedBuyers: Math.floor((viewsData?.length || 0) * 0.3) // Placeholder calculation
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Realtor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inquiries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interested Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interestedBuyers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Property Listings and Client Inquiries sections will be added here */}
    </div>
  );
}