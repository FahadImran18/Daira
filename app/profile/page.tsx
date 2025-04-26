import { Metadata } from "next";
import ProfileForm from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Profile | Daira",
  description: "Manage your profile information",
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  );
}
