"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { Globe, Briefcase, MapPin, Search, LinkIcon, Award, UserPlus, Check, Clock } from "lucide-react"
import { Github } from "@/components/icons"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Session } from "@supabase/supabase-js"
import { toast } from "sonner"


interface DirectoryClientProps {
  initialProfiles: any[];
  initialSession: Session | null;
  initialConnections: any[];
}

export function DirectoryClient({ initialProfiles, initialSession, initialConnections }: DirectoryClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [profiles, setProfiles] = React.useState<any[]>(initialProfiles)
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [session, setSession] = React.useState<Session | null>(initialSession)
  const [myConnections, setMyConnections] = React.useState<any[]>(initialConnections)
  const [processingId, setProcessingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Only fetch if session changed or to refresh data
    async function sync() {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)

      if (currentSession) {
        const { data: connData } = await supabase
          .from('connections')
          .select('*')
          .or(`sender_id.eq.${currentSession.user.id},receiver_id.eq.${currentSession.user.id}`)

        if (connData) {
          setMyConnections(connData)
        }
      }
    }
    sync()
  }, [supabase])

  const handleConnect = async (targetId: string) => {
    if (!session) {
      router.push('/join')
      return
    }

    if (session.user.id === targetId) return


    setProcessingId(targetId)
    const { error } = await supabase
      .from('connections')
      .insert([
        {
          sender_id: session.user.id,
          receiver_id: targetId,
          status: 'PENDING'
        }
      ])

    if (!error) {
      // Create Notification for receiver
      await supabase.from('notifications').insert([{
        user_id: targetId,
        type: 'CONNECTION',
        actor_id: session.user.id,
        content: `${session.user.user_metadata?.full_name || 'A developer'} wants to connect with you.`,
        link: '/directory'
      }])

      const { data: connData } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      if (connData) setMyConnections(connData)
      toast.success("Connection request sent!")
    } else {
      toast.error("Failed to send request")
    }
    setProcessingId(null)
  }

  const handleCancelConnection = async (targetId: string) => {
    if (!session) return

    setProcessingId(targetId)
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('status', 'PENDING')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${session.user.id})`)

    if (!error) {
      // Remove notification if still unread
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', targetId)
        .eq('actor_id', session.user.id)
        .eq('type', 'CONNECTION')

      // Refresh connections
      const { data: connData } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      if (connData) setMyConnections(connData)
      toast.success("Request rescinded")
    }
    setProcessingId(null)
  }

  const getConnectionStatus = (profileId: string) => {
    if (!session) return null
    if (session.user.id === profileId) return 'SELF'

    const conn = myConnections.find(c =>
      (c.sender_id === session.user.id && c.receiver_id === profileId) ||
      (c.sender_id === profileId && c.receiver_id === session.user.id)
    )

    if (!conn) return null
    return conn.status // 'PENDING', 'ACCEPTED', 'REJECTED'
  }

  const filteredProfiles = profiles.filter(p => !session || p.id !== session.user.id).filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.skills?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <GlobalHeader />

      <main className="flex-1 container mx-auto py-12 md:py-24 px-4 md:px-6">
        <div className="flex flex-col gap-16 md:gap-24">
          {/* Header & Filter */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter">Developer Directory</h1>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed md:text-lg">
                The verified talent layer of the Bhutanese tech ecosystem. Find collaborators for your next project.
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, role, or skill..."
                className="w-full bg-transparent border-b border-border/80 pl-10 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-medium tracking-tight"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-secondary/20 animate-pulse rounded-sm border border-border/40"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((p) => (
                <div key={p.id} className="bg-background p-8 md:p-12 flex flex-col hover:bg-secondary/10 transition-colors group relative overflow-hidden" style={{ minHeight: '420px' }}>
                  {/* Row 1: Avatar + Badge — fixed height */}
                  <div className="flex items-start justify-between relative z-10 mb-8">
                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-full bg-secondary italic font-black text-muted-foreground/40 text-lg border border-border/50 group-hover:scale-110 transition-transform overflow-hidden shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.full_name} className="h-full w-full object-cover" />
                      ) : (
                        p.full_name?.split(' ').map((n: string) => n[0]).join('')
                      )}
                    </div>
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm shrink-0",
                      p.availability === "Open to work"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-secondary text-muted-foreground border-border/60"
                    )}>
                      {p.availability || "Available"}
                    </span>
                  </div>

                  {/* Row 2: Name + Role — fixed height */}
                  <div className="relative z-10 mb-4" style={{ minHeight: '52px' }}>
                    <h3 className="text-2xl font-bold tracking-tight">{p.full_name}</h3>
                    <div className="text-primary/60 text-[11px] font-bold uppercase tracking-[0.2em] mt-1 min-h-[1rem]">
                      {p.role || "\u00A0"}
                    </div>
                  </div>

                  {/* Row 3: Bio — fixed height */}
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3 relative z-10 mb-6" style={{ minHeight: '4.5rem' }}>
                    {p.bio || "Building the future of technical collaboration in Bhutan."}
                  </p>

                  {/* Row 4: Skills — fixed height */}
                  <div className="flex flex-wrap gap-2 relative z-10 mb-8" style={{ minHeight: '2rem' }}>
                    {p.skills?.slice(0, 4).map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 border border-border/60 text-[11px] font-bold rounded-sm bg-secondary/20 group-hover:bg-background transition-colors">{s}</span>
                    ))}
                    {p.skills?.length > 4 && <span className="text-[11px] font-bold text-muted-foreground/40 self-center">+{p.skills.length - 4}</span>}
                  </div>

                  {/* Row 5: Actions — pushed to bottom */}
                  <div className="flex items-center gap-3 mt-auto relative z-10 pt-4 border-t border-border/20">
                    {getConnectionStatus(p.id) === 'SELF' ? (
                      <span className="h-11 flex items-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                        Your Profile
                      </span>
                    ) : getConnectionStatus(p.id) === 'ACCEPTED' ? (
                      <div className="h-11 flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                        <Check className="h-3 w-3" /> Connected
                      </div>
                    ) : getConnectionStatus(p.id) === 'PENDING' ? (
                      <button 
                        onClick={() => handleCancelConnection(p.id)}
                        disabled={processingId === p.id}
                        onMouseEnter={(e) => {
                          const span = e.currentTarget.querySelector('.status-text')
                          if (span) span.innerHTML = 'Cancel Request?'
                          e.currentTarget.classList.add('bg-red-500', 'text-white', 'border-red-600')
                          e.currentTarget.classList.remove('bg-orange-50/50', 'text-orange-500', 'border-orange-200')
                        }}
                        onMouseLeave={(e) => {
                          const span = e.currentTarget.querySelector('.status-text')
                          if (span) span.innerHTML = 'Request Sent'
                          e.currentTarget.classList.remove('bg-red-500', 'text-white', 'border-red-600')
                          e.currentTarget.classList.add('bg-orange-50/50', 'text-orange-500', 'border-orange-200')
                        }}
                        className="flex-1 h-11 border border-orange-200 bg-orange-50/50 text-orange-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span className="status-text">Request Sent</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(p.id)}
                        disabled={processingId === p.id}
                        className="flex-1 h-11 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:text-primary/80 transition-colors border border-border/40 rounded-sm hover:border-primary/30"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        {processingId === p.id ? "Sending..." : "Connect"}
                      </button>
                    )}

                    <Link
                      href={`/profile/${p.id}`}
                      className="h-11 flex items-center text-[11px] font-bold uppercase tracking-[0.15em] text-primary/60 hover:text-primary transition-colors shrink-0 whitespace-nowrap"
                    >
                      View Profile →
                    </Link>
                  </div>

                  {/* Decorative background element */}
                  <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredProfiles.length === 0 && (
            <div className="py-24 text-center space-y-6">
              <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-lg font-medium">No developers match your search yet.</p>
                <p className="text-muted-foreground/60 text-sm">Try using different keywords or categories.</p>
              </div>
              <Link href="/join" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 transition-opacity uppercase tracking-widest text-xs">
                Be the first to join
              </Link>
            </div>
          )}
        </div>
      </main>
      <GlobalFooter />
    </div>
  )
}

