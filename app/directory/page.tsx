import { createClient } from "@/lib/supabase/server";
import { DirectoryClient } from "./directory-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Directory | Bhutan Developer Connect",
  description: "Browse verified developers and technical experts in Bhutan's tech ecosystem.",
};

// Ensure this page is dynamically rendered or revalidated to get fresh profiles
export const revalidate = 3600; // Cache for 1 hour

export default async function DirectoryPage() {
  const supabase = await createClient();

  // Fetch initial profiles on the server for SEO and faster FCP
  const { data: initialProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20);

  // Get current session for connection status (optional, but good for SSR)
  const { data: { session } } = await supabase.auth.getSession();
  
  let initialConnections: any[] = [];
  if (session?.user) {
    const { data: connData } = await supabase
      .from('connections')
      .select('*')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);
    if (connData) initialConnections = connData;
  }

  return (
    <DirectoryClient 
      initialProfiles={initialProfiles || []} 
      initialSession={session}
      initialConnections={initialConnections}
    />
  );
}
