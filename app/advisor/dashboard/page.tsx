import { Metadata } from "next";
import RoleDashboard from "@/components/dashboard/role-dashboard";

export const metadata: Metadata = {
  title: "Advisor Dashboard | Daira",
  description: "Manage property advice requests",
};

export default function AdvisorDashboardPage() {
  return <RoleDashboard />;
}
