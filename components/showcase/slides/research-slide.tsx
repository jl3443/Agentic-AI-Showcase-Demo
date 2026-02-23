"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge } from "../workflow-diagram"
import {
  Network, RefreshCw, Lightbulb, Inbox, Send, GitBranch,
  Shield, Brain, FileText,
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

export function ResearchSlide() {
  const [visible, setVisible] = useState(false)
  const [nodeHighlight, setNodeHighlight] = useState<string | null>(null)

  useEffect(() => { setVisible(true) }, [])

  useEffect(() => {
    const ids = researchNodes.map((n) => n.id)
    let step = 0
    const timer = setInterval(() => {
      step = (step + 1) % ids.length
      setNodeHighlight(ids[step])
    }, 1800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-full flex-col px-5 pt-4 pb-3 md:px-8 md:pt-5">
      {/* Title */}
      <div className="mb-2 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary">08</span>
        <h2 className="text-lg font-bold text-foreground md:text-xl">{"Next Research Directions"}</h2>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Evolution workflow */}
      <div className="relative h-[30%] shrink-0 rounded-lg border-2 border-border bg-card/40 overflow-hidden mb-2">
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
              "group flex flex-1 flex-col gap-2.5 rounded-lg border-2 border-border bg-card/40 p-3.5 transition-all duration-500 hover:border-primary/30",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ transitionDelay: `${i * 120}ms` }}
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
        "mt-2 rounded-lg border-2 border-primary/30 bg-primary/5 p-2.5 text-center transition-all duration-700",
        visible ? "opacity-100" : "opacity-0"
      )} style={{ transitionDelay: "400ms" }}>
        <p className="text-[11px] text-foreground/80">
          <span className="font-semibold text-primary">Conclusion: </span>
          {"Current learning outcomes provide both theoretical and engineering foundations for going from Agent Demo to enterprise-grade controlled delivery."}
        </p>
      </div>
    </div>
  )
}
