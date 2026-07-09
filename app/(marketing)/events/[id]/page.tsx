import { createClient } from "@/lib/supabase/server";
import { Metadata, ResolvingMetadata } from "next";
import EventDetailClient from "./event-detail-client";
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

  const { data: event } = await supabase
    .from('events')
    .select(`*, profiles!organizer_id (full_name)`)
    .eq('id', id)
    .single();

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${event.title} | Community Events`,
    description: event.description?.substring(0, 160) || "Join this community event on the Bhutan Developer Network.",
    openGraph: {
      title: event.title,
      description: event.description?.substring(0, 160),
      url: `https://www.bhutandevelopersconnect.xyz/events/${id}`,
      images: [event.image_url, ...previousImages].filter(Boolean),
    },
    alternates: {
      canonical: `/events/${id}`,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select(`*, profiles!organizer_id (full_name, avatar_url, role)`)
    .eq('id', id)
    .single();

  if (!event) {
    notFound();
  }

  return <EventDetailClient id={id} initialEvent={event} />;
}
