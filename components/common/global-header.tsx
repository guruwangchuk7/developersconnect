"use client"

import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutGrid, Search, Users, Trophy, MessageSquare, LogOut, Settings, HelpCircle, History, ArrowLeft, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { Session } from "@supabase/supabase-js";

interface GlobalHeaderProps {
  children?: React.ReactNode;
}

import { useProfile } from "@/providers/profile-provider";
import { analytics } from "@/lib/analytics";

export function GlobalHeader({ children }: GlobalHeaderProps) {
  const { session, profile } = useProfile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const supabase = createClient();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/identity') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/apply');

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleClickOutside = () => setIsProfileMenuOpen(false);
    if (isProfileMenuOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, isProfileMenuOpen]);

  // Hide marketing links if on dashboard or if custom children are provided
  const showMarketingLinks = !isDashboard && !children;

  const handleSignOut = async () => {
    analytics.trackEvent('sign_out', 'auth', 'Header Sign Out');
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)] flex justify-center">
      <div className="w-full px-4 md:px-10 relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-12 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-primary group-hover:scale-110 transition-transform"></div>
            <span className="text-lg md:text-xl font-semibold tracking-tighter">BDN</span>
          </Link>
        </div>

        {showMarketingLinks && (
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-[13px] font-medium text-muted-foreground/80">
            <Link href="/directory" className="hover:text-foreground transition-colors">Developers</Link>
            <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
            <Link href="/team-needed" className="hover:text-foreground transition-colors">Teams</Link>
            <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
            <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
            <Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        )}

        <div className="flex items-center gap-3 lg:gap-8 shrink-0">
          {children ? (
            children
          ) : (
            <>
              {showMarketingLinks && !session && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/join" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 rounded-sm px-4 md:px-5 text-[13px] font-semibold shadow-sm transition hover:bg-secondary/50")}>
                    Sign in
                  </Link>
                  <Link href="/join" className={cn(buttonVariants({ size: "sm" }), "h-9 rounded-sm px-4 md:px-5 text-[13px] font-semibold bg-primary shadow-sm transition hover:opacity-90")}>
                    Join Connect
                  </Link>
                </div>
              )}

              {session && (
                <div className="flex items-center gap-4 relative">
                  {pathname === "/" && (
                    <Link 
                      href="/dashboard" 
                      onClick={() => analytics.trackAdminAccess()}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 rounded-sm px-4 font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-secondary/50")}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      if (!isProfileMenuOpen) setIsOpen(false);
                    }}
                    className="group focus:outline-none"
                  >
                    {profile?.avatar_url || (session.user as any).user_metadata?.picture ? (
                      <img
                        src={profile?.avatar_url || (session.user as any).user_metadata?.picture}
                        alt="Profile"
                        className="h-9 w-9 rounded-full object-cover border border-border/50 group-hover:border-primary transition-all ring-offset-background group-hover:ring-2 group-hover:ring-primary/20"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-[12px] font-bold text-foreground border border-border/50 group-hover:border-primary transition-all group-hover:ring-2 group-hover:ring-primary/20">
                        {profile?.full_name?.[0] || session.user.email?.[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div
                      className="absolute right-0 top-12 w-64 bg-background border border-border/40 shadow-2xl rounded-sm py-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Section: Profile Info */}
                      <div className="px-5 pb-3 border-b border-border/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-12 w-12 rounded-full overflow-hidden border border-border/40">
                            {profile?.avatar_url || (session.user as any).user_metadata?.picture ? (
                              <img
                                src={profile?.avatar_url || (session.user as any).user_metadata?.picture}
                                alt="User"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-secondary flex items-center justify-center text-[16px] font-semibold text-foreground">
                                {profile?.full_name?.[0] || session.user.email?.[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 overflow-hidden">
                            <h4 className="text-[14px] font-semibold tracking-tight text-foreground truncate">{profile?.full_name || (session.user as any).user_metadata?.full_name || "Loading profile..."}</h4>
                            <p className="text-[11px] text-muted-foreground/60 truncate">
                              {profile?.role || "Active Member"}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/identity"
                          className="w-full flex items-center justify-center h-8 text-[12px] font-medium text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-all hover:border-primary"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          View profile
                        </Link>
                      </div>

                      {/* Section: Account */}
                      <div className="py-2 border-b border-border/10">
                        <p className="px-5 py-1 text-[10px] uppercase font-medium tracking-wide text-muted-foreground/40">Account</p>
                        <Link
                          href="/identity"
                          className="flex items-center gap-3 px-5 py-2 text-[13px] text-foreground/70 hover:bg-secondary/30 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Settings & Privacy
                        </Link>
                        <Link
                          href="/dashboard?tab=help"
                          className="flex items-center gap-3 px-5 py-2 text-[13px] text-foreground/70 hover:bg-secondary/30 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Help
                        </Link>
                        <Link
                          href="/dashboard?tab=messages"
                          className="flex items-center gap-3 px-5 py-2 text-[13px] text-foreground/70 hover:bg-secondary/30 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Messages
                        </Link>
                      </div>

                      {/* Section: Manage */}
                      <div className="py-2 border-b border-border/10">
                        <p className="px-5 py-1 text-[10px] uppercase font-medium tracking-wide text-muted-foreground/40">Manage</p>
                        <Link
                          href="/identity/activity"
                          className="flex items-center gap-3 px-5 py-2 text-[13px] text-foreground/70 hover:bg-secondary/30 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Posts & Activity
                        </Link>
                        <Link
                          href="/identity/connections"
                          className="flex items-center gap-3 px-5 py-2 text-[13px] text-foreground/70 hover:bg-secondary/30 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Connections
                        </Link>
                      </div>

                      {/* Section: Sign Out */}
                      <div className="pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-5 py-2.5 text-[13px] font-medium text-red-500/80 hover:bg-red-500/5 hover:text-red-500 transition-all"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            className="lg:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) setIsProfileMenuOpen(false);
            }}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden fixed left-0 right-0 top-[calc(4rem+env(safe-area-inset-top))] h-[calc(100dvh-4rem-env(safe-area-inset-top))] z-40 bg-background transition-transform duration-300 ease-in-out overflow-y-auto border-t",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="flex flex-col p-6 gap-6 min-h-full">
          {showMarketingLinks && (
            <>
              <Link href="/directory" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Developers</Link>
              <Link href="/projects" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Projects</Link>
              <Link href="/team-needed" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Team Needed</Link>
              <Link href="/events" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Events</Link>
              <Link href="/help" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Help</Link>
              <Link href="/careers" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Careers</Link>
              <Link href="/contact" className="text-base font-semibold border-b pb-4" onClick={() => setIsOpen(false)}>Contact</Link>
            </>
          )}

          {isDashboard && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Network</p>
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard?tab=all" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground/40" /> Feed
                  </Link>
                  <Link href="/dashboard?tab=discover" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <Search className="h-4.5 w-4.5 text-muted-foreground/40" /> Developers
                  </Link>
                  <Link href="/dashboard?tab=teams" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <Users className="h-4.5 w-4.5 text-muted-foreground/40" /> Teams
                  </Link>
                  <Link href="/dashboard?tab=projects" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground/40" /> Projects
                  </Link>
                  <Link href="/dashboard?tab=help" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground/40" /> Help
                  </Link>
                  <Link href="/dashboard?tab=events" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground/40" /> Events
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Contribute</p>
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard?tab=post-update" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <LayoutGrid className="h-4.5 w-4.5 text-muted-foreground/40" /> Post Update
                  </Link>
                  <Link href="/dashboard?tab=dev-needed" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <Search className="h-4.5 w-4.5 text-muted-foreground/40" /> Developers Needed
                  </Link>
                  <Link href="/dashboard?tab=ask-help" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <MessageSquare className="h-4.5 w-4.5 text-muted-foreground/40" /> Ask Help
                  </Link>
                  <Link href="/dashboard?tab=share-project" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <Users className="h-4.5 w-4.5 text-muted-foreground/40" /> Share Project
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 px-1">Workspace</p>
                <div className="flex flex-col gap-3">
                  <Link href="/dashboard?tab=messages" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <MessageSquare className="h-4.5 w-4.5 text-muted-foreground/40" /> Messages
                  </Link>
                  <Link href="/dashboard?tab=ai-tools" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <Sparkles className="h-4.5 w-4.5 text-muted-foreground/40" /> AI Tools
                  </Link>
                  <Link href="/dashboard?tab=help-guide" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <HelpCircle className="h-4.5 w-4.5 text-muted-foreground/40" /> Help Guide
                  </Link>
                  <Link href="/identity/activity" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <History className="h-4.5 w-4.5 text-muted-foreground/40" /> Posts & Activity
                  </Link>
                  <Link href="/identity" className="flex items-center gap-4 text-[13px] font-bold py-1 px-1 hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                    <Settings className="h-4.5 w-4.5 text-muted-foreground/40" /> Settings
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-auto pt-8 pb-16">
            {session ? (
              <div className="flex flex-col gap-3">
                {pathname === "/" && (
                  <Link
                    href="/dashboard"
                    className={cn(buttonVariants({ size: "lg" }), "w-full justify-center bg-foreground text-background font-bold text-[12px] rounded-none h-11 hover:opacity-90")}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard Home
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsOpen(false);
                    window.location.href = "/";
                  }}
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center rounded-none h-11 border-border/20 text-[12px] font-bold hover:bg-secondary/50")}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/join" className={cn(buttonVariants({ size: "lg" }), "w-full justify-center bg-primary rounded-sm h-12 font-bold")} onClick={() => setIsOpen(false)}>Join Connect</Link>
                <Link href="/join" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center rounded-none h-12 font-bold border-border/20")} onClick={() => setIsOpen(false)}>Sign in</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
