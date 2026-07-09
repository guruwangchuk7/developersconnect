"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { Calendar, MapPin, Search, Users, Trophy } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function EventsClient({ initialEvents }: { initialEvents: any[] }) {
  const supabase = createClient()
  const [events, setEvents] = React.useState<any[]>(initialEvents)
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    // Optional: Refresh events on mount if needed
  }, [])

  const filteredEvents = events.filter((e: any) => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/5">
      <GlobalHeader />
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
              <div className="space-y-4 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tighter">
                  Ecosystem Events
                </h1>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed md:text-lg max-w-2xl">
                  Join the conversations and competitions shaping the future of technical innovation in Bhutan.
                </p>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Filter events..."
                  className="w-full bg-transparent border-b border-border/80 pl-10 py-3 focus:outline-none focus:border-primary transition-colors text-sm font-medium tracking-tight"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-px">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 bg-secondary/20 animate-pulse rounded-sm"></div>
                  ))}
               </div>
            ) : filteredEvents.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 md:mb-32">
                {filteredEvents.map((event) => {
                   const endDateMatch = event.description?.match(/EVENT_END_DATE: (.*)/)
                   const endDate = endDateMatch ? endDateMatch[1] : null
                   const regDeadlineMatch = event.description?.match(/REGISTRATION_DEADLINE: (.*)/)
                   const regDeadline = regDeadlineMatch ? regDeadlineMatch[1] : null
                   const cleanDescription = event.description
                     ?.replace(/REGISTRATION_DEADLINE: [^\n]*/, "")
                     ?.replace(/EVENT_END_DATE: [^\n]*/, "")
                     ?.trim() || "";

                   return (
                    <EventCard 
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      description={cleanDescription}
                      location={event.location}
                      date={event.rawDate || event.date}
                      endDate={endDate}
                      regDeadline={regDeadline}
                      type={event.type}
                      imageUrl={event.image_url}
                      organizerName={event.organizerName}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-border rounded-sm mb-20 md:mb-32">
                 <p className="text-muted-foreground font-medium underline underline-offset-4 decoration-primary/30">No upcoming events are currently synchronized within the national grid.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-secondary/20 p-12 lg:p-24 rounded-sm border border-border">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-3xl md:text-5xl font-bold tracking-tighter">Organize an Event</h3>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                            Have an idea for a workshop, meetup, or hackathon? Use our platform to manage registrations, find venues, and scale your impact.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 pt-4">
                       <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center text-primary border border-border shadow-sm">
                               <Users className="h-5 w-5" />
                           </div>
                           <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-snug">Registration<br/>Tools</span>
                       </div>
                       <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center text-primary border border-border shadow-sm">
                               <MapPin className="h-5 w-5" />
                           </div>
                           <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-snug">Venue<br/>Partners</span>
                       </div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center space-y-6 md:border-l border-border md:pl-16">
                    <p className="text-muted-foreground font-medium text-center">Join the network to submit your event proposal to the national board.</p>
                    <Link href="/join" className="w-full sm:w-auto px-12 py-4 bg-primary text-primary-foreground font-bold rounded-sm hover:opacity-90 transition-opacity text-[10px] uppercase tracking-[0.2em] text-center shadow-lg hover:shadow-primary/20">
                        Sign in to submit
                    </Link>
                </div>
            </div>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  );
}

function EventCard({ id, title, description, location, date, endDate, regDeadline, type, imageUrl, organizerName }: { 
  id: string,
  title: string, 
  description: string, 
  location: string,
  date: string,
  endDate?: string | null,
  regDeadline?: string | null,
  type: string,
  imageUrl?: string | null,
  organizerName?: string
}) {
  let isRegistrationClosed = false
  if (regDeadline) {
    const deadlineDate = new Date(regDeadline)
    deadlineDate.setHours(23, 59, 59, 999)
    isRegistrationClosed = new Date() > deadlineDate
  } else if (date) {
    const eventDateObj = new Date(date)
    eventDateObj.setHours(23, 59, 59, 999)
    isRegistrationClosed = new Date() > eventDateObj
  }

  return (
    <div className="bg-background border border-border/40 rounded-sm overflow-hidden flex flex-col hover:border-primary/20 hover:shadow-sm transition-all group relative">
      {imageUrl && (
        <Link href={`/events/${id}`} className="aspect-video w-full overflow-hidden border-b border-border/10 block cursor-pointer">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
      )}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{type || "Community Event"}</span>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
              isRegistrationClosed 
                ? "bg-red-500/10 text-red-500 border-red-500/20" 
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}>
              {isRegistrationClosed ? "Closed" : "Open"}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-secondary rounded-full">
              {new Date(date).toLocaleDateString()}
              {endDate && endDate !== date && ` - ${new Date(endDate).toLocaleDateString()}`}
            </span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <Link href={`/events/${id}`}>
            <h4 className="text-lg font-bold tracking-tight hover:text-primary transition-colors line-clamp-1 cursor-pointer">{title}</h4>
          </Link>
          
          {/* Event Date Range */}
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
            📅 {new Date(date).toLocaleDateString()}
            {endDate && endDate !== date && ` to ${new Date(endDate).toLocaleDateString()}`}
          </p>

          {regDeadline && (
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
              ⏳ Reg Ends: {new Date(regDeadline).toLocaleDateString()}
            </p>
          )}

          <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed mt-2">{description}</p>
        </div>
        <div className="pt-4 border-t border-border/20 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-black italic">
              {organizerName?.[0] || 'A'}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60">{organizerName || 'Anonymous'}</span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground/45">{location}</span>
        </div>
      </div>
    </div>
  );
}
// Hot-reload trigger comment
