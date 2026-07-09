"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { ArrowLeft, Code, Share2, Calendar, User, ExternalLink, Loader2, Tag } from "lucide-react"
import Link from "next/link"

export default function ProjectDetailClient({ id, initialProject }: { id: string, initialProject: any }) {
  const supabase = createClient()
  const router = useRouter()

  const [project, setProject] = React.useState<any>(initialProject)
  const [isLoading, setIsLoading] = React.useState(!initialProject)

  React.useEffect(() => {
    async function fetchProject() {
      if (initialProject) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles!user_id (full_name, avatar_url, role)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/projects')
        return
      }
      setProject(data)
      setIsLoading(false)
    }
    fetchProject()
  }, [id, initialProject])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Loading project details...</p>
      </div>
    )
  }

  // Parse project content
  const contentLines = project?.content?.split('\n') || []
  const title = contentLines[0]?.replace('PROJECT: ', '') || 'Untitled Project'
  
  // Clean description (remove structured fields)
  const cleanDescription = contentLines
    .filter((line: string) => 
      !line.startsWith('PROJECT: ') && 
      !line.startsWith('TECH: ') && 
      !line.startsWith('LINK: ')
    )
    .map((line: string) => line.replace('DESCRIPTION: ', ''))
    .filter((line: string) => line.trim())

  const techLine = contentLines.find((l: string) => l.startsWith('TECH: '))
  const linkLine = contentLines.find((l: string) => l.startsWith('LINK: '))
  const techStack = techLine ? techLine.replace('TECH: ', '').split(',').map((s: string) => s.trim()) : []
  const projectLink = linkLine ? linkLine.replace('LINK: ', '').trim() : null

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = project?.content?.match(urlRegex) || []

  const tags = project?.tags || []
  const createdAt = new Date(project?.created_at)
  const formattedDate = createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const authorName = project?.profiles?.full_name || 'Anonymous'
  const authorRole = project?.profiles?.role || ''
  const authorAvatar = project?.profiles?.avatar_url

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
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md border border-border/40 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Projects
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="relative -mt-24 md:-mt-32 pb-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-background border border-border/40 rounded-sm p-8 md:p-12 space-y-8 shadow-xl shadow-black/[0.03]">
              
              {/* Type Badge */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                  Project
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-border/60 rounded-full">
                  Live
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1]">
                {title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 md:gap-10 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Published</p>
                    <p className="text-sm font-semibold">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <Code className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Type</p>
                    <p className="text-sm font-semibold">Open Source Project</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">About This Project</h2>
                <div className="space-y-4">
                  {cleanDescription.length > 0 ? (
                    cleanDescription.map((paragraph: string, idx: number) => {
                      const hasUrl = urlRegex.test(paragraph)
                      if (hasUrl) {
                        const parts = paragraph.split(urlRegex)
                        return (
                          <p key={idx} className="text-[15px] text-foreground/80 leading-relaxed">
                            {parts.map((part: string, pIdx: number) => {
                              if (urlRegex.test(part)) {
                                return (
                                  <a
                                    key={pIdx}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors inline-flex items-center gap-1"
                                  >
                                    {part} <ExternalLink className="h-3 w-3 inline" />
                                  </a>
                                )
                              }
                              return <span key={pIdx}>{part}</span>
                            })}
                          </p>
                        )
                      }
                      return (
                        <p key={idx} className="text-[15px] text-foreground/80 leading-relaxed">
                          {paragraph}
                        </p>
                      )
                    })
                  ) : (
                    <p className="text-[15px] text-foreground/80 leading-relaxed italic">
                      No detailed description available yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Tech Stack */}
              {techStack.length > 0 && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Tech Stack</h2>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech: string, idx: number) => (
                        <span key={idx} className="text-[12px] font-bold px-3 py-1.5 bg-secondary/40 border border-border/40 rounded-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Tags</h2>
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

              {/* External Links */}
              {(projectLink || urls.length > 0) && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Links</h2>
                    <div className="flex flex-wrap gap-3">
                      {projectLink && (
                        <a
                          href={projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-background text-[11px] font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-all shadow-lg shadow-primary/10"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Visit Project
                        </a>
                      )}
                      {urls.filter((url: string) => url !== projectLink).map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 border border-border/60 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/20 transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {url.includes('github') ? 'GitHub' : 'Visit Link'}
                        </a>
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
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                    ) : (
                      authorName[0] || 'A'
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Built by</p>
                    <p className="text-sm font-semibold">{authorName}</p>
                    {authorRole && (
                      <p className="text-[11px] text-muted-foreground/60">{authorRole}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border/60 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/20 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  )
}
