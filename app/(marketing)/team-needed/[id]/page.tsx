import { createClient } from "@/lib/supabase/server";
import { Metadata, ResolvingMetadata } from "next";
import TeamDetailClient from "./team-detail-client";
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

  const { data: post } = await supabase
    .from('posts')
    .select(`*, profiles!user_id (full_name)`)
    .eq('id', id)
    .single();

  if (!post) {
    return {
      title: "Team Request Not Found",
    };
  }

  const contentLines = post.content.split('\n');
  const roleName = contentLines[0]?.replace('ROLE NEEDED: ', '') || 'Developer';
  const project = contentLines[1]?.replace('PROJECT: ', '') || 'New Initiative';
  const description = contentLines.slice(2).join(' ').substring(0, 160);

  return {
    title: `${roleName} Needed for ${project}`,
    description: description || `Apply to join the team for ${project} on the Bhutan Developer Network.`,
    openGraph: {
      title: `${roleName} for ${project}`,
      description: description,
      url: `https://www.bhutandevelopersconnect.xyz/team-needed/${id}`,
    },
    alternates: {
      canonical: `/team-needed/${id}`,
    },
  };
}

export default async function TeamPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user || null;

  // Fetch the post
  const { data, error } = await supabase
    .from('posts')
    .select(`*, profiles!user_id (full_name, avatar_url, role, email)`)
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Parse content
  const contentLines = data.content.split('\n');
  const roleName = contentLines[0]?.replace('ROLE NEEDED: ', '') || 'Developer';
  const project = contentLines[1]?.replace('PROJECT: ', '') || 'New Initiative';
  const mission = contentLines.slice(2).map((line: string) => line.replace('MISSION: ', '')).join('\n');

  const post = {
    ...data,
    roleName,
    project,
    mission,
    authorName: data.profiles?.full_name || 'Anonymous',
    authorAvatar: data.profiles?.avatar_url,
    authorRole: data.profiles?.role || '',
  };

  // Check ownership and application status
  let isOwnPost = false;
  let isApplied = false;

  if (user) {
    isOwnPost = user.id === data.user_id;
    const { data: appData } = await supabase
      .from('applications')
      .select('id')
      .eq('post_id', id)
      .eq('applicant_id', user.id)
      .limit(1);

    if (appData && appData.length > 0) {
      isApplied = true;
    }
  }

  return (
    <TeamDetailClient 
      id={id} 
      initialPost={post} 
      initialUser={user} 
      initialIsApplied={isApplied} 
      initialIsOwnPost={isOwnPost} 
    />
  );
}
