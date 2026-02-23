"use client"

import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

const journey = [
  { num: "01", label: "Architecture", sub: "5 Core Components" },
  { num: "02", label: "Patterns", sub: "4 Collaboration Modes" },
  { num: "03", label: "Orchestration", sub: "Multi-Agent Systems" },
  { num: "04", label: "Governance", sub: "Lifecycle Control" },
]

export function CoverSlide() {
  return (
    <div className="flex h-full flex-col p-8 md:p-10 lg:p-12 gap-6">

      {/* Top tag */}
      <div className="flex items-center gap-2 shrink-0 animate-fade-in">
        <span className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-mono font-bold text-primary tracking-wide">
          KNOWLEDGE SHOWCASE
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Main: centered headline */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 min-h-0 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-foreground lg:text-6xl xl:text-7xl leading-[1.08]">
            Agentic AI
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground leading-relaxed md:text-lg">
            Most agents work in a notebook.{" "}
            <span className="text-foreground font-semibold">Few survive production.</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            A systematic look at the architecture, patterns, and governance that turn an AI demo into a reliable enterprise system.
          </p>
        </div>
      </div>

      {/* Bottom: journey bar */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-border shrink-0 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 pr-2">Today&rsquo;s journey</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
        {journey.map((j, i) => (
          <div key={i} className="flex items-center gap-1.5 flex-1">
            <div className={cn("flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 py-1.5 flex-1 animate-fade-in")} style={{ animationDelay: `${550 + i * 60}ms` }}>
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
