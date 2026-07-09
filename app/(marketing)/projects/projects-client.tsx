"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { GlobalHeader } from "@/components/common/global-header";
import { GlobalFooter } from "@/components/common/global-footer";
import { Code, Share2, Rocket, Search } from "lucide-react";
import Link from "next/link";

export function ProjectsClient({ initialProjects }: { initialProjects: any[] }) {
  const supabase = createClient()
  const [projects, setProjects] = React.useState<any[]>(initialProjects)
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    // Optional: Refresh projects on mount if needed
  }, [])

  const filteredProjects = projects.filter((p: any) => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  National Project Repository
                </h1>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed md:text-lg max-w-2xl">
                  Discover initiatives, open-source tools, and collaborative ventures built on the national technical grid.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
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
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                    contributors={project.contributors}
                    status={project.status}
                    author={project.author}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-border rounded-sm">
                 <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/30">No projects found matching your synchronization parameters.</p>
              </div>
            )}

            <div className="mt-20 py-16 border-t border-dashed flex flex-col items-center text-center space-y-6">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Have a project to showcase?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Join the network to list your project, find contributors, and scale your impact across the ecosystem.
                </p>
              </div>
              <Link href="/join" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 transition-opacity uppercase tracking-widest text-[11px]">
                Start Collaborating
              </Link>
            </div>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  );
}

function ProjectCard({ id, title, description, tags, contributors, status, author }: {
  id: string,
  title: string,
  description: string,
  tags: string[],
  contributors: number,
  status: string,
  author?: string
}) {
  return (
    <div className="bg-background p-8 md:p-12 space-y-8 hover:bg-secondary/10 transition-colors group">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 bg-secondary/50 rounded-sm flex items-center justify-center border border-border/20 group-hover:scale-110 transition-transform">
          <Code className="h-5 w-5 text-primary/70" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-border/60 rounded-full">
          {status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1">{title}</h3>
          {author && <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest">Built by {author}</p>}
        </div>
        <p className="text-muted-foreground leading-relaxed line-clamp-5 text-[14px]">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-[11px] font-bold px-2 py-0.5 bg-secondary/30 rounded-sm">
            {tag}
          </span>
        ))}
        {tags.length === 0 && <span className="text-[11px] font-bold px-2 py-0.5 bg-secondary/10 rounded-sm italic text-muted-foreground/40">No tags</span>}
      </div>

      <div className="pt-6 border-t flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" />
          <span>{contributors} {contributors === 1 ? 'Contributor' : 'Contributors'}</span>
        </div>
        <Link href={`/projects/${id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          View Details →
        </Link>
      </div>
    </div>
  );
}
