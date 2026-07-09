"use client"

import * as React from "react"
import { Plus, Trophy, Trash2 } from "lucide-react"
import Link from "next/link"

interface EventGridProps {
  events: any[]
  onOrganizeEvent: () => void
  onDeleteEvent?: (id: string) => void
  currentUserId?: string
}

export function EventGrid({ events, onOrganizeEvent, onDeleteEvent, currentUserId }: EventGridProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Active synchronization nodes</h3>
        <button
          onClick={onOrganizeEvent}
          className="px-6 py-2 bg-primary text-background text-[11px] font-bold rounded-sm hover:opacity-90 transition-all uppercase tracking-widest flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> Organize Event
        </button>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const hasPoster = !!event.image_url
            const regDeadlineMatch = event.description?.match(/REGISTRATION_DEADLINE: ([^\n]*)/)
            const regDeadline = regDeadlineMatch ? regDeadlineMatch[1].trim() : null

            const eventEndDateMatch = event.description?.match(/EVENT_END_DATE: ([^\n]*)/)
            const eventEndDate = eventEndDateMatch ? eventEndDateMatch[1].trim() : null

            // Clean description by stripping out all metadata matches
            const cleanDescription = (event.description || "")
              .replace(/REGISTRATION_DEADLINE: [^\n]*/, "")
              .replace(/EVENT_END_DATE: [^\n]*/, "")
              .replace(/EVENT_START_TIME: [^\n]*/, "")
              .replace(/EVENT_END_TIME: [^\n]*/, "")
              .replace(/END_DATE: [^\n]*/, "")
              .trim();

            const isOwner = currentUserId === event.organizer_id

            // Check if registration deadline has ended, otherwise check event start date
            let isRegistrationClosed = false
            if (regDeadline) {
              const deadlineDate = new Date(regDeadline)
              deadlineDate.setHours(23, 59, 59, 999)
              isRegistrationClosed = new Date() > deadlineDate
            } else if (event.event_date) {
              const eventDateObj = new Date(event.event_date)
              eventDateObj.setHours(23, 59, 59, 999)
              isRegistrationClosed = new Date() > eventDateObj
            }

            return (
              <div key={event.id} className="bg-background border border-border/40 rounded-sm overflow-hidden flex flex-col hover:border-primary/20 transition-all group relative">
                {isOwner && onDeleteEvent && (
                  <button 
                    onClick={() => onDeleteEvent(event.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-background/80 backdrop-blur-md rounded-full border border-border/40 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                {hasPoster && (
                  <Link href={`/events/${event.id}`} className="aspect-video w-full overflow-hidden border-b border-border/10 block cursor-pointer">
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                )}
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Community Event</span>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        isRegistrationClosed 
                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {isRegistrationClosed ? "Closed" : "Open"}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-secondary rounded-full">
                        {new Date(event.event_date).toLocaleDateString()}
                        {eventEndDate && eventEndDate !== event.event_date && ` - ${new Date(eventEndDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Link href={`/events/${event.id}`}>
                      <h4 className="text-lg font-bold tracking-tight hover:text-primary transition-colors line-clamp-1 cursor-pointer">{event.title}</h4>
                    </Link>
                    
                    {/* Event Date Range */}
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5">
                      📅 {new Date(event.event_date).toLocaleDateString()}
                      {eventEndDate && eventEndDate !== event.event_date && ` to ${new Date(eventEndDate).toLocaleDateString()}`}
                    </p>

                    {regDeadline && (
                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                        ⏳ Reg Ends: {new Date(regDeadline).toLocaleDateString()}
                      </p>
                    )}

                    <p className="text-[13px] text-muted-foreground line-clamp-3 leading-relaxed mt-2">{cleanDescription}</p>
                  </div>
                  <div className="pt-4 border-t border-border/20 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-black italic">
                        {event.profiles?.full_name?.[0] || 'A'}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60">{event.profiles?.full_name || 'Anonymous'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/40">{event.venue}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-border/30 rounded-xl bg-secondary/5">
          <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">Upcoming Community Events</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">No events scheduled. Be the first to organize a workshop or hackathon!</p>
        </div>
      )}
    </div>
  )
}
