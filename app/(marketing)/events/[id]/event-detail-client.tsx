"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { Calendar, MapPin, ArrowLeft, Users, ExternalLink, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EventDetailClient({ id, initialEvent }: { id: string, initialEvent: any }) {
  const supabase = createClient()
  const router = useRouter()

  const [event, setEvent] = React.useState<any>(initialEvent)
  const [isLoading, setIsLoading] = React.useState(!initialEvent)

  React.useEffect(() => {
    async function fetchEvent() {
      if (initialEvent) return;

      const { data, error } = await supabase
        .from('events')
        .select(`*, profiles!organizer_id (full_name, avatar_url, role)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/events')
        return
      }
      setEvent(data)
      setIsLoading(false)
    }
    fetchEvent()
  }, [id, initialEvent])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Loading event details...</p>
      </div>
    )
  }

  const endDateMatch = event?.description?.match(/END_DATE: (.*)/)
  const endDate = endDateMatch ? endDateMatch[1] : null
  const cleanDescription = event?.description?.replace(/END_DATE: (.*)/, '').trim() || ''

  // Extract URLs from the description
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = cleanDescription.match(urlRegex) || []

  // Split description into paragraphs
  const paragraphs = cleanDescription.split('\n').filter((p: string) => p.trim())

  const eventDate = new Date(event?.event_date)
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/5 font-sans">
      <GlobalHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          {event?.image_url ? (
            <div className="relative h-[300px] md:h-[420px] w-full overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          ) : (
            <div className="h-[200px] md:h-[280px] w-full bg-gradient-to-br from-primary/5 via-secondary/20 to-background" />
          )}

          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <button
              onClick={() => router.push('/dashboard?tab=events')}
              className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md border border-border/40 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="relative -mt-24 md:-mt-32 pb-24">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Event Header Card */}
            <div className="bg-background border border-border/40 rounded-sm p-8 md:p-12 space-y-8 shadow-xl shadow-black/[0.03]">
              
              {/* Type Badge */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                  Community Event
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1]">
                {event?.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 md:gap-10 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Starts</p>
                    <p className="text-sm font-semibold">{formattedDate}</p>
                    {endDate && (
                      <p className="text-[11px] text-muted-foreground/60 font-medium mt-0.5">
                        Ends: {new Date(endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Venue</p>
                    <p className="text-sm font-semibold">{event?.venue}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">About This Event</h2>
                <div className="space-y-4">
                  {paragraphs.map((paragraph: string, idx: number) => {
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
                  })}
                </div>
              </div>

              {/* External Links */}
              {urls.length > 0 && (
                <>
                  <div className="border-t border-border/30" />
                  <div className="space-y-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Links</h2>
                    <div className="flex flex-wrap gap-3">
                      {urls.map((url: string, idx: number) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-background text-[11px] font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-all shadow-lg shadow-primary/10"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {url.includes('forms.gle') ? 'Apply Now' : 'Visit Link'}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* Organizer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-[11px] font-black italic text-primary/60">
                    {event?.profiles?.full_name?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Organized by</p>
                    <p className="text-sm font-semibold">{event?.profiles?.full_name || 'Anonymous'}</p>
                    {event?.profiles?.role && (
                      <p className="text-[11px] text-muted-foreground/60">{event.profiles.role}</p>
                    )}
                  </div>
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
