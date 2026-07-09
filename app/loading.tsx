import React from "react";
import { Skeleton, FeedSkeleton, SidebarSkeleton, HeaderSkeleton } from "@/features/dashboard/components/skeletons";

export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 overflow-y-auto scrollbar-hide">
      {/* Simulated Global Header Skeleton */}
      <div className="border-b border-border/10 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full px-4 md:px-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-sm opacity-50" />
              <div className="hidden md:block">
                <Skeleton className="h-4 w-32 opacity-40" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <Skeleton className="h-4 w-12 opacity-30" />
                <Skeleton className="h-4 w-16 opacity-30" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full opacity-50" />
                <Skeleton className="h-8 w-20 rounded-sm opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex justify-center w-full">
        <div className="w-full px-4 md:px-10 py-2 md:py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-24 lg:pb-0 relative">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-3">
             <SidebarSkeleton />
          </div>

          {/* Content Area Skeleton */}
          <div className="lg:col-span-9 space-y-8">
             <HeaderSkeleton />
             <FeedSkeleton />
          </div>
        </div>
      </main>

      {/* Synchronizing Indicator (Subtle) */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-background/80 backdrop-blur-md border border-border/10 px-4 py-2 rounded-full shadow-2xl z-[100]">
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
          Synchronizing
        </span>
      </div>
    </div>
  );
}

