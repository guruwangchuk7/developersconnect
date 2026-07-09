import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Bhutan Developer Network and help us architect the future of Bhutan's technical ecosystem. Explore open technical roles in engineering, design, and analysis.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
