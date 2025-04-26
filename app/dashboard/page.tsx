import { Metadata } from "next";
import RoleDashboard from "@/components/dashboard/role-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Daira",
  description: "Manage your property inquiries and advice requests",
};

export default function DashboardPage() {
  return <RoleDashboard />;
}
