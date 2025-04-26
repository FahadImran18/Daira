"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from '@/lib/supabase/provider';
import { Users, Building, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useSupabase();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingApprovals: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      
      // Fetch total users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Fetch active listings
      const { data: listingsData } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'approved');

      // Fetch pending approvals
      const { data: pendingData } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      setStats({
        totalUsers: usersData?.length || 0,
        activeListings: listingsData?.length || 0,
        pendingApprovals: pendingData?.length || 0,
        totalRevenue: 2500000 // Placeholder
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (PKR)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management and Property Approval sections will be added here */}
    </div>
  );
}