"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { GlobalHeader } from "@/components/common/global-header"
import { GlobalFooter } from "@/components/common/global-footer"
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Briefcase, ChevronRight, Loader2, UploadCloud, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CareerDetailClient({ slug, role }: { slug: string, role: any }) {
  const router = useRouter()
  const [showForm, setShowForm] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    portfolio: "",
    motivation: ""
  })
  const [cvFile, setCvFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    toast.success("Application submitted successfully!")
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
              <h1 className="text-3xl font-bold tracking-tighter">Application Submitted!</h1>
              <p className="text-muted-foreground leading-relaxed">
                Thank you for applying for the <span className="text-foreground font-semibold">{role.title}</span> position. We'll review your application and get back to you soon.
              </p>
            </div>
            <button 
              onClick={() => router.push("/careers")}
              className="px-8 py-3 bg-primary text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-xl shadow-primary/20"
            >
              Back to Careers
            </button>
          </div>
        </main>
        <GlobalFooter />
      </div>
    )
  }

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
              onClick={() => router.push('/careers')}
              className="flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md border border-border/40 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Careers
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="relative -mt-24 md:-mt-32 pb-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-background border border-border/40 rounded-sm p-8 md:p-12 space-y-8 shadow-xl shadow-black/[0.03]">
              
              {/* Badge Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
                  Career
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-100">
                  {role.availability}
                </span>
              </div>

              {/* Title */}
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                  {role.icon}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1]">
                  {role.title}
                </h1>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 md:gap-10 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Location</p>
                    <p className="text-sm font-semibold">{role.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Type</p>
                    <p className="text-sm font-semibold">{role.type}</p>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {role.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 bg-secondary/50 rounded-md text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest border border-border/40">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-border/30" />

              {/* About */}
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">About This Role</h2>
                <div className="space-y-4">
                  {role.about.map((p: string, idx: number) => (
                    <p key={idx} className="text-[15px] text-foreground/80 leading-relaxed">{p}</p>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div className="border-t border-border/30" />
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Responsibilities</h2>
                <ul className="space-y-3">
                  {role.responsibilities.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-foreground/80 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-primary/40 mt-1 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="border-t border-border/30" />
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Requirements</h2>
                <ul className="space-y-3">
                  {role.requirements.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-foreground/80 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to Have */}
              <div className="border-t border-border/30" />
              <div className="space-y-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Nice to Have</h2>
                <ul className="space-y-3">
                  {role.niceToHave.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-[15px] text-foreground/60 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-border mt-2 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apply CTA */}
              <div className="border-t border-border/30" />
              
              {!showForm ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-xl shadow-primary/10 active:scale-95"
                  >
                    Submit Application <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border/60 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/20 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back
                  </Link>
                </div>
              ) : (
                /* Application Form */
                <form onSubmit={handleSubmit} className="space-y-8 pt-2">
                  <h2 className="text-xl font-bold tracking-tight">Apply for {role.title}</h2>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> Full Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Your full name"
                      className="w-full bg-secondary/20 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> Email Address
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="w-full bg-secondary/20 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> Portfolio / GitHub
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/yourhandle"
                      className="w-full bg-secondary/20 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                      value={formData.portfolio}
                      onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> Why do you want this role?
                    </label>
                    <textarea
                      required
                      placeholder="Tell us why you're passionate about this opportunity..."
                      className="w-full bg-secondary/20 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all min-h-[120px] resize-none"
                      value={formData.motivation}
                      onChange={e => setFormData({ ...formData, motivation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                      <span className="w-1 h-1 bg-primary rounded-full" /> Upload CV
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center space-y-3 cursor-pointer transition-all",
                        cvFile ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 hover:border-primary/20 bg-secondary/10"
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
                        <div className="space-y-2">
                          <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                            <FileText className="h-5 w-5 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-emerald-600">{cvFile.name}</p>
                          <p className="text-[10px] text-emerald-600/60 uppercase">Ready to submit</p>
                        </div>
                      ) : (
                        <>
                          <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                            <UploadCloud className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-bold text-primary">Click to upload CV</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">PDF, DOC (max 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-background text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-xl shadow-primary/10 disabled:opacity-50 active:scale-95"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                      ) : (
                        <>Submit Application <ChevronRight className="h-4 w-4" /></>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border/60 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-secondary/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  )
}
