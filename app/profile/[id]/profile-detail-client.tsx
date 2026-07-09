"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { GlobalHeader } from "@/components/common/global-header"
import { LinkIcon, Globe, MapPin, Mail, Calendar, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function ProfileDetailClient({ initialProfile }: { initialProfile: any }) {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = React.useState<any>(initialProfile)
  const [isLoading, setIsLoading] = React.useState(!initialProfile)

  React.useEffect(() => {
    async function fetchProfile() {
      if (initialProfile) return; // Skip if we already have data from server

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [supabase, id, initialProfile])

  if (isLoading) return null

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground font-medium mb-4 uppercase tracking-widest text-xs">Profile not found</p>
        <button
          onClick={() => router.back()}
          className="text-primary font-bold transition hover:opacity-80"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />

      <main className="flex-1 container mx-auto py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Back to Grid</span>
            </button>
            <span className="px-3 py-1 bg-secondary text-primary font-bold text-[10px] uppercase tracking-widest rounded-full border border-border/50">Verified Member</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24 items-start">
            {/* Left: Identity Card */}
            <div className="md:col-span-5 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary flex items-center justify-center text-3xl font-black italic text-muted-foreground/30 rounded-full border border-border overflow-hidden mb-8 group shadow-xl shadow-black/5">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    profile.full_name?.split(' ').map((n: string) => n[0]).join('')
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">{profile.full_name}</h1>
                <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mb-8">{profile.role}</p>
              </div>

              <div className="space-y-6 pt-8 border-t border-border/60">
                <div className="flex items-center gap-4 text-muted-foreground font-medium">
                  <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center border border-border/40"><MapPin className="h-4 w-4" /></div>
                  <span className="text-sm">Bumthang, Bhutan</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground font-medium">
                  <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center border border-border/40"><Mail className="h-4 w-4" /></div>
                  <span className="text-sm">Contact Member</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground font-medium">
                  <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center border border-border/40"><Calendar className="h-4 w-4" /></div>
                  <span className="text-sm">Joined {new Date(profile.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {profile.github_url && (
                  <Link href={profile.github_url} className="px-6 h-11 bg-primary text-background rounded-sm flex items-center shadow-lg hover:opacity-90 transition shadow-primary/10 font-bold tracking-tight text-xs">
                    View Repo
                  </Link>
                )}
                {profile.portfolio_url && (
                  <button className="h-11 px-6 border border-border font-bold text-xs uppercase tracking-widest hover:bg-secondary/50 transition">
                    Portfolio
                  </button>
                )}
              </div>
            </div>

            {/* Right: Technical Details */}
            <div className="md:col-span-7 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground opacity-50">Identity & Bio</h2>
                <p className="text-lg md:text-2xl leading-relaxed text-foreground/90 font-medium">
                  {profile.bio || "This developer hasn't added a bio yet, but they are an active part of the Bhutan Developer Network."}
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground opacity-50">Technical Stack</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skills?.map((s: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-secondary/80 text-primary font-bold text-[13px] tracking-tight rounded-sm border border-border">{s}</span>
                  ))}
                </div>
              </div>

              <div className="p-10 bg-secondary/30 border border-border rounded-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold tracking-tight">Current Availability</h3>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[9px]">{profile.availability}</p>
                </div>
                <button className="h-12 px-8 bg-background border border-primary text-primary font-bold rounded-sm shadow-sm hover:bg-primary hover:text-background transition-all active:scale-95 text-xs">
                  Connect for Team {profile.full_name?.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
