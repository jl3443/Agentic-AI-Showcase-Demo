"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge } from "../workflow-diagram"
import {
  Eye, MousePointerClick, LayoutDashboard, Shield, FileText,
  Activity, LogOut, Inbox, Send, GitBranch,
} from "lucide-react"

const ic = "h-3 w-3"

/* UI Agent execution workflow */
const uiNodes: WfNode[] = [
  { id: "in", label: "Input", sub: "Task", x: 5, y: 50, shape: "circle", color: "#5bb98c", icon: <Inbox className={ic} /> },
  { id: "perceive", label: "Perceive", sub: "DOM/Vision", x: 20, y: 50, color: "#d4915c", icon: <Eye className={ic} /> },
  { id: "execute", label: "Execute", sub: "Click/Type", x: 38, y: 30, color: "#6ba3d6", icon: <MousePointerClick className={ic} /> },
  { id: "state", label: "State Check", sub: "Checkpoint", x: 38, y: 70, color: "#8b7ec8", icon: <LayoutDashboard className={ic} /> },
  { id: "ok", label: "Success?", x: 58, y: 50, shape: "diamond", color: "#c8983c", icon: <GitBranch className={ic} /> },
  { id: "evidence", label: "Evidence", sub: "Screenshot+Log", x: 75, y: 30, color: "#5bb98c", icon: <FileText className={ic} /> },
  { id: "security", label: "Security", sub: "RBAC/PII", x: 75, y: 70, color: "#e06060", icon: <Shield className={ic} /> },
  { id: "out", label: "Output", sub: "Result", x: 95, y: 50, shape: "circle", color: "#e06060", icon: <Send className={ic} /> },
]
const uiEdges: WfEdge[] = [
  { from: "in", to: "perceive", animated: true },
  { from: "perceive", to: "execute", animated: true, route: "h-first" },
  { from: "perceive", to: "state", route: "h-first" },
  { from: "execute", to: "ok", animated: true, route: "h-first" },
  { from: "state", to: "ok", route: "h-first" },
  { from: "ok", to: "evidence", label: "Pass", animated: true, route: "h-first" },
  { from: "ok", to: "perceive", label: "Retry", route: "v-first" },
  { from: "evidence", to: "out", animated: true, route: "v-first" },
  { from: "security", to: "out", route: "h-first" },
  { from: "evidence", to: "security", route: "v-first" },
]

const disciplines = [
  { num: "01", label: "Perceive", icon: <Eye className={ic} />, desc: "DOM-first, Hybrid Anchoring fallback, vision last", priority: "High" },
  { num: "02", label: "Execute", icon: <MousePointerClick className={ic} />, desc: "Actions bind to state signals, no fixed waits", priority: "High" },
  { num: "03", label: "State", icon: <LayoutDashboard className={ic} />, desc: "UI as state machine, checkpoint before/after critical actions", priority: "Critical" },
  { num: "04", label: "Security", icon: <Shield className={ic} />, desc: "No hardcoded credentials, RBAC + SoD + PII masking", priority: "Critical" },
  { num: "05", label: "Evidence", icon: <FileText className={ic} />, desc: "Screenshots, action logs, DOM snapshots, replayable", priority: "High" },
  { num: "06", label: "Stability", icon: <Activity className={ic} />, desc: "Regression tests, concurrency limits, env isolation", priority: "Medium" },
  { num: "07", label: "Exit", icon: <LogOut className={ic} />, desc: "Measure value, identify API replacements, safe decommission", priority: "Medium" },
]

const priorityStyle: Record<string, string> = {
  Critical: "bg-[#e0606020] text-[#e06060]",
  High: "bg-[#c8983c20] text-[#c8983c]",
  Medium: "bg-[#6ba3d620] text-[#6ba3d6]",
}

export function UIAgentsSlide() {
  const [nodeHighlight, setNodeHighlight] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const timers = disciplines.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 80 + i * 60)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const ids = uiNodes.map((n) => n.id)
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
        <span className="font-mono text-[10px] tracking-widest text-primary">07</span>
        <h2 className="text-lg font-bold text-foreground md:text-xl">{"UI Agents Engineering Disciplines"}</h2>
        <span className="h-px flex-1 bg-border" />
        <span className="rounded-md border-2 border-[#d4915c30] bg-[#d4915c10] px-2 py-0.5 text-[9px] font-bold font-mono text-[#d4915c]">Transitional capability, not end-state</span>
      </div>

      {/* Top: workflow */}
      <div className="relative h-[38%] shrink-0 rounded-lg border-2 border-border bg-card/40 overflow-hidden mb-2">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <WorkflowDiagram
          nodes={uiNodes}
          edges={uiEdges}
          activeNodeId={nodeHighlight}
          onNodeClick={(id) => setNodeHighlight(id)}
        />
      </div>

      {/* Bottom: 7 discipline cards */}
      <div className="flex-1 grid grid-cols-4 gap-1.5 content-start min-h-0 lg:grid-cols-7">
        {disciplines.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col gap-1 rounded-lg border-2 border-border bg-card/40 p-2.5 transition-all duration-300",
              i < visibleCount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-muted-foreground">{d.num}</span>
              <span className={cn("rounded px-1 py-0.5 text-[7px] font-medium", priorityStyle[d.priority])}>{d.priority}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-primary/70">{d.icon}</span>
              <span className="text-[10px] font-semibold text-foreground">{d.label}</span>
            </div>
            <p className="text-[8px] text-muted-foreground leading-relaxed line-clamp-3">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
