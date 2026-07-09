"use client"

import * as React from "react"
import {
  LayoutGrid,
  Search,
  Users,
  Trophy,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  CreditCard,
  ArrowLeftRight,
  PieChart,
  Activity,
  UserCheck,
  FileText,
  Share2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  setIsMessagesOpen: (open: boolean) => void
  className?: string
}

export function Sidebar({ activeTab, setActiveTab, setIsMessagesOpen, className }: SidebarProps) {
  const router = useRouter()
  const sections = [
    {
      title: "Network",
      items: [
        { id: "all", label: "Feed", icon: LayoutGrid },
        { id: "discover", label: "Developers", icon: Search },
        { id: "teams", label: "Teams", icon: Users },
        { id: "projects", label: "Projects", icon: Activity },
        { id: "help", label: "Help", icon: HelpCircle },
        { id: "events", label: "Events", icon: TrendingUp },
      ]
    },
    {
      title: "Contribute",
      items: [
        { id: "post-update", label: "Post Update", icon: Share2 },
        { id: "dev-needed", label: "Developers Needed", icon: Search },
        { id: "ask-help", label: "Ask Help", icon: MessageSquare },
        { id: "share-project", label: "Share Project", icon: Activity },
        { id: "organize-event", label: "Organize Event", icon: Trophy },
      ]
    },
    {
      title: "Workspace",
      items: [
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "ai-tools", label: "AI Tools", icon: Sparkles },
        { id: "help-guide", label: "Help", icon: HelpCircle },
        { id: "settings", label: "Settings", icon: Settings, href: "/identity" },
      ]
    }
  ]

  const bottomItems: any[] = []

  return (
    <aside className={cn("flex flex-col w-full pt-4 pb-6 pl-0 pr-4", className)}>
      {/* Navigation Sections (Static, no scrolling) */}
      <div className="space-y-4 py-2">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h4 className="pl-0 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">
              {section.title}
            </h4>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "messages") {
                        setIsMessagesOpen(true)
                      } else {
                        setActiveTab(item.id)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 pl-0 pr-4 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-secondary text-foreground shadow-sm ring-1 ring-border/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors shrink-0",
                      isActive ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
                    )} />
                    <span className={cn(
                      "text-[14px] font-semibold tracking-tight truncate",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Items (Pinned but static) */}
      <div className="mt-0 pt-3 border-t border-border/30">
        <nav className="space-y-0.5">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-3 pl-0 pr-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground/70 group-hover:text-foreground transition-colors shrink-0" />
                  <span className="text-[14px] font-semibold tracking-tight truncate">{item.label}</span>
                </Link>
              )
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 pl-0 pr-4 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-secondary text-foreground shadow-sm ring-1 ring-border/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  isActive ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
                )} />
                <span className={cn(
                  "text-[14px] font-semibold tracking-tight truncate",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

function AwardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  )
}
