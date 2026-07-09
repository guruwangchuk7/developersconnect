"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { GlobalHeader } from "@/components/common/global-header";
import { GlobalFooter } from "@/components/common/global-footer";
import { Users, Search, Briefcase, Zap, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeamNeededClientProps {
  initialTeams: any[];
  initialUser: any;
  initialApplications: any[];
}

export function TeamNeededClient({ initialTeams, initialUser, initialApplications }: TeamNeededClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [teams, setTeams] = React.useState<any[]>(initialTeams)
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [user, setUser] = React.useState<any>(initialUser)
  const [applications, setApplications] = React.useState<any[]>(initialApplications)

  React.useEffect(() => {
    async function sync() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase
          .from('applications')
          .select('post_id')
          .eq('applicant_id', session.user.id)
        if (data) setApplications(data)
      }
    }
    sync()
  }, [supabase])

  const filteredTeams = teams.filter((t: any) => 
    t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.mission.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/5">
      <GlobalHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter">
                  Team Formation
                </h1>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed md:text-lg max-w-2xl">
                  Collaborate with other technical nodes to build high-impact solutions for the Bhutanese digital framework.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search roles or projects..."
                  className="w-full bg-transparent border-b border-border/80 pl-10 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-medium tracking-tight"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-px">
                {[1, 2, 4].map(i => (
                  <div key={i} className="h-64 bg-secondary/20 animate-pulse rounded-sm"></div>
                ))}
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredTeams.map((team) => {
                  const isOwnPost = user?.id === team.userId
                  const isApplied = applications.some(a => a.post_id === team.id)
                  
                  return (
                    <TeamCard
                      key={team.id}
                      id={team.id}
                      role={team.role}
                      project={team.project}
                      mission={team.mission}
                      author={team.author}
                      tags={team.tags}
                      isOwnPost={isOwnPost}
                      isApplied={isApplied}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-border rounded-sm">
                 <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/30">No team requests currently synchronized in the network.</p>
              </div>
            )}

            <div className="mt-20 py-16 border-t border-dashed flex flex-col items-center text-center space-y-6">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Building something big?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Post a request for developers, designers, or consultants and find your dream team within the network.
                </p>
              </div>
              <Link href="/join" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 transition-opacity uppercase tracking-widest text-[11px]">
                Recruit Talent
              </Link>
            </div>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  );
}

function TeamCard({ 
  id, role, project, mission, author, tags, isOwnPost, isApplied 
}: {
  id: string,
  role: string,
  project: string,
  mission: string,
  author: string,
  tags: string[],
  isOwnPost: boolean,
  isApplied: boolean
}) {
  return (
    <div className="bg-background p-8 md:p-12 space-y-8 hover:bg-secondary/10 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 bg-secondary/50 rounded-sm flex items-center justify-center border border-border/20 group-hover:scale-110 transition-transform">
          <Briefcase className="h-5 w-5 text-primary/70" />
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
          isOwnPost ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
        )}>
          {isOwnPost ? "Your Request" : "Open Role"}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1">{role}</h3>
          <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest">Project: {project}</p>
        </div>
        <p className="text-muted-foreground leading-relaxed line-clamp-3 min-h-[5rem] text-[14px]">
          {mission}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-[11px] font-bold px-2 py-0.5 bg-secondary/30 rounded-sm">
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-6 border-t flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>Posted by {author}</span>
        </div>
        <div className="flex items-center gap-4">
          {isApplied && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Applied
            </span>
          )}
          {isOwnPost ? (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Managing Post
            </span>
          ) : (
            <Link
              href={`/team-needed/${id}`}
              className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
            >
              View Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
