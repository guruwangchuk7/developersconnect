import { Metadata, ResolvingMetadata } from "next";
import CareerDetailClient from "./career-detail-client";
import { notFound } from "next/navigation";
import { Palette, Terminal, Shield, BarChart3 } from "lucide-react";
import * as React from "react";

// Full role data with detailed descriptions (Same as in client but for server-side metadata)
const rolesData: Record<string, any> = {
  "frontend-designer": {
    title: "Frontend Designer",
    shortDescription: "Craft pixel-perfect, high-fidelity user experiences and interactive interfaces for the next generation of our platform.",
    icon: <Palette className="h-6 w-6" />,
    availability: "1 Open Slot",
    location: "Remote / Bhutan",
    type: "Contract / Full-time",
    about: ["..."],
    responsibilities: ["..."],
    requirements: ["..."],
    niceToHave: ["..."],
    tags: ["React", "Tailwind", "Figma", "UI/UX"],
  },
  "backend-developer": {
    title: "Backend Developer",
    shortDescription: "Architect scalable server-side systems, manage database synchronization protocols, and optimize high-performance APIs.",
    icon: <Terminal className="h-6 w-6" />,
    availability: "1 Open Slot",
    location: "Remote / Bhutan",
    type: "Contract / Full-time",
    about: ["..."],
    responsibilities: ["..."],
    requirements: ["..."],
    niceToHave: ["..."],
    tags: ["Node.js", "PostgreSQL", "Edge Functions", "Security"],
  },
  "security-engineer": {
    title: "Security Engineer",
    shortDescription: "Harden our technical node ecosystem, implement advanced encryption protocols, and ensure absolute data integrity.",
    icon: <Shield className="h-6 w-6" />,
    availability: "1 Open Slot",
    location: "Remote / Bhutan",
    type: "Contract / Full-time",
    about: ["..."],
    responsibilities: ["..."],
    requirements: ["..."],
    niceToHave: ["..."],
    tags: ["Cybersecurity", "Protocols", "Authentication", "Auditing"],
  },
  "business-analyst": {
    title: "Business Analyst",
    shortDescription: "Translate complex system metrics into actionable technical roadmaps and bridge the gap between engineering and growth.",
    icon: <BarChart3 className="h-6 w-6" />,
    availability: "1 Open Slot",
    location: "Remote / Bhutan",
    type: "Contract / Full-time",
    about: ["..."],
    responsibilities: ["..."],
    requirements: ["..."],
    niceToHave: ["..."],
    tags: ["Strategy", "Data Analysis", "Roadmapping", "Tech Specs"],
  }
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const role = rolesData[slug];

  if (!role) {
    return {
      title: "Role Not Found",
    };
  }

  return {
    title: `${role.title} | Careers`,
    description: role.shortDescription,
    openGraph: {
      title: role.title,
      description: role.shortDescription,
      url: `https://www.bhutandevelopersconnect.xyz/careers/${slug}`,
    },
    alternates: {
      canonical: `/careers/${slug}`,
    },
  };
}

export default async function CareerPage({ params }: Props) {
  const { slug } = await params;
  const role = rolesData[slug];

  if (!role) {
    notFound();
  }

  // Note: We're passing the full role data from server to client to avoid duplicate data structures
  // although in this specific case, the client still has its own rolesData.
  // We'll keep the client's data structure for now to avoid breaking the complex UI.
  
  return <CareerDetailClient slug={slug} role={role} />;
}
