"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Shield, Play, Eye, FileCheck, GitBranch, Power,
  Users, ChevronRight, Layers,
} from "lucide-react"

/* ── Lifecycle stages (main flow) ── */
interface Stage { id: string; label: string; sub: string; icon: React.ReactNode; systemLabel: string }
const stages: Stage[] = [
  { id: "define",  label: "Define Policy",  sub: "What AI is allowed to do",               icon: <Shield className="h-3.5 w-3.5" />,    systemLabel: "Policy Engine" },
  { id: "execute", label: "Execute",        sub: "Autonomous action within boundaries",     icon: <Play className="h-3.5 w-3.5" />,      systemLabel: "Agent Runtime" },
  { id: "observe", label: "Observe",        sub: "Track every decision in real time",       icon: <Eye className="h-3.5 w-3.5" />,       systemLabel: "Observability Stack" },
  { id: "audit",   label: "Audit",          sub: "Explain and verify behavior",             icon: <FileCheck className="h-3.5 w-3.5" />, systemLabel: "Compliance Log" },
  { id: "improve", label: "Improve",        sub: "Version, test, and safely redeploy",      icon: <GitBranch className="h-3.5 w-3.5" />, systemLabel: "Prompt/Tool Config" },
]

/* ── Governance capabilities ── */
interface Capability {
  id: string; label: string; icon: React.ReactNode
  stageId: string
  what: string; why: string; without: string; withIt: string
  example: string
  artifacts: string[]
}
const capabilities: Capability[] = [
  {
    id: "permission", label: "AI Permission Control", icon: <Shield className="h-3 w-3" />,
    stageId: "define",
    what: "Defines which actions an agent is allowed to execute.",
    why: "Prevents unsafe or unauthorized autonomous behavior.",
    without: "AI can call any tool or modify any system.",
    withIt: "AI operates within enterprise-defined boundaries.",
    example: "Financial approval agent blocked from sending payment due to missing policy.",
    artifacts: ["Action allowlist", "Data access scope", "Role-based autonomy"],
  },
  {
    id: "escalation", label: "Human Escalation Rules", icon: <Users className="h-3 w-3" />,
    stageId: "define",
    what: "Sets conditions under which AI must hand off to a human.",
    why: "Ensures critical decisions remain under human oversight.",
    without: "AI auto-executes all decisions, including high-risk ones.",
    withIt: "High-stakes actions require human approval before execution.",
    example: "Production line shutdown paused for plant manager approval.",
    artifacts: ["Risk-tier thresholds", "Approval routing matrix", "Timeout policies"],
  },
  {
    id: "observability", label: "Decision Observability", icon: <Eye className="h-3 w-3" />,
    stageId: "observe",
    what: "Tracks every agent decision with full input/output trace.",
    why: "Makes autonomous systems transparent and debuggable.",
    without: "No visibility into why AI made a specific decision.",
    withIt: "Every reasoning step and tool call is logged with context.",
    example: "Traced anomaly detection to sensor #4721 vibration spike at 14:32.",
    artifacts: ["Decision trace", "Tool usage log", "Latency & cost metrics"],
  },
  {
    id: "audit", label: "Audit Trail & Compliance", icon: <FileCheck className="h-3 w-3" />,
    stageId: "audit",
    what: "Generates immutable compliance records for every agent action.",
    why: "Satisfies regulatory requirements and enables post-incident review.",
    without: "No proof of what AI did, when, or why.",
    withIt: "Full audit trail with timestamps, reasoning, and outcomes.",
    example: "Generated ISO 9001 compliance report for Q1 autonomous QC actions.",
    artifacts: ["Compliance reports", "Regulatory mapping", "Incident reconstruction"],
  },
  {
    id: "versioning", label: "Version & Change Management", icon: <GitBranch className="h-3 w-3" />,
    stageId: "improve",
    what: "Versions prompts, tools, policies, and models as a single deployable unit.",
    why: "Enables safe rollback and controlled updates to AI behavior.",
    without: "Changes to AI behavior are untraceable and irreversible.",
    withIt: "Every change is versioned, testable, and rollback-ready.",
    example: "Rolled back prompt v2.3 after 5% accuracy drop in defect classification.",
    artifacts: ["Prompt version", "Tool version", "Policy version", "Model version"],
  },
  {
    id: "safety", label: "Runtime Safety & Kill Switch", icon: <Power className="h-3 w-3" />,
    stageId: "execute",
    what: "Provides runtime override, sandbox mode, and emergency stop.",
    why: "Guarantees humans can always regain control of autonomous systems.",
    without: "No way to stop a misbehaving agent in real time.",
    withIt: "One-click kill switch with graceful shutdown and state preservation.",
    example: "Kill switch activated after agent entered unexpected feedback loop.",
    artifacts: ["Rollback trigger", "Runtime override", "Sandbox mode"],
  },
]

/* ── Capability → Stage mapping ── */
const capStageMap = new Map(capabilities.map(c => [c.id, c.stageId]))

/* ── Component ── */
export function GovernanceSlide() {
  const [mode, setMode] = useState<"learning" | "system">("learning")
  const [activeCap, setActiveCap] = useState<string | null>(null)
  const cap = activeCap ? capabilities.find(c => c.id === activeCap) : null
  const highlightStage = cap ? capStageMap.get(cap.id) : null

  return (
    <div className="flex h-full flex-col px-5 pt-3 pb-3 md:px-8 md:pt-4">
      {/* ── Title bar ── */}
      <div className="mb-2 flex items-start gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary mt-1.5">04</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground md:text-xl leading-tight">Control, Observe, Improve</h2>
            <span className="h-px flex-1 bg-border" />
            {/* Toggle */}
            <div className="flex rounded-lg border-2 border-border overflow-hidden shrink-0">
              <button onClick={() => setMode("learning")}
                className={cn("px-2.5 py-1 text-[9px] font-medium transition-colors", mode === "learning" ? "bg-primary text-primary-foreground" : "bg-card/40 text-muted-foreground hover:bg-secondary/50")}>
                Learning Mode
              </button>
              <button onClick={() => setMode("system")}
                className={cn("px-2.5 py-1 text-[9px] font-medium transition-colors", mode === "system" ? "bg-primary text-primary-foreground" : "bg-card/40 text-muted-foreground hover:bg-secondary/50")}>
                System Mapping
              </button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Architecture and patterns define what an agent <em>can</em> do. Governance defines what it <em>should</em> do—and proves it.
          </p>
        </div>
      </div>

      {/* ── Lifecycle flow ── */}
      <div className="relative mb-2 rounded-lg border-2 border-border bg-card/30 px-3 py-2">
        <div className="flex items-center justify-center gap-1">
          {stages.map((s, i) => {
            const isHl = highlightStage === s.id
            return (
              <div key={s.id} className="flex items-center gap-1">
                <div className={cn(
                  "flex items-center gap-1.5 rounded-lg border-2 px-2 py-1.5 transition-all duration-400 max-w-[170px]",
                  isHl
                    ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(var(--primary-rgb,34,139,34),0.15)]"
                    : "border-border bg-card/50"
                )}>
                  <span className={cn("shrink-0 transition-colors", isHl ? "text-primary" : "text-muted-foreground")}>{s.icon}</span>
                  <div className="min-w-0">
                    <div className={cn("text-[8px] font-bold leading-tight truncate", isHl ? "text-primary" : "text-foreground/80")}>{s.label}</div>
                    <div className="text-[7px] text-muted-foreground leading-tight truncate">
                      {mode === "system" ? s.systemLabel : s.sub}
                    </div>
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
        {/* Loop-back arrow hint */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[7px] text-muted-foreground/50">
          <span className="h-px w-6 bg-muted-foreground/30" />
          <span>continuous loop</span>
          <span className="h-px w-6 bg-muted-foreground/30" />
        </div>
      </div>

      {/* ── Main content: left nav + right panel ── */}
      <div className="flex flex-1 gap-3 min-h-0">
        {/* Left: Governance Capabilities */}
        <div className="w-[190px] shrink-0 flex flex-col gap-0.5">
          <span className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 px-1">Governance Capabilities</span>
          {capabilities.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCap(activeCap === c.id ? null : c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border-2 px-2 py-1 text-left transition-all",
                activeCap === c.id
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-card/40 hover:bg-secondary/50"
              )}
            >
              <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded text-[7px] font-bold font-mono",
                activeCap === c.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              )}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("shrink-0", activeCap === c.id ? "text-primary" : "text-muted-foreground")}>{c.icon}</span>
              <span className={cn("text-[9px] font-medium leading-tight", activeCap === c.id ? "text-primary" : "text-foreground/70")}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Detail panel */}
        <div className="flex-1 rounded-lg border-2 border-border bg-card/30 overflow-hidden">
          {cap ? (
            <div className="h-full flex flex-col p-3 overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-300" key={cap.id}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary">{cap.icon}</span>
                <h3 className="text-[11px] font-bold text-foreground">{cap.label}</h3>
                <span className="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-[7px] font-mono text-primary">
                  maps to: {stages.find(s => s.id === cap.stageId)?.label}
                </span>
              </div>

              {/* What / Why */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="rounded-lg border border-border bg-card/50 p-2">
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">What it does</div>
                  <div className="text-[8px] text-foreground/80 leading-relaxed">{cap.what}</div>
                </div>
                <div className="rounded-lg border border-border bg-card/50 p-2">
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Why it matters</div>
                  <div className="text-[8px] text-foreground/80 leading-relaxed">{cap.why}</div>
                </div>
              </div>

              {/* Without vs With */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="rounded-lg border border-red-200 bg-red-50/30 p-2">
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-red-500/70 mb-0.5">Without it</div>
                  <div className="text-[8px] text-foreground/70 leading-relaxed">{cap.without}</div>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-2">
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-emerald-600/70 mb-0.5">With it in place</div>
                  <div className="text-[8px] text-foreground/70 leading-relaxed">{cap.withIt}</div>
                </div>
              </div>

              {/* Artifacts + Example side by side */}
              <div className="grid grid-cols-2 gap-1.5 mt-auto">
                <div className="rounded-lg border border-border bg-card/50 p-2">
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Enterprise Artifacts</div>
                  <div className="flex flex-wrap gap-1">
                    {cap.artifacts.map((a, i) => (
                      <span key={i} className="rounded-md border border-border bg-card/60 px-1.5 py-0.5 text-[7px] text-foreground/70 font-mono">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/30 p-2">
                  <div className="text-[7px] font-semibold uppercase tracking-wider text-amber-600/70 mb-0.5">Real-world example</div>
                  <div className="text-[8px] text-foreground/70 italic leading-relaxed">{`"${cap.example}"`}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
              <Layers className="h-8 w-8 mb-2" />
              <span className="text-[10px]">Select a capability to explore</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom message ── */}
      <div className="mt-1.5 flex items-center justify-center gap-4 rounded-lg border-2 border-primary/20 bg-primary/5 py-2 px-4">
        <span className="text-xs text-foreground/60 font-medium">Autonomy without governance is a demo.</span>
        <span className="h-4 w-px bg-primary/20" />
        <span className="text-xs text-primary font-bold">Autonomy with governance is an enterprise system.</span>
      </div>
    </div>
  )
}
