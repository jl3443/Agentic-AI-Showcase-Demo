"use client"

import { useState, useCallback } from "react"
import { WorkflowDiagram, type WfNode, type WfEdge, type WfZone } from "@/components/showcase/workflow-diagram"
import { Play, SkipForward, Radio, Eye, Brain, Wrench, ShieldCheck, Inbox, Send, FileText, Database, Settings, Users, Layers } from "lucide-react"

const ic = "h-3 w-3"

/* ── nodes: Orchestrator replaces Risk Diamond ── */
const nodes: WfNode[] = [
  { id: "sensor",       label: "Sensor Data",       x: 5,  y: 50, shape: "circle", category: "io",        icon: <Inbox className={ic} />,       sampleOutput: "vibration: 0.82, temp: 67.3 C" },
  { id: "detect",       label: "Anomaly Detect",     sub: "Process Monitoring",  x: 22, y: 28, category: "reasoning", icon: <Radio className={ic} />,       sampleOutput: "anomaly_score: 0.91 (CRITICAL)" },
  { id: "classify",     label: "Defect Classify",    sub: "Vision + Impact",     x: 22, y: 72, category: "tool",      icon: <Eye className={ic} />,         sampleOutput: 'type: "micro-crack", risk: $120K' },
  { id: "orchestrator", label: "Orchestrator",        sub: "Central Intelligence", x: 44, y: 50, shape: "rect",  category: "decision", icon: <Layers className={ic} />, sampleOutput: "risk: LOW -> auto execute" },
  { id: "auto",         label: "Auto Adjust",         sub: "Line Optimization",   x: 64, y: 25, category: "tool",      icon: <Settings className={ic} />,    sampleOutput: "pressure -= 0.3 bar, MES updated" },
  { id: "human",        label: "Human Review",        sub: "Approval Gate",        x: 64, y: 75, category: "data",      icon: <Users className={ic} />,       sampleOutput: "escalated to supervisor" },
  { id: "quality",      label: "Quality Check",       sub: "Compliance",           x: 82, y: 38, category: "reasoning", icon: <ShieldCheck className={ic} />, sampleOutput: "pass: true, SAP QN created" },
  { id: "mes",          label: "MES Log",                                          x: 82, y: 65, shape: "pill",  category: "memory",    icon: <Database className={ic} />,    sampleOutput: "logged to MES_DB #4721" },
  { id: "report",       label: "Report",                                           x: 95, y: 50, shape: "circle", category: "io",        icon: <Send className={ic} />,        sampleOutput: "QC Pass -- $120K cost avoided" },
]

/* ── edges: Orchestrator is the hub ── */
const edges: WfEdge[] = [
  { from: "sensor",       to: "detect",       route: "h-first" },
  { from: "sensor",       to: "classify",     route: "h-first" },
  { from: "detect",       to: "orchestrator", route: "h-first" },
  { from: "classify",     to: "orchestrator", route: "h-first" },
  { from: "orchestrator", to: "auto",         route: "h-first", label: "Low risk" },
  { from: "orchestrator", to: "human",        route: "h-first", label: "High risk" },
  { from: "auto",         to: "quality",      route: "h-first" },
  { from: "human",        to: "quality",      route: "v-first" },
  { from: "quality",      to: "report",       route: "h-first" },
  { from: "quality",      to: "mes",          route: "v-first" },
  { from: "quality",      to: "detect",       label: "feedback", dashed: true, route: "v-first" },
]

/* ── zone ── */
const zones: WfZone[] = [
  { label: "Agent Orchestration Loop", x: 16, y: 8, w: 72, h: 84, color: "#43a047" },
]

/* ── chain for step-through ── */
const chain = ["sensor", "detect", "classify", "orchestrator", "auto", "quality", "mes", "report"]

const legend: { label: string; category: "reasoning" | "tool" | "memory" | "io" | "decision" | "data" }[] = [
  { label: "Reasoning", category: "reasoning" },
  { label: "Tool/Exec", category: "tool" },
  { label: "Memory", category: "memory" },
  { label: "Orchestrator", category: "decision" },
  { label: "Human Gate", category: "data" },
]

/* ── annotations for each step ── */
const stepAnnotations: Record<string, string> = {
  sensor:       "Real-time sensor streams feed into the system (vibration, temperature, pressure)",
  detect:       "Process Monitoring agent detects deviation in < 1 second using statistical anomaly model",
  classify:     "Defect Intelligence agent classifies defect type via vision model and estimates financial impact",
  orchestrator: "Orchestrator evaluates risk level, applies approval policy, and routes to the correct action path",
  auto:         "Low-risk: Line Optimization agent auto-adjusts parameters without stopping the line",
  quality:      "Quality Compliance agent verifies specs, creates SAP QN and ISO compliance records",
  mes:          "All actions logged to Manufacturing Execution System for full audit trail",
  report:       "Final report generated -- line continues running, $120K cost avoided in 8 seconds",
}

export function WorkflowOverviewSlide() {
  const [step, setStep] = useState(-1)

  const advanceStep = useCallback(() => {
    setStep((prev) => (prev >= chain.length - 1 ? -1 : prev + 1))
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border px-5 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-widest text-primary">05</span>
          <div>
            <h2 className="text-lg font-bold text-foreground text-balance leading-tight">How AI Prevents Scrap Before It Happens</h2>
            <span className="text-[8px] text-muted-foreground">Orchestrator-driven agent pipeline: detection to governed execution in 8 seconds</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={advanceStep}
            className="flex items-center gap-1.5 rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10">
            {step === -1 ? <Play className="h-3 w-3" /> : <SkipForward className="h-3 w-3" />}
            {step === -1 ? "Walk Through" : step >= chain.length - 1 ? "Reset" : `Step ${step + 1}/${chain.length}`}
          </button>
        </div>
      </div>

      {/* Annotation bar */}
      {step >= 0 && step < chain.length && (
        <div className="bg-[#263238] px-5 py-1.5 shrink-0 slide-enter">
          <span className="text-[10px] font-mono text-[#b0bec5]">
            <span className="text-[#4fc3f7] font-bold mr-2">{nodes.find(n => n.id === chain[step])?.label}:</span>
            {stepAnnotations[chain[step]]}
          </span>
        </div>
      )}

      {/* Diagram */}
      <div className="flex-1 min-h-0 p-3">
        <div className="h-full rounded-lg border-2 border-border bg-card/40 overflow-hidden">
          <WorkflowDiagram
            nodes={nodes}
            edges={edges}
            zones={zones}
            legend={legend}
            activeChain={chain}
            activeStep={step}
          />
        </div>
      </div>

      {/* Bottom timeline */}
      <div className="shrink-0 border-t-2 border-border px-5 py-1.5 flex items-center gap-4">
        {[
          { t: "T+0s", label: "Detect", color: "#43a047" },
          { t: "T+2s", label: "Classify", color: "#7e57c2" },
          { t: "T+4s", label: "Orchestrate", color: "#00acc1" },
          { t: "T+6s", label: "Optimize", color: "#00796b" },
          { t: "T+8s", label: "Comply", color: "#1565c0" },
        ].map((item, i, arr) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-muted-foreground font-mono">{item.t} {item.label}</span>
            </div>
            {i < arr.length - 1 && <div className="h-[1px] flex-1 bg-border" />}
          </div>
        ))}
      </div>
    </div>
  )
}
