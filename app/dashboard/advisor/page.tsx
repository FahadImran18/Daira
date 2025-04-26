"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from '@/lib/supabase/provider';
import { Users, MessageSquare, TrendingUp, Star } from 'lucide-react';

export default function AdvisorDashboard() {
  const { user } = useSupabase();
  const [stats, setStats] = useState({
    activeClients: 0,
    consultations: 0,
    satisfaction: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      
      // Fetch active clients
      const { data: clientsData } = await supabase
        .from('advisor_clients')
        .select('*', { count: 'exact' })
        .eq('advisor_id', user?.id)
        .eq('status', 'active');

      // Fetch consultations
      const { data: consultationsData } = await supabase
        .from('consultations')
        .select('*', { count: 'exact' })
        .eq('advisor_id', user?.id);

      setStats({
        activeClients: clientsData?.length || 0,
        consultations: consultationsData?.length || 0,
        satisfaction: 4.8, // Placeholder
        revenue: 150000 // Placeholder
      });
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Advisor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.consultations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfaction}/5.0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue (PKR)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client List and Consultation Schedule sections will be added here */}
    </div>
  );
}