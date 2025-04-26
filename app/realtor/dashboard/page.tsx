import { Metadata } from "next";
import RoleDashboard from "@/components/dashboard/role-dashboard";

export const metadata: Metadata = {
  title: "Realtor Dashboard | Daira",
  description: "Manage your property listings and inquiries",
};

export default function RealtorDashboardPage() {
  return <RoleDashboard />;
}
