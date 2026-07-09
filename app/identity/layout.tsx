import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default function IdentityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
