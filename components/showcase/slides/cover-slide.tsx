"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { XCircle, CheckCircle2, ArrowRight, Play } from "lucide-react"

const failurePoints = [
  "Forgets context between turns",
  "Ships wrong answers without validation",
  "Can't scale to multi-agent pipelines",
  "Behavior changes silently with model updates",
]

const systemCapabilities = [
  "Persistent memory (short-term + long-term)",
  "Verifier gates every output before delivery",
  "Orchestrated, governed multi-agent systems",
  "Versioned, auditable, rollback-ready behavior",
]

const journey = [
  { num: "01", label: "Architecture", sub: "5 Core Components" },
  { num: "02", label: "Patterns", sub: "4 Collaboration Modes" },
  { num: "03", label: "Orchestration", sub: "Multi-Agent Systems" },
  { num: "04", label: "Governance", sub: "Lifecycle Control" },
]

/*
  Animation steps:
  0 - tag bar
  1 - headline + subtitle
  2 - demo agent failures
  3 - production capabilities
  4 - journey bar
*/
const TOTAL_STEPS = 5

export function CoverSlide() {
  const [step, setStep] = useState(-1)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startAutoRun = useCallback(() => {
    setStep(0)
    setAutoRunning(true)
  }, [])

  // Auto-start animation on mount
  useEffect(() => {
    const t = setTimeout(() => { setStep(0); setAutoRunning(true) }, 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!autoRunning || step < 0) return
    if (step >= TOTAL_STEPS - 1) { setAutoRunning(false); return }
    autoRef.current = setTimeout(() => setStep(s => s + 1), 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoRunning, step])

  const advanceStep = useCallback(() => {
    setStep(prev => {
      if (prev >= TOTAL_STEPS - 1) { setAutoRunning(false); return -1 }
      return prev + 1
    })
  }, [])

  return (
    <div className="flex h-full flex-col p-8 md:p-10 lg:p-12 gap-4">

      {/* Top tag + run button */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-mono font-bold text-primary tracking-wide transition-all duration-500",
          step >= 0 ? "opacity-100" : "opacity-0"
        )}>
          KNOWLEDGE SHOWCASE
        </span>
        <span className="h-px flex-1 bg-border" />
        <button
          onClick={step === -1 ? startAutoRun : advanceStep}
          className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10 shrink-0"
        >
          <Play className="h-3 w-3" />
          {step === -1 ? "Run" : step >= TOTAL_STEPS - 1 ? "Reset" : `Step ${step + 1}/${TOTAL_STEPS}`}
        </button>
        {autoRunning && <span className="text-[9px] text-muted-foreground animate-pulse">Auto-advancing...</span>}
      </div>

      {/* Main: left headline + right contrast */}
      <div className="flex flex-1 gap-6 lg:gap-10 min-h-0">

        {/* Left column: headline */}
        <div className={cn(
          "flex flex-col justify-center gap-5 w-[38%] shrink-0 transition-all duration-700",
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl xl:text-6xl leading-[1.1]">
              Agentic<br />AI
            </h1>
            <p className="mt-3 text-sm font-medium text-muted-foreground leading-relaxed md:text-base">
              Most agents work in a notebook.
              <br />
              <span className="text-foreground font-semibold">Few survive production.</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed border-l border-primary/30 pl-3">
            A systematic look at the architecture, patterns, and governance that turn an AI demo into a reliable enterprise system.
          </p>
        </div>

        {/* Right column: Demo vs Production contrast */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {/* Demo Agent */}
          <div className={cn(
            "rounded-xl border border-red-200 bg-red-50/50 p-4 flex flex-col transition-all duration-700",
            step >= 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="text-xs font-bold text-red-500 font-mono tracking-wide">DEMO AGENT</span>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1">
              {failurePoints.map((p, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2 text-xs text-red-700/70 transition-all duration-500",
                    step >= 2 ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: step >= 2 ? `${i * 100}ms` : "0ms" }}
                >
                  <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Production System */}
          <div className={cn(
            "rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col transition-all duration-700",
            step >= 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          )}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 font-mono tracking-wide">PRODUCTION SYSTEM</span>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1">
              {systemCapabilities.map((s, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-start gap-2 text-xs text-emerald-700/70 transition-all duration-500",
                    step >= 3 ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: step >= 3 ? `${i * 100}ms` : "0ms" }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom: journey bar */}
      <div className={cn(
        "flex items-center gap-1.5 pt-3 border-t border-border shrink-0 transition-all duration-700",
        step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 pr-2">Today&rsquo;s journey</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
        {journey.map((j, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-1">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 flex-1">
              <span className="text-[9px] font-mono text-primary font-bold">{j.num}</span>
              <div className="h-3 w-px bg-border" />
              <div>
                <div className="text-[10px] font-semibold text-foreground leading-tight">{j.label}</div>
                <div className="text-[8px] text-muted-foreground leading-tight">{j.sub}</div>
              </div>
            </div>
            {i < journey.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}
