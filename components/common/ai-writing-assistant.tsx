"use client"

import * as React from "react"
import { Sparkles, Loader2, Wand2, Rocket, Minimize2, CheckCheck } from "lucide-react"
import { toast } from "sonner"

interface AIWritingAssistantProps {
  contentType: string
  currentText: string
  onReplaceText: (text: string) => void
}

export function AIWritingAssistant({
  contentType,
  currentText,
  onReplaceText
}: AIWritingAssistantProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isOptimizing, setIsOptimizing] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Mapping readable content types for the prompt context
  const getCleanContentType = (type: string) => {
    switch (type) {
      case "post-update": return "Post Update"
      case "dev-needed": return "Developers Needed"
      case "ask-help": return "Ask Help"
      case "share-project": return "Share Project"
      case "organize-event": return "Organize Event"
      default: return type
    }
  }

  const handleOptimize = async (mode: string) => {
    setIsOpen(false)
    if (!currentText || !currentText.trim()) {
      toast.error("Please enter some text before using the AI assistant.")
      return
    }

    setIsOptimizing(true)
    const cleanType = getCleanContentType(contentType)

    try {
      const response = await fetch("/api/writing-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText: currentText.trim(),
          contentType: cleanType,
          writingMode: mode
        }),
      })

      const data = await response.json()
      if (response.ok && data.outputText) {
        onReplaceText(data.outputText)
        toast.success(`Text optimized using "${mode}"!`)
      } else {
        toast.error(data.error || "Failed to optimize content.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error connecting to AI Writing Assistant.")
    } finally {
      setIsOptimizing(false)
    }
  }

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const modes = [
    { label: "Improve Writing", icon: Wand2, value: "Improve Writing" },
    { label: "More Engaging", icon: Rocket, value: "Engaging" },
    { label: "Shorten", icon: Minimize2, value: "Shorten" },
    { label: "Fix Grammar", icon: CheckCheck, value: "Fix Grammar" }
  ]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isOptimizing}
        className={`p-2.5 rounded-full hover:bg-secondary transition-all flex items-center justify-center ${
          isOptimizing ? "text-primary bg-secondary/50 animate-pulse" : "text-muted-foreground hover:text-primary"
        }`}
        title="AI Writing Assistant"
      >
        {isOptimizing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-12 mb-1 w-48 bg-background border border-border/80 rounded-sm shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-3 py-1.5 border-b border-border/20 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">AI Writing Assistant</span>
          </div>
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => handleOptimize(mode.value)}
                className="w-full text-left px-4 py-2 hover:bg-secondary/40 text-[11px] font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors flex items-center gap-2.5 group"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                {mode.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
