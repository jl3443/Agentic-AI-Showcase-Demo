"use client"

import { cn } from "@/lib/utils"
import {
  Boxes, GitFork, Network, ShieldCheck, MonitorSmartphone,
  ArrowRight, Workflow, CheckCircle2,
} from "lucide-react"

const sections = [
  {
    num: "01",
    icon: Boxes,
    title: "Five Core Components",
    summary: "Every production agent needs a Planner, Reasoner, Executor, Memory (RAG/CAG), and Verifier. Missing any one creates predictable failure modes.",
    keyPoints: ["Planner decomposes goals into sub-tasks", "Memory combines RAG retrieval with CAG caching", "Verifier gates every output before delivery"],
  },
  {
    num: "02",
    icon: GitFork,
    title: "Collaboration Patterns",
    summary: "Four patterns cover the complexity spectrum: ReAct for simple lookups, Tool Use for parallel execution, Planning for multi-step tasks, and Reflection for quality-critical work.",
    keyPoints: ["ReAct: Reason + Act loop for single-tool chains", "Planning: decompose, execute, re-plan", "Reflection: self-critique improves output quality"],
  },
  {
    num: "03",
    icon: Network,
    title: "Multi-Agent Orchestration",
    summary: "Supervisors coordinate specialized agents through hierarchical delegation patterns, enabling complex workflows while maintaining governance boundaries.",
    keyPoints: ["Supervisor routes tasks to specialist agents", "Hierarchical delegation with fallback paths", "Shared context via message-passing protocols"],
  },
  {
    num: "04",
    icon: ShieldCheck,
    title: "Governance & Control",
    summary: "Production governance follows a continuous loop: Define Policy, Execute within boundaries, Observe decisions, Audit behavior, and Improve through versioned redeployment.",
    keyPoints: ["Permission control and escalation rules", "Decision observability and audit trails", "Versioned, rollback-ready deployments"],
  },
  {
    num: "05",
    icon: Workflow,
    title: "AI-Powered Workflows",
    summary: "Industrial AI systems combine defect detection, root-cause analysis, and corrective action to prevent quality failures before they reach production.",
    keyPoints: ["Real-time anomaly detection at the edge", "Automated root-cause analysis pipelines", "Continuous feedback loop for model improvement"],
  },
  {
    num: "06",
    icon: MonitorSmartphone,
    title: "UI Agents",
    summary: "Browser and UI agents automate screen-level interactions through perception, grounding, and action pipelines -- a transitional capability bridging toward API-first architectures.",
    keyPoints: ["Screen perception via vision models", "DOM grounding for precise element targeting", "Transitional bridge to native API integrations"],
  },
]

const takeaways = [
  "Architecture before code -- design the 5 components first, then implement",
  "Choose patterns by task complexity, not by trend",
  "Governance is not optional -- it is what separates demos from production",
  "Memory (RAG + CAG) is the most underinvested component in most agent systems",
]

export function ResearchSlide() {
  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-3 md:px-8 md:pt-5">
      {/* Title */}
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary">08</span>
        <h2 className="text-lg font-bold text-foreground md:text-xl">Executive Summary</h2>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        From demo to production: a systematic framework covering architecture, patterns, orchestration, and governance for enterprise-grade agentic AI systems.
      </p>

      {/* Section summary grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 flex-1 min-h-0 mb-3">
        {sections.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="flex flex-col gap-2 rounded-lg bg-secondary/30 p-3 overflow-hidden">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9px] font-mono text-primary font-bold">{s.num}</span>
                  <h3 className="text-xs font-semibold text-foreground truncate">{s.title}</h3>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">{s.summary}</p>
              <ul className="flex flex-col gap-1">
                {s.keyPoints.map((p, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-[9px] text-foreground/60 leading-relaxed">
                    <ArrowRight className="h-2.5 w-2.5 mt-0.5 shrink-0 text-primary/40" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Key takeaways */}
      <div className="rounded-lg bg-primary/5 p-3">
        <h3 className="text-[10px] font-mono font-bold text-primary tracking-widest mb-2">KEY TAKEAWAYS</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {takeaways.map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-relaxed">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
