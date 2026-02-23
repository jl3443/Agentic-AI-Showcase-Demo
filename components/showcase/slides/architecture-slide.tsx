"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge, type WfZone } from "../workflow-diagram"
import { FileText, Brain, Cpu, Database, ShieldCheck, Play } from "lucide-react"

const ic = "h-3 w-3"

const archNodes: WfNode[] = [
  { id: "input", label: "User Intent", x: 6, y: 50, shape: "circle", category: "io", icon: <FileText className={ic} />, sampleOutput: "The user request or goal that initiates the agent workflow" },
  { id: "planner", label: "Planner", sub: "Task Decomposition", x: 28, y: 30, category: "reasoning", icon: <FileText className={ic} />, sampleOutput: "Breaks complex goals into ordered sub-tasks with dependencies and constraints" },
  { id: "reasoner", label: "Reasoner", sub: "Chain-of-Thought", x: 50, y: 30, category: "reasoning", icon: <Brain className={ic} />, sampleOutput: "LLM-powered reasoning engine using Chain-of-Thought for multi-step decisions" },
  { id: "memory", label: "Memory", sub: "RAG + CAG", x: 28, y: 72, shape: "pill", category: "memory", icon: <Database className={ic} />, sampleOutput: "RAG retrieves from vector stores; CAG caches frequent context for fast reuse" },
  { id: "executor", label: "Executor", sub: "API / Tool Call", x: 72, y: 30, category: "tool", icon: <Cpu className={ic} />, sampleOutput: "Calls external APIs, runs code, or invokes tools to carry out planned actions" },
  { id: "verifier", label: "Verifier", sub: "Validation Gate", x: 72, y: 72, category: "tool", icon: <ShieldCheck className={ic} />, sampleOutput: "Checks outputs against goals, triggers re-planning or human review if needed" },
  { id: "output", label: "Result", x: 94, y: 50, shape: "circle", category: "io", icon: <FileText className={ic} />, sampleOutput: "The verified final response delivered back to the user" },
]

const archEdges: WfEdge[] = [
  { from: "input", to: "planner", route: "h-first" },
  { from: "planner", to: "reasoner" },
  { from: "reasoner", to: "executor" },
  { from: "executor", to: "verifier", route: "v-first" },
  { from: "verifier", to: "output", route: "h-first" },
  { from: "verifier", to: "planner", label: "feedback", dashed: true },
  { from: "memory", to: "reasoner", route: "v-first", label: "retrieve" },
  { from: "executor", to: "memory", label: "store", dashed: true },
]

const archZones: WfZone[] = [
  { label: "Orchestrator Loop", x: 18, y: 8, w: 65, h: 84, color: "#4caf50" },
]

const archChain = ["input", "planner", "memory", "reasoner", "executor", "verifier", "output"]

const details: Record<string, { question: string; desc: string; points: string[] }> = {
  planner: {
    question: "What to do?",
    desc: "Task decomposition and goal planning, breaking complex intents into executable sub-task sequences.",
    points: ["Receive user intent, generate structured plans", "Multi-step planning & dynamic re-planning", "Hard constraints (safety) & soft constraints (cost)"],
  },
  reasoner: {
    question: "How to think?",
    desc: "Core reasoning engine using LLM for chain-of-thought and decision-making.",
    points: ["Chain-of-Thought driven decisions", "Context-aware multi-turn state tracking", "From correlation to causal reasoning"],
  },
  executor: {
    question: "How to act?",
    desc: "Execution layer calling tools, APIs and external services.",
    points: ["API-first, UI-fallback strategy", "Read-Verify-Write operation pattern", "Idempotency, retry backoff, rollback"],
  },
  memory: {
    question: "What to remember?",
    desc: "Governable memory from context window to persistent knowledge stores.",
    points: ["Short-term: conversation context & cache", "Long-term: knowledge graph & vector DB", "TTL management, access control & compliance"],
  },
  verifier: {
    question: "Is it correct?",
    desc: "Validation and quality assurance ensuring outputs meet expectations.",
    points: ["Result verification & consistency checks", "Trigger re-planning when needed", "Human approval & Kill Switch"],
  },
}

export function ArchitectureSlide() {
  const [step, setStep] = useState(-1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advanceStep = useCallback(() => {
    setSelectedNode(null)
    setStep((prev) => {
      if (prev >= archChain.length - 1) { setAutoRunning(false); return -1 }
      return prev + 1
    })
  }, [])

  const startAutoRun = useCallback(() => {
    setSelectedNode(null)
    setStep(0)
    setAutoRunning(true)
  }, [])

  useEffect(() => {
    if (!autoRunning || step < 0) return
    if (step >= archChain.length - 1) { setAutoRunning(false); return }
    autoRef.current = setTimeout(() => setStep(s => s + 1), 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoRunning, step])

  const currentNodeId = step >= 0 ? archChain[step] : selectedNode
  const detail = currentNodeId && details[currentNodeId] ? details[currentNodeId] : null

  return (
    <div className="flex h-full flex-col px-5 pt-3 pb-3 md:px-8 md:pt-4">
      {/* Title bar */}
      <div className="mb-2 flex items-start gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary mt-1.5">01</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground md:text-xl">Five Core Components</h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Every reliable agent--regardless of use case--shares the same anatomy. Missing any one of these, and failure becomes predictable.
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-3 min-h-0">

        {/* Left: component selector */}
        <div className="flex w-[160px] shrink-0 flex-col gap-1">
          {Object.entries(details).map(([id, d]) => (
            <button key={id} onClick={() => { setStep(-1); setAutoRunning(false); setSelectedNode(selectedNode === id ? null : id) }}
              className={cn(
                "rounded-lg border-2 px-3 py-2 text-left transition-all",
                (currentNodeId === id) ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
              )}
            >
              <span className={cn("text-xs font-bold font-mono capitalize", (currentNodeId === id) ? "text-primary" : "text-foreground")}>{id}</span>
              <p className={cn("text-[9px] mt-0.5", (currentNodeId === id) ? "text-primary/70" : "text-muted-foreground")}>{d.question}</p>
            </button>
          ))}
        </div>

        {/* Right: diagram + controls */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <button onClick={step === -1 ? startAutoRun : advanceStep}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10"
            >
              <Play className="h-3 w-3" />
              {step === -1 ? "Run" : step >= archChain.length - 1 ? "Reset" : `Step ${step + 1}/${archChain.length}`}
            </button>
            {autoRunning && <span className="text-[9px] text-muted-foreground animate-pulse">Auto-advancing...</span>}
            {step >= 0 && step < archChain.length && (
              <span className="rounded bg-foreground/5 border border-border px-2 py-0.5 text-[9px] text-foreground font-mono">{archChain[step]}</span>
            )}
            {step === -1 && !autoRunning && (
              <span className="text-[9px] text-muted-foreground">Click Run to auto-step through the data flow</span>
            )}
          </div>

          <div className="flex-1 relative rounded-lg border-2 border-border bg-[#f4f6fa] overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-30" />
            <WorkflowDiagram
              nodes={archNodes}
              edges={archEdges}
              zones={archZones}
              activeChain={step >= 0 ? archChain : selectedNode ? [selectedNode] : undefined}
              activeStep={step >= 0 ? step : selectedNode ? 0 : undefined}
              onNodeClick={(id) => { setSelectedNode(selectedNode === id ? null : id); setStep(-1); setAutoRunning(false) }}
              legend={[
                { label: "Reasoning", category: "reasoning" },
                { label: "Tool/Exec", category: "tool" },
                { label: "Memory", category: "memory" },
              ]}
            />
            {step === -1 && !selectedNode && (
              <div className="absolute bottom-3 left-3 z-20 rounded-lg border-2 border-border bg-background/95 px-2.5 py-1.5">
                <span className="text-[9px] text-muted-foreground font-medium">Click a node or &quot;Run&quot; to explore</span>
              </div>
            )}
          </div>

          {/* Detail panel at bottom */}
          {detail ? (
            <div key={currentNodeId} className="flex items-start gap-4 rounded-lg border-2 border-border bg-card/60 px-3 py-2 slide-enter">
              <div className="shrink-0">
                <h3 className="text-xs font-bold text-foreground font-mono capitalize">{currentNodeId}</h3>
                <span className="text-[9px] italic text-primary/70">{detail.question}</span>
              </div>
              <div className="h-8 w-px bg-border shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">{detail.desc}</p>
              <div className="h-8 w-px bg-border shrink-0" />
              <ul className="flex flex-col gap-1 flex-1">
                {detail.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[9px] text-foreground/70 leading-relaxed">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border-2 border-border bg-card/60 px-3 py-2">
              <span className="text-[9px] font-bold text-muted-foreground">Best for:</span>
              <span className="text-[10px] font-medium text-foreground/80">Any agent system -- these 5 components are universal building blocks</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
