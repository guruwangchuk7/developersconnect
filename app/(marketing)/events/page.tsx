import { createClient } from "@/lib/supabase/server";
import { EventsClient } from "./events-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Events | Bhutan Developer Connect",
  description: "Join workshops, hackathons, and meetups in the Bhutanese tech ecosystem.",
};

export const revalidate = 3600;

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: initialEvents } = await supabase
    .from('events')
    .select(`*, profiles!organizer_id (full_name)`)
    .order('event_date', { ascending: true })
    .limit(10);

  const processedEvents = (initialEvents || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.venue,
    date: new Date(e.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    rawDate: e.event_date,
    organizerName: e.profiles?.full_name || 'Anonymous',
    type: "Community Event",
    attendees: 0,
    prize: null,
    featured: false,
    image_url: e.image_url
  }));

  return <EventsClient initialEvents={processedEvents} />;
}
// Hot-reload trigger page.tsx
