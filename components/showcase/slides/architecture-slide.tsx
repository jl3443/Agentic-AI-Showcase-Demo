"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge, type WfZone } from "../workflow-diagram"
import { FileText, Brain, Cpu, Database, ShieldCheck, Play } from "lucide-react"

const ic = "h-3 w-3"

const archNodes: WfNode[] = [
  { id: "input", label: "User Intent", x: 6, y: 50, shape: "circle", category: "io", icon: <FileText className={ic} />, sampleOutput: '"Analyze Q1 sales data"' },
  { id: "planner", label: "Planner", sub: "Task Decomposition", x: 28, y: 30, category: "reasoning", icon: <FileText className={ic} />, sampleOutput: '["fetch_data", "analyze", "report"]' },
  { id: "reasoner", label: "Reasoner", sub: "Chain-of-Thought", x: 50, y: 30, category: "reasoning", icon: <Brain className={ic} />, sampleOutput: "CoT: step1→step2→step3" },
  { id: "memory", label: "Memory", sub: "Vector + KG", x: 28, y: 72, shape: "pill", category: "memory", icon: <Database className={ic} />, sampleOutput: "retrieved 8 relevant docs" },
  { id: "executor", label: "Executor", sub: "API / Tool Call", x: 72, y: 30, category: "tool", icon: <Cpu className={ic} />, sampleOutput: '{ api: "sales/q1", status: 200 }' },
  { id: "verifier", label: "Verifier", sub: "Validation Gate", x: 72, y: 72, category: "tool", icon: <ShieldCheck className={ic} />, sampleOutput: "pass: true, confidence: 0.94" },
  { id: "output", label: "Result", x: 94, y: 50, shape: "circle", category: "io", icon: <FileText className={ic} />, sampleOutput: '"Q1 sales grew 12% YoY"' },
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

  const advanceStep = useCallback(() => {
    setSelectedNode(null)
    setStep((prev) => {
      if (prev >= archChain.length - 1) return -1
      return prev + 1
    })
  }, [])

  const currentNodeId = step >= 0 ? archChain[step] : selectedNode
  const detail = currentNodeId && details[currentNodeId] ? details[currentNodeId] : null

  return (
    <div className="flex h-full flex-col px-5 pt-3 pb-3 md:px-8 md:pt-4">
      <div className="mb-1 flex items-start gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary mt-1.5">01</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground md:text-xl">Five Core Components</h2>
            <span className="h-px flex-1 bg-border" />
            <button
              onClick={advanceStep}
              className="flex items-center gap-1.5 rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10 shrink-0"
            >
              <Play className="h-3 w-3" />
              {step === -1 ? "Run Flow" : step >= archChain.length - 1 ? "Reset" : `Next (${step + 1}/${archChain.length})`}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Every reliable agent—regardless of use case—shares the same anatomy. Missing any one of these, and failure becomes predictable.
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-3 min-h-0">
        {/* Workflow diagram */}
        <div className="flex-1 relative rounded-lg border-2 border-border bg-[#f4f6fa] overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <WorkflowDiagram
            nodes={archNodes}
            edges={archEdges}
            zones={archZones}
            activeChain={step >= 0 ? archChain : selectedNode ? [selectedNode] : undefined}
            activeStep={step >= 0 ? step : selectedNode ? 0 : undefined}
            onNodeClick={(id) => { setSelectedNode(selectedNode === id ? null : id); setStep(-1) }}
            legend={[
              { label: "Reasoning", category: "reasoning" },
              { label: "Tool/Exec", category: "tool" },
              { label: "Memory", category: "memory" },
            ]}
          />
          {step === -1 && !selectedNode && (
            <div className="absolute bottom-3 left-3 z-20 rounded-lg border-2 border-border bg-background/95 px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground font-medium">Click a node or &quot;Run Flow&quot; to explore</span>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="w-[220px] shrink-0 hidden lg:flex flex-col">
          {detail ? (
            <div key={currentNodeId} className="flex flex-col gap-2.5 rounded-lg border-2 border-border bg-background p-3.5 slide-enter">
              <h3 className="text-sm font-bold text-foreground font-mono capitalize">{currentNodeId}</h3>
              <span className="text-[10px] italic text-primary/70">{detail.question}</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{detail.desc}</p>
              <div className="h-px bg-border" />
              <ul className="flex flex-col gap-2">
                {detail.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-foreground/70 leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border p-3.5">
              <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                Click a component node to see its role and implementation details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
