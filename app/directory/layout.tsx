import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Directory",
  description: "Browse the verified talent layer of the Bhutanese tech ecosystem. Connect with expert developers, engineers, and designers in Bhutan.",
  alternates: {
    canonical: "/directory",
  },
  openGraph: {
    title: "Verified Developer Directory | Bhutan Developer Network",
    description: "Discover and connect with top tech talent in Bhutan. The official directory for verified software engineers and designers.",
  },
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
