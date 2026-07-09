import { createClient } from "@/lib/supabase/server";
import { Metadata, ResolvingMetadata } from "next";
import ProfileDetailClient from "./profile-detail-client";
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    return {
      title: "Profile Not Found",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${profile.full_name} | Developer Profile`,
    description: profile.bio || `View ${profile.full_name}'s professional profile on the Bhutan Developer Network.`,
    openGraph: {
      title: `${profile.full_name} - ${profile.role}`,
      description: profile.bio,
      url: `https://www.bhutandevelopersconnect.xyz/profile/${id}`,
      images: [profile.avatar_url, ...previousImages].filter(Boolean),
    },
    alternates: {
      canonical: `/profile/${id}`,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    notFound();
  }

  return <ProfileDetailClient initialProfile={profile} />;
}
