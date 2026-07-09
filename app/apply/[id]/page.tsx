"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, ChevronRight, Loader2, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { analytics } from "@/lib/analytics"
import { Skeleton } from "@/features/dashboard/components/skeletons"

export default function ApplicationPage({ params }: { params: any }) {
  const { id } = React.use(params) as { id: string }
  const supabase = createClient()
  const router = useRouter()
  
  const [post, setPost] = React.useState<any>(null)
  const [owner, setOwner] = React.useState<any>(null)
  const [user, setUser] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && post) {
      analytics.trackBookingStarted(post.role || 'Project Role');
    }
  }, [isLoading, post]);

  // Form State
  const [formData, setFormData] = React.useState({
    background: "",
    motivation: "",
    experience: "",
    github: ""
  })
  const [cvFile, setCvFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("Authentication required to apply")
        router.push("/join?redirect=/apply/" + id)
        return
      }
      setUser(session.user)

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`*, profiles!user_id (id, full_name, email, avatar_url)`)
        .eq('id', id)
        .single()

      if (postError) {
        console.error('SUPABASE FETCH ERROR:', postError);
        toast.error(`Database synchronization error: ${postError.message}`);
        router.push("/team-needed");
        return;
      }

      if (postData) {
        setPost(postData)
        setOwner(postData.profiles)
        
        // Parse the content to get better fields
        const contentLines = postData.content.split('\n')
        const role = contentLines[0]?.replace('ROLE NEEDED: ', '') || 'Developer'
        const project = contentLines[1]?.replace('PROJECT: ', '') || 'New Initiative'
        setPost({ ...postData, role, project })
      } else {
        toast.error("Project request not found in the grid")
        router.push("/team-needed")
      }
      setIsLoading(false)
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cvFile) {
      toast.error("Please synchronize your CV with the application")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Upload CV to Storage in a folder named after userId
      const fileName = `${user.id}/${Date.now()}_${cvFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, cvFile)

      if (uploadError) {
        console.error('SUPABASE STORAGE ERROR:', uploadError);
        throw new Error(`CV Synchronization Failed: ${uploadError.message}. Ensure the 'cvs' bucket exists in your Supabase storage.`);
      }

      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(fileName)

      // 2. Save Application Record
      const { error: appError } = await supabase
        .from('applications')
        .insert([{
          post_id: id,
          applicant_id: user.id,
          project_owner_id: owner.id,
          background: formData.background,
          motivation: formData.motivation,
          experience: formData.experience,
          github_url: formData.github,
          cv_url: publicUrl,
          status: 'SENT'
        }])

      if (appError) throw appError

      // 3. Trigger Automated Email Notification
      if (owner.email) {
        const emailRes = await fetch('/api/send-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerEmail: owner.email,
            applicantName: user.user_metadata?.full_name || 'A Developer',
            role: post.role,
            project: post.project,
            motivation: formData.motivation,
            cvUrl: publicUrl
          })
        });

        if (!emailRes.ok) {
          const errorData = await emailRes.json();
          throw new Error(`Email Dispatch Failed: ${errorData.error || 'Check Resend configuration'}`);
        }
      }

      // 4. Success state
      analytics.trackBookingConfirmed(post.role || 'Project Role', 0);
      setIsSuccess(true)
      toast.success("Identity Synchronization Complete: Application Dispatched")
      
      // We can't actually send emails from client without a service, 
      // but we inform the user it was sent to the owner's Gmail.
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Application transmission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <GlobalHeader />
        <main className="flex-1 flex flex-col items-center w-full bg-[#fafafa]/50">
          <div className="w-full max-w-4xl px-4 md:px-8 py-12 md:py-24 space-y-12">
            
            <Skeleton className="h-4 w-24 opacity-40" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 rounded-full opacity-30" />
                  <Skeleton className="h-12 w-full opacity-60" />
                  <Skeleton className="h-4 w-48 opacity-40" />
                </div>

                <div className="p-6 bg-white border border-border/60 rounded-xl shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full opacity-50" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16 opacity-30" />
                      <Skeleton className="h-4 w-32 opacity-40" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full opacity-20" />
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-white border border-border/60 rounded-2xl shadow-xl shadow-black/[0.02] overflow-hidden">
                  <div className="p-8 md:p-10 space-y-10">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="h-3 w-40 opacity-30" />
                        <Skeleton className={cn("w-full bg-[#fafafa] rounded-xl", i === 3 ? "h-14" : "h-28")} />
                      </div>
                    ))}
                    <div className="space-y-4">
                      <Skeleton className="h-3 w-40 opacity-30" />
                      <Skeleton className="h-32 w-full rounded-xl border-2 border-dashed border-border/40" />
                    </div>
                  </div>
                  <div className="p-8 md:p-10 bg-[#fafafa] border-t border-border/50 flex justify-between items-center">
                    <Skeleton className="h-4 w-32 opacity-30" />
                    <Skeleton className="h-12 w-40 rounded-sm opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <GlobalFooter />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <GlobalHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter">Application Dispatched!</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your credentials have been successfully synchronized. A notification and your CV have been sent to <span className="text-foreground font-semibold">{owner?.full_name}'s</span> Gmail account.
              </p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl border border-border/40 text-left space-y-4">
               <div className="flex items-start gap-4">
                 <div className="h-8 w-8 bg-background rounded-lg flex items-center justify-center shrink-0 border border-border/60">
                    <Mail className="h-4 w-4 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What happens next?</p>
                    <p className="text-[13px] text-foreground/70">The project owner will review your technical narrative and contact you directly via the email linked to your Google account.</p>
                 </div>
               </div>
            </div>
            <button 
              onClick={() => router.push("/team-needed")}
              className="px-8 py-3 bg-primary text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-xl shadow-primary/20"
            >
              Back to Network
            </button>
          </div>
        </main>
        <GlobalFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <GlobalHeader />
      
      <main className="flex-1 flex flex-col items-center w-full bg-[#fafafa]/50">
        <div className="w-full max-w-4xl px-4 md:px-8 py-12 md:py-24 space-y-12">
          
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Team
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Project Header */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Application</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground leading-[1.1]">
                  Applying for {post?.role}
                </h1>
                <p className="text-muted-foreground/80 font-medium uppercase tracking-widest text-[11px]">
                  Project: {post?.project}
                </p>
              </div>

              <div className="p-6 bg-white border border-border/60 rounded-xl shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center font-bold text-primary/60 text-xs">
                    {owner?.full_name?.[0]}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none">Recruiter</p>
                    <p className="text-sm font-semibold">{owner?.full_name}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground border-l-2 border-primary/20 pl-4 py-1 italic">
                    "{post?.mission?.substring(0, 150)}..."
                  </p>
                </div>
              </div>
            </div>

            {/* Right: The Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-white border border-border/60 rounded-2xl shadow-xl shadow-black/[0.02] overflow-hidden">
                <div className="p-8 md:p-10 space-y-10">
                  
                  {/* 1. Background */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                       <span className="w-1 h-1 bg-primary rounded-full" /> 01. Professional Background
                    </label>
                    <textarea 
                      required
                      placeholder="Briefly describe your expertise..."
                      className="w-full bg-[#fafafa] border border-border/50 rounded-xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all min-h-[100px] resize-none"
                      value={formData.background}
                      onChange={e => setFormData({ ...formData, background: e.target.value })}
                    />
                  </div>

                  {/* 2. Motivation */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                       <span className="w-1 h-1 bg-primary rounded-full" /> 02. Why join this project?
                    </label>
                    <textarea 
                      required
                      placeholder="What excites you about this specific mission?"
                      className="w-full bg-[#fafafa] border border-border/50 rounded-xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all min-h-[100px] resize-none"
                      value={formData.motivation}
                      onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                    />
                  </div>

                  {/* 3. Socials */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                       <span className="w-1 h-1 bg-primary rounded-full" /> 03. GitHub / Portfolio
                    </label>
                    <input 
                      type="url"
                      placeholder="https://github.com/yourhandle"
                      className="w-full bg-[#fafafa] border border-border/50 rounded-xl p-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      value={formData.github}
                      onChange={e => setFormData({ ...formData, github: e.target.value })}
                    />
                  </div>

                  {/* 4. CV Upload */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                       <span className="w-1 h-1 bg-primary rounded-full" /> 04. Curriculum Vitae (CV)
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center space-y-3 cursor-pointer transition-all",
                        cvFile ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 hover:border-primary/20 bg-[#fafafa]/50"
                      )}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={e => setCvFile(e.target.files?.[0] || null)}
                      />
                      {cvFile ? (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                          <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="h-5 w-5 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-emerald-600">{cvFile.name}</p>
                          <p className="text-[10px] text-emerald-600/60 uppercase">Ready for transmission</p>
                        </div>
                      ) : (
                        <>
                          <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                             <UploadCloud className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-bold text-primary">Click to upload CV</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">PDF (max 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 bg-[#fafafa] border-t border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-muted-foreground/40">
                    <ShieldCheck className="h-5 w-5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Encrypted Transmission</p>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="group px-10 py-4 bg-primary text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-xl shadow-primary/10 overflow-hidden relative"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Transmitting...</>
                    ) : (
                      <>Submit Application <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  )
}

import { ShieldCheck } from "lucide-react"
