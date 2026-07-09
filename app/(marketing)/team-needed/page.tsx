import { createClient } from "@/lib/supabase/server";
import { TeamNeededClient } from "./team-needed-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Formation | Bhutan Developer Connect",
  description: "Find technical partners and collaborators for your next project in Bhutan.",
};

export const revalidate = 3600;

export default async function TeamNeededPage() {
  const supabase = await createClient();

  const { data: initialPosts } = await supabase
    .from('posts')
    .select(`*, profiles!user_id (full_name)`)
    .eq('type', 'TEAM')
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: { session } } = await supabase.auth.getSession();
  
  let initialApplications: any[] = [];
  if (session?.user) {
    const { data } = await supabase
      .from('applications')
      .select('post_id')
      .eq('applicant_id', session.user.id);
    if (data) initialApplications = data;
  }

  const processedTeams = (initialPosts || []).map((p: any) => {
    const contentLines = p.content.split('\n');
    const role = contentLines[0]?.replace('ROLE NEEDED: ', '') || 'Developer';
    const project = contentLines[1]?.replace('PROJECT: ', '') || 'New Initiative';
    const mission = contentLines[2]?.replace('MISSION: ', '') || p.content;
    
    return {
      id: p.id,
      userId: p.user_id,
      role,
      project,
      mission,
      author: p.profiles?.full_name || 'Anonymous',
      created_at: p.created_at,
      tags: p.tags || []
    };
  });

  return (
    <TeamNeededClient 
      initialTeams={processedTeams}
      initialUser={session?.user || null}
      initialApplications={initialApplications}
    />
  );
}
