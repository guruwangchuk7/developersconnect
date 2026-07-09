"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { ArrowLeft, Briefcase, Calendar, User, Loader2, Tag, Users, Check } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TeamDetailClient({ id, initialPost, initialUser, initialIsApplied, initialIsOwnPost }: { 
  id: string, 
  initialPost: any,
  initialUser: any,
  initialIsApplied: boolean,
  initialIsOwnPost: boolean
}) {
  const supabase = createClient()
  const router = useRouter()

  const [post, setPost] = React.useState<any>(initialPost)
  const [isLoading, setIsLoading] = React.useState(!initialPost)
  const [user, setUser] = React.useState<any>(initialUser)
  const [isApplied, setIsApplied] = React.useState(initialIsApplied)
  const [isOwnPost, setIsOwnPost] = React.useState(initialIsOwnPost)

  React.useEffect(() => {
    async function fetchData() {
      if (initialPost) return;

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles!user_id (full_name, avatar_url, role, email)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/team-needed')
        return
      }

      const contentLines = data.content.split('\n')
      const roleName = contentLines[0]?.replace('ROLE NEEDED: ', '') || 'Developer'
      const project = contentLines[1]?.replace('PROJECT: ', '') || 'New Initiative'
      const mission = contentLines.slice(2).map((line: string) => line.replace('MISSION: ', '')).join('\n')

      setPost({
        ...data,
        roleName,
        project,
        mission,
        authorName: data.profiles?.full_name || 'Anonymous',
        authorAvatar: data.profiles?.avatar_url,
        authorRole: data.profiles?.role || '',
      })

      if (session?.user) {
        setIsOwnPost(session.user.id === data.user_id)
        const { data: appData } = await supabase
          .from('applications')
          .select('id')
          .eq('post_id', id)
          .eq('applicant_id', session.user.id)
          .limit(1)
        if (appData && appData.length > 0) {
          setIsApplied(true)
        }
      }
      setIsLoading(false)
    }
    fetchData()
  }, [id, initialPost])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Loading team details...</p>
      </div>
    )
  }

  const tags = post?.tags || []
  const createdAt = new Date(post?.created_at)
  const formattedDate = createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const missionParagraphs = (post?.mission || '').split('\n').filter((p: string) => p.trim())

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/5 font-sans">
      <GlobalHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="h-[200px] md:h-[280px] w-full bg-gradient-to-br from-primary/5 via-secondary/20 to-background" />

          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => router.push('/team-needed')}
              className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md border border-border/40 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Teams
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="relative -mt-24 md:-mt-32 pb-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-background border border-border/40 rounded-sm p-8 md:p-12 space-y-8 shadow-xl shadow-black/[0.03]">
              
              {/* Badge Row */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                  Team Request
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                  "bg-emerald-50 text-emerald-700 border-emerald-100"
                )}>
                  Open Role
                </span>
                {isApplied && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1.5">
                    <Check className="h-3 w-3" /> You Applied
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1]">
                {post?.roleName}
              </h1>

              {/* Project Name */}
              <p className="text-[12px] font-bold text-primary/60 uppercase tracking-[0.2em]">
                Project: {post?.project}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 md:gap-10 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Posted</p>
                    <p className="text-sm font-semibold">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Type</p>
                    <p className="text-sm font-semibold">Team Recruitment</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* Mission / Description */}
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Mission & Requirements</h2>
                <div className="space-y-4">
                  {missionParagraphs.length > 0 ? (
                    missionParagraphs.map((paragraph: string, idx: number) => (
                      <p key={idx} className="text-[15px] text-foreground/80 leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-[15px] text-foreground/80 leading-relaxed italic">
                      No detailed description provided yet. Apply to learn more about this opportunity.
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-[12px] font-bold px-3 py-1.5 bg-primary/5 border border-primary/10 text-primary/70 rounded-sm flex items-center gap-1.5">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-[11px] font-black italic text-primary/60 overflow-hidden">
                    {post?.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName} className="h-full w-full object-cover" />
                    ) : (
                      post?.authorName?.[0] || 'A'
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Posted by</p>
                    <p className="text-sm font-semibold">{post?.authorName}</p>
                    {post?.authorRole && (
                      <p className="text-[11px] text-muted-foreground/60">{post.authorRole}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply CTA */}
              <div className="border-t border-border/30" />
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                {isOwnPost ? (
                  <div className="px-8 py-4 bg-secondary/30 text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm text-center">
                    This is your own team request
                  </div>
                ) : isApplied ? (
                  <div className="flex items-center gap-3 px-8 py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm">
                    <Check className="h-4 w-4" /> You have already applied to this team
                  </div>
                ) : (
                  <Link
                    href={`/apply/${id}`}
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-xl shadow-primary/10 active:scale-95"
                  >
                    Apply to Team
                  </Link>
                )}
                <Link
                  href="/team-needed"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border/60 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/20 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  )
}
