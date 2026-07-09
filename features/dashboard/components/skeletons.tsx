import * as React from "react"
import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50 relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}


export function FeedSkeleton({ isGrid = false }: { isGrid?: boolean }) {
  return (
    <div className={cn("grid gap-6", isGrid ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:gap-8")}>
      {[1, 2, 3, 4].map((i) => (
        <article key={i} className="p-6 md:p-10 bg-background border border-border/10 rounded-sm relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-sm" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-3 mb-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="pt-4 border-t border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-8 w-24 rounded-sm" />
          </div>
        </article>
      ))}
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="flex flex-col w-full pt-4 pb-6 pl-0 pr-4 space-y-6">
      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-4">
          <Skeleton className="h-3 w-20 ml-0" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3 py-2 px-1">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/10 pt-2 pb-4">
      <div className="flex flex-col justify-center space-y-3 text-left">
        <Skeleton className="h-10 w-64 md:w-80" />
        <Skeleton className="h-4 w-48 md:w-64" />
      </div>
      <div className="flex items-center gap-2 min-w-0 md:min-w-[256px] justify-end">
        <Skeleton className="h-10 w-full md:w-64" />
      </div>
    </div>
  )
}

export function EventSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-background border border-border/10 rounded-sm overflow-hidden flex flex-col">
          <Skeleton className="aspect-video w-full" />
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
            <div className="pt-4 border-t border-border/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
