"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge } from "../workflow-diagram"
import { Users, Brain, Cpu, Database, ShieldCheck, Inbox, Send, BarChart3, MessageSquare, Play } from "lucide-react"

const ic = "h-3 w-3"

type ArchMode = "centralized" | "distributed"

/* ── Centralized workflow ── */
const centralNodes: WfNode[] = [
  { id: "in",  label: "Input",      x: 5,  y: 50, shape: "circle", color: "#5bb98c", icon: <Inbox className={ic} /> },
  { id: "sup", label: "Supervisor", sub: "Orchestrator",  x: 28, y: 50, color: "#d4915c", icon: <Users className={ic} /> },
  { id: "a",   label: "Agent A",    sub: "Data Proc",     x: 52, y: 18, color: "#6ba3d6", icon: <Database className={ic} /> },
  { id: "b",   label: "Agent B",    sub: "Reasoning",     x: 52, y: 50, color: "#8b7ec8", icon: <Brain className={ic} /> },
  { id: "c",   label: "Agent C",    sub: "Execution",     x: 52, y: 82, color: "#5bb98c", icon: <Cpu className={ic} /> },
  { id: "agg", label: "Aggregate",  sub: "Merge Results", x: 75, y: 50, color: "#c8983c", icon: <BarChart3 className={ic} /> },
  { id: "gate",label: "Verify",     sub: "Quality Gate",  x: 88, y: 50, color: "#8b7ec8", icon: <ShieldCheck className={ic} /> },
  { id: "out", label: "Output",     x: 95, y: 18, shape: "circle", color: "#e06060", icon: <Send className={ic} /> },
]
const centralEdges: WfEdge[] = [
  { from: "in",   to: "sup",  animated: true },
  { from: "sup",  to: "a",   animated: true, route: "h-first" },
  { from: "sup",  to: "b",   animated: true, route: "h-first" },
  { from: "sup",  to: "c",   animated: true, route: "h-first" },
  { from: "a",    to: "agg", route: "h-first" },
  { from: "b",    to: "agg", route: "h-first" },
  { from: "c",    to: "agg", route: "h-first" },
  { from: "agg",  to: "gate", animated: true },
  { from: "gate", to: "out", animated: true, route: "h-first" },
  { from: "gate", to: "sup", label: "retry", route: "v-first" },
]
const centralChain = ["in", "sup", "a", "b", "c", "agg", "gate", "out"]

/* ── Distributed workflow ── */
const distNodes: WfNode[] = [
  { id: "in",        label: "Input",        x: 5,  y: 50, shape: "circle", color: "#5bb98c",  icon: <Inbox className={ic} /> },
  { id: "a",         label: "Agent A",      sub: "Autonomous", x: 30, y: 25, color: "#d4915c", icon: <Brain className={ic} /> },
  { id: "b",         label: "Agent B",      sub: "Autonomous", x: 55, y: 25, color: "#6ba3d6", icon: <Brain className={ic} /> },
  { id: "c",         label: "Agent C",      sub: "Autonomous", x: 30, y: 75, color: "#8b7ec8", icon: <Brain className={ic} /> },
  { id: "d",         label: "Agent D",      sub: "Autonomous", x: 55, y: 75, color: "#5bb98c", icon: <Brain className={ic} /> },
  { id: "bus",       label: "Message Bus",  sub: "P2P Mesh",   x: 42, y: 50, shape: "pill", color: "#c8983c", icon: <MessageSquare className={ic} /> },
  { id: "consensus", label: "Consensus",    sub: "Conflict Resolution", x: 78, y: 50, color: "#e06060", icon: <ShieldCheck className={ic} /> },
  { id: "out",       label: "Output",       x: 95, y: 50, shape: "circle", color: "#e06060", icon: <Send className={ic} /> },
]
const distEdges: WfEdge[] = [
  { from: "in",        to: "a",         animated: true, route: "h-first" },
  { from: "in",        to: "c",         animated: true, route: "h-first" },
  { from: "a",         to: "bus",       animated: true, route: "v-first" },
  { from: "b",         to: "bus",       route: "v-first" },
  { from: "c",         to: "bus",       route: "v-first" },
  { from: "d",         to: "bus",       route: "v-first" },
  { from: "bus",       to: "b",         route: "h-first" },
  { from: "bus",       to: "d",         route: "h-first" },
  { from: "bus",       to: "consensus", animated: true },
  { from: "consensus", to: "out",       animated: true },
]
const distChain = ["in", "a", "c", "bus", "b", "d", "consensus", "out"]

const archData: Record<ArchMode, {
  title: string
  nodes: WfNode[]
  edges: WfEdge[]
  chain: string[]
  desc: string
  pros: string[]
  cons: string[]
  whenToUse: string
}> = {
  centralized: {
    title: "Centralized / Hierarchical",
    nodes: centralNodes,
    edges: centralEdges,
    chain: centralChain,
    desc: "A Supervisor controls global routing and decision-making. Agents receive dispatched sub-tasks.",
    pros: ["Strong controllability & consistency", "Clear permission boundaries", "Audit-friendly, easy to trace"],
    cons: ["Supervisor becomes a bottleneck at scale", "Single point of failure"],
    whenToUse: "Regulated domains, financial workflows, anywhere auditability matters more than throughput",
  },
  distributed: {
    title: "Distributed / Swarm",
    nodes: distNodes,
    edges: distEdges,
    chain: distChain,
    desc: "Agents communicate peer-to-peer. No central coordinator — emergent collaboration via message bus.",
    pros: ["High scalability, no single bottleneck", "Resilient to individual agent failure"],
    cons: ["Governance is much harder", "Conflict resolution adds complexity"],
    whenToUse: "High-throughput simulation, parallel research, scenarios where no single agent holds all context",
  },
}

export function OrchestrationSlide() {
  const [mode, setMode] = useState<ArchMode>("centralized")
  const [step, setStep] = useState(-1)
  const arch = archData[mode]

  const advanceStep = useCallback(() => {
    setStep((prev) => (prev >= arch.chain.length - 1 ? -1 : prev + 1))
  }, [arch.chain.length])

  const handleModeSwitch = (m: ArchMode) => {
    setMode(m)
    setStep(-1)
  }

  const activeNodeId = step >= 0 ? arch.chain[step] : null

  return (
    <div className="flex h-full flex-col px-5 pt-3 pb-3 md:px-8 md:pt-4">

      {/* Title */}
      <div className="mb-2 flex items-start gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary mt-1.5">03</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground md:text-xl">When One Agent Isn&rsquo;t Enough</h2>
            <span className="h-px flex-1 bg-border" />
            {/* Mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border-2 border-border bg-secondary/50 p-0.5 shrink-0">
              {(["centralized", "distributed"] as ArchMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeSwitch(m)}
                  className={cn(
                    "rounded-md px-3 py-1 text-[10px] font-bold font-mono transition-all",
                    mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {archData[m].title}
                </button>
              ))}
            </div>
          </div>
          {/* Key insight as subtitle */}
          <p className="text-[11px] text-muted-foreground mt-0.5">
            <span className="font-semibold text-foreground/70">Key principle: </span>
            Agents handle &ldquo;how&rdquo;. Orchestrators handle &ldquo;when, who, and what if failure&rdquo;.
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-3 min-h-0">

        {/* Workflow diagram */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={advanceStep}
              className="flex items-center gap-1.5 rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10"
            >
              <Play className="h-3 w-3" />
              {step === -1 ? "Step Through" : step >= arch.chain.length - 1 ? "Reset" : `Next (${step + 1}/${arch.chain.length})`}
            </button>
            {step >= 0 && step < arch.chain.length && (
              <span className="rounded bg-[#263238] px-2 py-0.5 text-[9px] text-[#e0e0e0] font-mono">{arch.chain[step]}</span>
            )}
          </div>
          <div className="flex-1 relative rounded-lg border-2 border-border bg-card/40 overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-20" />
            <WorkflowDiagram
              key={mode}
              nodes={arch.nodes}
              edges={arch.edges}
              activeNodeId={activeNodeId ?? undefined}
              onNodeClick={(id) => {
                const idx = arch.chain.indexOf(id)
                if (idx !== -1) setStep(idx)
              }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[220px] shrink-0 hidden lg:flex flex-col gap-2">
          <div className="rounded-lg border-2 border-border bg-card/40 p-3">
            <p className="text-xs text-foreground/80 leading-relaxed">{arch.desc}</p>
          </div>

          <div className="rounded-lg border-2 border-[#5bb98c40] bg-[#5bb98c08] p-2.5">
            <h4 className="text-[10px] font-semibold text-[#5bb98c] mb-1.5">Pros</h4>
            <ul className="flex flex-col gap-1">
              {arch.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-foreground/70">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#5bb98c]" />{p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border-2 border-[#e0606040] bg-[#e0606008] p-2.5">
            <h4 className="text-[10px] font-semibold text-[#e06060] mb-1.5">Watch out for</h4>
            <ul className="flex flex-col gap-1">
              {arch.cons.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-foreground/70">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#e06060]" />{c}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-2.5">
            <h4 className="text-[10px] font-semibold text-primary mb-1">When to choose this</h4>
            <p className="text-[10px] text-primary/80 leading-relaxed">{arch.whenToUse}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
