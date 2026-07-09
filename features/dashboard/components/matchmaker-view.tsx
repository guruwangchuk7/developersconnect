"use client"

import * as React from "react"
import { Sparkles, Check, Loader2, ArrowRight, UserPlus, Info, ArrowLeft, Users, MessageSquare, FileText, Award, Copy, CheckSquare, Upload, AlertCircle, Brain } from "lucide-react"
import { toast } from "sonner"
import { Profile } from "@/types"

interface MatchmakerViewProps {
  user: any
  handleConnect: (id: string) => void
  getConnectionStatus: (id: string) => string
}

export function MatchmakerView({
  user,
  handleConnect,
  getConnectionStatus
}: MatchmakerViewProps) {
  const [activeTool, setActiveTool] = React.useState<"menu" | "matchmaker" | "resume-studio">("menu")
  
  // --- MATCHMAKER STATES ---
  const [role, setRole] = React.useState("")
  const [skills, setSkills] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [availability, setAvailability] = React.useState("All")
  const [isLoading, setIsLoading] = React.useState(false)
  const [matches, setMatches] = React.useState<any[]>([])
  const [isAI, setIsAI] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)

  // --- RESUME STUDIO STATES ---
  const [resumeText, setResumeText] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisResult, setAnalysisResult] = React.useState<any>(null)
  const [activeAnalysisTab, setActiveAnalysisTab] = React.useState<"analysis" | "resume" | "career">("analysis")
  const [copied, setCopied] = React.useState(false)
  const [analysisError, setAnalysisError] = React.useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // --- MATCHMAKER SUBMIT ---
  const handleMatchmakerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role.trim()) {
      toast.error("Please specify the target role")
      return
    }
    if (!skills.trim()) {
      toast.error("Please enter at least one skill")
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      const response = await fetch("/api/matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.trim(),
          skills: skillsArray,
          description: description.trim(),
          availability
        })
      })

      const data = await response.json()
      if (response.ok) {
        setMatches(data.matches || [])
        setIsAI(!!data.isAI)
        if (data.matches?.length > 0) {
          toast.success(`Found ${data.matches.length} matching developers!`)
        } else {
          toast.info("No candidates matched your search criteria.")
        }
      } else {
        toast.error(data.error || "Failed to retrieve matches")
      }
    } catch (err) {
      console.error(err)
      toast.error("Connection error, please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- RESUME SUBMIT ---
  const handleResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeText.trim()) {
      toast.error("Please enter or upload your resume content")
      return
    }
    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)
    try {
      const response = await fetch("/api/resume-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          profileData: user ? {
            full_name: user.user_metadata?.full_name,
            email: user.email
          } : null
        })
      })
      const data = await response.json()
      if (response.ok) {
        setAnalysisResult(data)
        toast.success("Resume analyzed successfully!")
      } else {
        setAnalysisError(data.error || "Failed to analyze resume")
        toast.error(data.error || "Failed to analyze resume")
      }
    } catch (err) {
      console.error(err)
      setAnalysisError("Error connecting to Resume Studio. Please try again.")
      toast.error("Error connecting to Resume Studio")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileRead = (file: File) => {
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (extension === 'txt' || extension === 'md') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text === 'string') {
          setResumeText(text)
          setUploadedFileName(file.name)
          toast.success(`Loaded resume content from ${file.name}`)
        }
      }
      reader.readAsText(file)
    } else if (extension === 'pdf') {
      toast.info(`Reading PDF file: ${file.name}...`)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Data = e.target?.result
        if (typeof base64Data === 'string') {
          setResumeText(`[PDF_FILE_BASE64]:${file.name}:${base64Data.split(',')[1]}`)
          setUploadedFileName(file.name)
          toast.success(`PDF uploaded successfully! Click "Coach My Resume" to scan it.`)
        }
      }
      reader.readAsDataURL(file)
    } else {
      toast.error("Unsupported file format. Please upload a .txt, .md, or .pdf file.")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileRead(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileRead(file)
    }
  }

  const autofillResumeFromProfile = () => {
    if (!user) {
      toast.error("Please sign in to autofill from profile")
      return
    }
    const fullName = user.user_metadata?.full_name || "Developer"
    const email = user.email || ""
    const draftText = `NAME: ${fullName}\nEMAIL: ${email}\n\nEDUCATION:\n[Add your degree/school here]\n\nTECHNICAL SKILLS:\nProgramming Languages: JavaScript, TypeScript\nFrameworks & Libraries: Next.js, React\n\nEXPERIENCE:\n[Position] | DevelopersConnect Platform\n- Built new collaborative features and integrated dynamic dashboards\n- Managed data loading and cached API queries`
    setResumeText(draftText)
    setUploadedFileName("profile_draft.txt")
    toast.success("Draft created using profile data!")
  }

  const handleRemoveFile = () => {
    setResumeText("")
    setUploadedFileName(null)
    setAnalysisError(null)
    toast.success("Uploaded file removed")
  }

  const handleCopyResume = () => {
    if (!analysisResult?.rewrittenResume) return
    navigator.clipboard.writeText(analysisResult.rewrittenResume)
    setCopied(true)
    toast.success("Rewritten resume copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  // --- RENDER MAIN AI MENU ---
  if (activeTool === "menu") {
    const tools = [
      {
        id: "matchmaker",
        title: "Developer Matchmaker",
        description: "Semantically matches project requirements, stacks, and goals to active developer profiles across Bhutan.",
        icon: Sparkles,
        status: "Active",
        actionLabel: "Launch Matchmaker",
        onClick: () => setActiveTool("matchmaker")
      },
      {
        id: "resume-studio",
        title: "AI Resume Studio",
        description: "Analyze, score, and rewrite your engineering resume according to Harvard format and Google's X-Y-Z guidelines.",
        icon: FileText,
        status: "Active",
        actionLabel: "Coach My Resume",
        onClick: () => setActiveTool("resume-studio")
      }
    ]

    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-background border border-border/40 rounded-sm p-6 hover:border-primary/20 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-primary/5 rounded-sm border border-primary/10 flex items-center justify-center">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{tool.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">
                      {tool.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                </div>
              </div>
              <button
                onClick={tool.onClick}
                className="mt-6 w-full py-2.5 bg-secondary/30 hover:bg-primary hover:text-background text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-background cursor-pointer"
              >
                {tool.actionLabel} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- RENDER DEVELOPER MATCHMAKER ---
  if (activeTool === "matchmaker") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-500">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => setActiveTool("menu")}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to AI Tools Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matchmaker Search Form */}
          <div className="lg:col-span-1 bg-background border border-border/40 rounded-sm p-6 space-y-4 h-fit">
            <h3 className="font-bold text-md flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Project Search
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Find developers using AI semantic search.
            </p>
            <form onSubmit={handleMatchmakerSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Role</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Developer"
                  className="w-full bg-secondary/20 border-none px-3 py-2 rounded-sm text-xs font-medium focus:ring-1 focus:ring-primary/20"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Required Skills</label>
                <input
                  type="text"
                  placeholder="e.g. react, node"
                  className="w-full bg-secondary/20 border-none px-3 py-2 rounded-sm text-xs font-medium focus:ring-1 focus:ring-primary/20"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Availability</label>
                <select
                  className="w-full bg-secondary/20 border-none px-3 py-2 rounded-sm text-xs font-medium focus:ring-1 focus:ring-primary/20 color-scheme-dark"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Details (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Add project context..."
                  className="w-full bg-secondary/20 border-none px-3 py-2 rounded-sm text-xs font-medium focus:ring-1 focus:ring-primary/20 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-background text-[10px] font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Matching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" /> Find Matches
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Matchmaker Search Results */}
          <div className="lg:col-span-2 space-y-4">
            {!hasSearched ? (
              <div className="bg-background border border-border/30 rounded-sm p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Users className="h-8 w-8 text-muted-foreground/30" />
                <h4 className="font-bold text-sm">Ready to Search</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Configure target roles and skills on the left to scan Bhutan developers matching your stack.
                </p>
              </div>
            ) : isLoading ? (
              <div className="bg-background border border-border/30 rounded-sm p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <h4 className="font-bold text-sm">Semantic Profiling in Progress</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Gemini AI is parsing active user bios, experiences, and technical stacks to score alignment...
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-background border border-border/30 rounded-sm p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Info className="h-8 w-8 text-yellow-500/50" />
                <h4 className="font-bold text-sm">No Developers Matched</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  We couldn't find any profiles matching your stack. Try expanding search parameters or adjusting spelling.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Matches Found ({matches.length})
                  </span>
                </div>

                 <div className="space-y-3">
                  {matches.map((candidate) => {
                    const status = getConnectionStatus(candidate.id)
                    return (
                      <div key={candidate.id} className="bg-background border border-border/30 rounded-md p-5 hover:border-primary/20 hover:shadow-sm transition-all flex flex-col md:flex-row gap-5 items-start justify-between">
                        <div className="flex gap-4 items-start">
                          <div className="h-10 w-10 bg-secondary border border-border/10 rounded-full flex items-center justify-center text-xs font-bold uppercase text-primary/60 overflow-hidden shrink-0">
                            {candidate.avatar_url ? (
                              <img src={candidate.avatar_url} alt={candidate.full_name} className="h-full w-full object-cover" />
                            ) : (
                              candidate.full_name?.[0] || '?'
                            )}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-bold text-sm text-foreground/90">{candidate.full_name || "Anonymous"}</h4>
                              <p className="text-xs text-primary/85 font-medium">{candidate.role || "Software Engineer"}</p>
                            </div>
                            {candidate.bio && (
                              <p className="text-xs text-muted-foreground/80 max-w-lg leading-relaxed line-clamp-2">
                                {candidate.bio}
                              </p>
                            )}
                            {candidate.explanation && (
                              <div className="p-2.5 bg-muted/40 rounded-md border border-border/40 flex items-start gap-2 max-w-lg">
                                <Sparkles className="h-3 w-3 text-primary/70 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {candidate.explanation}
                                </p>
                              </div>
                            )}
                            {candidate.skills && Array.isArray(candidate.skills) && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {candidate.skills.slice(0, 5).map((s: string, idx: number) => (
                                  <span key={idx} className="text-[9px] font-bold text-muted-foreground/80 bg-secondary/60 border border-border/15 px-2 py-0.5 rounded-sm">
                                    {s}
                                  </span>
                                ))}
                                {candidate.skills.length > 5 && (
                                  <span className="text-[9px] font-bold text-muted-foreground/60 px-1 py-0.5">
                                    +{candidate.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex md:flex-col items-end justify-between w-full md:w-auto shrink-0 gap-3 border-t md:border-t-0 border-border/20 pt-3 md:pt-0">
                          <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/45">Compatibility</p>
                            <span className="text-lg font-black text-primary/95">
                              {candidate.compatibilityScore}%
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleConnect(candidate.id)}
                            disabled={status === 'CONNECTED' || status === 'PENDING'}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                              status === 'CONNECTED'
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                                : status === 'PENDING'
                                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 cursor-default"
                                : "bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-background hover:border-transparent"
                            }`}
                          >
                            {status === 'CONNECTED' ? (
                              <>
                                <Check className="h-3 w-3" /> Connected
                              </>
                            ) : status === 'PENDING' ? (
                              "Pending"
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" /> Connect
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER AI RESUME STUDIO ---
  if (activeTool === "resume-studio") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-500">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => setActiveTool("menu")}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to AI Tools Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Upload / Input Form */}
          <div className="bg-background border border-border/40 rounded-sm p-6 space-y-5 h-fit">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-md flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" /> Upload Resume
              </h3>
              <button
                type="button"
                onClick={autofillResumeFromProfile}
                className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline cursor-pointer"
              >
                Autofill Draft from Profile
              </button>
            </div>

            <form onSubmit={handleResumeSubmit} className="space-y-4">
              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-sm p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : uploadedFileName
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border/60 hover:border-primary/20 bg-secondary/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt,.md,.pdf"
                  onChange={handleFileChange}
                />
                
                {uploadedFileName ? (
                  <>
                    <CheckSquare className="h-8 w-8 text-emerald-500" />
                    <p className="text-xs font-bold text-emerald-500">{uploadedFileName}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile()
                      }}
                      className="text-[9px] font-bold uppercase text-red-500 tracking-wider hover:underline mt-1"
                    >
                      Remove File
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs font-semibold">Drag & Drop Resume here or click to browse</p>
                    <p className="text-[10px] text-muted-foreground/50">Supports PDF, TXT, or MD formats</p>
                  </>
                )}
              </div>

              {/* Text Area backup */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Or Paste Resume Content</label>
                <textarea
                  rows={10}
                  placeholder="Paste work experience, metrics, educational details..."
                  className="w-full bg-secondary/20 border-none px-3 py-2 rounded-sm text-xs font-medium focus:ring-1 focus:ring-primary/20 resize-none font-mono"
                  value={resumeText.startsWith('[PDF_FILE_BASE64]:') ? "" : resumeText}
                  disabled={!!uploadedFileName && resumeText.startsWith('[PDF_FILE_BASE64]:')}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-primary text-background text-[10px] font-bold uppercase tracking-widest rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Evaluating Resume...
                  </>
                ) : (
                  <>
                    <Award className="h-3 w-3" /> Coach My Resume
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resume Studio Output results */}
          <div className="space-y-4">
            {!analysisResult ? (
              <div className="bg-background border border-border/30 rounded-sm p-12 text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[400px]">
                {analysisError ? (
                  <>
                    <AlertCircle className="h-8 w-8 text-red-500/50" />
                    <h4 className="font-bold text-sm text-red-500">Evaluation Error</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {analysisError}
                    </p>
                  </>
                ) : (
                  <>
                    <Brain className="h-8 w-8 text-muted-foreground/30 animate-pulse" />
                    <h4 className="font-bold text-sm">Resume Coaching Awaiting</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Upload your CV or copy text to scan structure, ATS compliance, and receive rewrite recommendations based on FAANG recruiter guidelines.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-background border border-border/40 rounded-sm p-6 space-y-6 animate-in fade-in duration-500">
                {/* Score indicators grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Overall Score", val: analysisResult.overallScore },
                    { label: "ATS Score", val: analysisResult.atsScore },
                    { label: "Google X-Y-Z", val: analysisResult.googleReadiness },
                    { label: "Harvard format", val: analysisResult.harvardFormat }
                  ].map((score, idx) => (
                    <div key={idx} className="bg-secondary/20 border border-border/10 p-3 rounded-sm text-center">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">{score.label}</p>
                      <p className="text-lg font-black text-primary mt-0.5">{score.val}%</p>
                    </div>
                  ))}
                </div>

                {/* Recruiter Impression text */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Recruiter Impression</h4>
                  <p className="text-xs leading-relaxed text-foreground/80">{analysisResult.recruiterImpression}</p>
                </div>

                {/* Tab layout toggling analysis / rewrite */}
                <div className="flex border-b border-border/30">
                  {[
                    { id: "analysis", label: "Critique details" },
                    { id: "resume", label: "Polished Resume" },
                    { id: "career", label: "Career roadmap" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAnalysisTab(tab.id as any)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer -mb-[1px] ${
                        activeAnalysisTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab contents */}
                {activeAnalysisTab === "analysis" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Strengths</h5>
                        <ul className="space-y-1.5 pl-3 list-disc">
                          {analysisResult.strengths?.map((item: string, idx: number) => (
                            <li key={idx} className="text-xs text-foreground/70">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-bold uppercase tracking-wider text-red-500">Weaknesses</h5>
                        <ul className="space-y-1.5 pl-3 list-disc">
                          {analysisResult.weaknesses?.map((item: string, idx: number) => (
                            <li key={idx} className="text-xs text-foreground/70">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="border-t border-border/10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Missing Sections</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.missingSections?.map((item: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-secondary/40 border border-border/20 px-2 py-0.5 rounded-sm font-semibold">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Suggested Skills</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.missingSkills?.map((item: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-secondary/40 border border-border/20 px-2 py-0.5 rounded-sm font-semibold">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeAnalysisTab === "resume" && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">Polished Draft</span>
                      <button
                        onClick={handleCopyResume}
                        className="px-3 py-1 bg-secondary text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-secondary/80 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy Markdown
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-secondary/10 border border-border/15 p-4 rounded-sm max-h-[300px] overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
                      {analysisResult.rewrittenResume}
                    </div>
                  </div>
                )}

                {activeAnalysisTab === "career" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {analysisResult.careerAnalysis && (
                      <>
                        <div className="space-y-2">
                          <h5 className="text-[9px] font-bold uppercase tracking-wider text-primary">Recommended Roles</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.careerAnalysis.paths?.map((item: string, idx: number) => (
                              <span key={idx} className="text-[10px] bg-primary/5 border border-primary/20 text-primary px-2 py-0.5 rounded-sm font-semibold">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Skills Gaps to Bridge</h5>
                          <ul className="space-y-1.5 pl-3 list-disc">
                            {analysisResult.careerAnalysis.gaps?.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-foreground/70">{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2 border-t border-border/10 pt-4">
                          <h5 className="text-[9px] font-bold uppercase tracking-wider text-primary">Suggested Portfolio projects</h5>
                          <ul className="space-y-1.5 pl-3 list-disc">
                            {analysisResult.careerAnalysis.projects?.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-foreground/70 leading-relaxed font-semibold">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}