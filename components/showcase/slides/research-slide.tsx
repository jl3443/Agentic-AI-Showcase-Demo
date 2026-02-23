"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge } from "../workflow-diagram"
import {
  Network, RefreshCw, Lightbulb, Inbox, Send, GitBranch,
  Shield, Brain, FileText, Play,
} from "lucide-react"

const ic = "h-3 w-3"

/* Research evolution workflow */
const researchNodes: WfNode[] = [
  { id: "in", label: "Current", sub: "Demo Stage", x: 5, y: 50, shape: "circle", color: "#5bb98c", icon: <Inbox className={ic} /> },
  { id: "protocol", label: "MCP / A2A", sub: "Protocol Collab", x: 25, y: 30, color: "#6ba3d6", icon: <Network className={ic} /> },
  { id: "self", label: "Self-Improve", sub: "Anti-Drift", x: 25, y: 70, color: "#d4915c", icon: <RefreshCw className={ic} /> },
  { id: "causal", label: "Causal AI", sub: "World Model", x: 50, y: 50, color: "#8b7ec8", icon: <Lightbulb className={ic} /> },
  { id: "verify", label: "Verifiable", sub: "Explainable", x: 72, y: 50, color: "#c8983c", icon: <Shield className={ic} /> },
  { id: "out", label: "Enterprise", sub: "Production", x: 95, y: 50, shape: "circle", color: "#e06060", icon: <Send className={ic} /> },
]
const researchEdges: WfEdge[] = [
  { from: "in", to: "protocol", animated: true, route: "h-first" },
  { from: "in", to: "self", animated: true, route: "h-first" },
  { from: "protocol", to: "causal", animated: true, route: "h-first" },
  { from: "self", to: "causal", animated: true, route: "h-first" },
  { from: "causal", to: "verify", animated: true },
  { from: "verify", to: "out", animated: true },
]

const directions = [
  {
    icon: <Network className="h-4 w-4" />,
    tag: "MCP / A2A",
    label: "Protocol-based Collaboration",
    color: "#6ba3d6",
    desc: "How MCP/A2A standards reduce coupling and strengthen governance in multi-agent and multi-tool scenarios.",
    keywords: ["MCP", "A2A Protocol", "Interoperability"],
  },
  {
    icon: <RefreshCw className="h-4 w-4" />,
    tag: "Anti-Drift",
    label: "Controlled Self-Improvement",
    color: "#d4915c",
    desc: "Preventing drift, metric gaming, and feedback contamination in the eval-feedback-update loop.",
    keywords: ["Drift Detection", "Metric Gaming", "Safe Learning"],
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    tag: "Causal AI",
    label: "Causal & World Models",
    color: "#8b7ec8",
    desc: "Upgrading from \"can do\" to \"knows why\" -- enhancing verifiable decision-making in high-risk scenarios.",
    keywords: ["Causal Inference", "World Model", "Explainability"],
  },
]

/*
  Animation steps:
  0 - show title + workflow diagram
  1 - show direction card 1
  2 - show direction card 2
  3 - show direction card 3
  4 - show conclusion
  Total: 5 steps
*/
const TOTAL_STEPS = 5

export function ResearchSlide() {
  const [step, setStep] = useState(-1)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [nodeHighlight, setNodeHighlight] = useState<string | null>(null)

  const startAutoRun = useCallback(() => {
    setStep(0)
    setAutoRunning(true)
  }, [])

  // Auto-start animation on mount
  useEffect(() => {
    const t = setTimeout(() => { setStep(0); setAutoRunning(true) }, 400)
    return () => clearTimeout(t)
  }, [])

  const advanceStep = useCallback(() => {
    setStep(prev => {
      if (prev >= TOTAL_STEPS - 1) { setAutoRunning(false); return -1 }
      return prev + 1
    })
  }, [])

  useEffect(() => {
    if (!autoRunning || step < 0) return
    if (step >= TOTAL_STEPS - 1) { setAutoRunning(false); return }
    autoRef.current = setTimeout(() => setStep(s => s + 1), 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoRunning, step])

  // Node cycling when diagram visible
  useEffect(() => {
    if (step < 0) { setNodeHighlight(null); return }
    const ids = researchNodes.map((n) => n.id)
    let s = 0
    const timer = setInterval(() => {
      s = (s + 1) % ids.length
      setNodeHighlight(ids[s])
    }, 1800)
    return () => clearInterval(timer)
  }, [step])

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-3 md:px-8 md:pt-5">
      {/* Title */}
      <div className="mb-2 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary">08</span>
        <h2 className="text-lg font-bold text-foreground md:text-xl">{"Next Research Directions"}</h2>
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

      {/* Evolution workflow */}
      <div className={cn(
        "relative h-[30%] shrink-0 rounded-lg border border-border bg-card/40 overflow-hidden mb-2 transition-all duration-700",
        step >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        <WorkflowDiagram
          nodes={researchNodes}
          edges={researchEdges}
          activeNodeId={nodeHighlight}
          onNodeClick={(id) => setNodeHighlight(id)}
        />
      </div>

      {/* Direction cards */}
      <div className="flex flex-1 gap-2.5 min-h-0">
        {directions.map((dir, i) => (
          <div
            key={i}
            className={cn(
              "group flex flex-1 flex-col gap-2.5 rounded-lg border border-border bg-card/40 p-3.5 transition-all duration-500 hover:border-primary/30",
              step >= i + 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: dir.color }}>{dir.icon}</span>
              <span className="rounded px-1.5 py-0.5 text-[9px] font-mono font-medium" style={{ backgroundColor: `${dir.color}15`, color: dir.color }}>{dir.tag}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{dir.label}</h3>
            <p className="flex-1 text-[11px] text-muted-foreground leading-relaxed">{dir.desc}</p>
            <div className="flex flex-wrap gap-1">
              {dir.keywords.map((kw, j) => (
                <span key={j} className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{kw}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion */}
      <div className={cn(
        "mt-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-center transition-all duration-700",
        step >= 4 ? "opacity-100" : "opacity-0"
      )}>
        <p className="text-[11px] text-foreground/80">
          <span className="font-semibold text-primary">Conclusion: </span>
          {"Current learning outcomes provide both theoretical and engineering foundations for going from Agent Demo to enterprise-grade controlled delivery."}
        </p>
      </div>
    </div>
  )
}
