import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties | Daira",
  description: "Browse our collection of properties",
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
