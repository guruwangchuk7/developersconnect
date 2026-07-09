import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "./projects-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "National Project Repository | Bhutan Developer Connect",
  description: "Discover open-source tools and collaborative projects built in Bhutan.",
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: initialProjects } = await supabase
    .from('posts')
    .select(`*, profiles!user_id (full_name)`)
    .eq('type', 'PROJECT')
    .order('created_at', { ascending: false })
    .limit(20);

  const processedProjects = (initialProjects || []).map((p: any) => ({
    id: p.id,
    title: p.content.split('\n')[0].replace('PROJECT: ', ''),
    description: p.content.split('\n')[1]?.replace('DESCRIPTION: ', '') || p.content,
    tags: p.tags || [],
    contributors: 1,
    status: "Live",
    author: p.profiles?.full_name || 'Anonymous'
  }));

  return <ProjectsClient initialProjects={processedProjects} />;
}
