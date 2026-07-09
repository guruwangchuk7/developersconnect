import { createClient } from "@/lib/supabase/server";
import { Metadata, ResolvingMetadata } from "next";
import ProjectDetailClient from "./project-detail-client";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('posts')
    .select(`*, profiles!user_id (full_name)`)
    .eq('id', id)
    .single();

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const contentLines = project.content?.split('\n') || [];
  const title = contentLines[0]?.replace('PROJECT: ', '') || 'Untitled Project';
  const description = contentLines[1]?.replace('DESCRIPTION: ', '') || 'View this project on the Bhutan Developer Network.';

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${title} | Projects`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://www.bhutandevelopersconnect.xyz/projects/${id}`,
      type: "article",
      images: previousImages,
    },
    alternates: {
      canonical: `/projects/${id}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from('posts')
    .select(`*, profiles!user_id (full_name, avatar_url, role)`)
    .eq('id', id)
    .single();

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient id={id} initialProject={project} />;
}
