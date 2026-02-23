"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

/* ── Component data ── */
const components = [
  {
    id: "state",
    label: "STATE",
    title: "Memory(t)",
    sub: "Persistent context",
    formula: null,
    question: "What to remember?",
    desc: "Governable memory from context window to persistent knowledge stores.",
    points: ["Short-term: conversation context & cache", "Long-term: knowledge graph & vector DB", "TTL management, access control & compliance"],
  },
  {
    id: "planner",
    label: "PLANNER",
    title: "Strategy(G, S)",
    sub: null,
    formula: "\u03C0",
    question: "What to do?",
    desc: "Task decomposition and goal planning, breaking complex intents into executable sub-task sequences.",
    points: ["Receive user intent, generate structured plans", "Multi-step planning & dynamic re-planning", "Hard constraints (safety) & soft constraints (cost)"],
  },
  {
    id: "objective",
    label: "OBJECTIVE",
    title: "Goal(G)",
    sub: null,
    formula: null,
    question: "Why act?",
    desc: "The driving goal that shapes all planning and verification decisions.",
    points: ["User-defined or system-inferred objectives", "Measurable success criteria", "Constraint boundaries for safe execution"],
  },
  {
    id: "executor",
    label: "EXECUTOR",
    title: "Execute(\u03C0)",
    sub: null,
    formula: "a",
    question: "How to act?",
    desc: "Execution layer calling tools, APIs and external services.",
    points: ["API-first, UI-fallback strategy", "Read-Verify-Write operation pattern", "Idempotency, retry backoff, rollback"],
  },
  {
    id: "environment",
    label: "ENVIRONMENT",
    title: "External actions",
    sub: "& observations",
    formula: null,
    question: "What happens outside?",
    desc: "The external world the agent interacts with -- APIs, databases, users, and real-world systems.",
    points: ["Tool calls and API interactions", "User feedback and confirmations", "Real-world state observations"],
  },
  {
    id: "verifier",
    label: "VERIFIER",
    title: "Verify(G, S')",
    sub: null,
    formula: "\u2713/\u2717",
    question: "Is it correct?",
    desc: "Validation and quality assurance ensuring outputs meet expectations.",
    points: ["Result verification & consistency checks", "Trigger re-planning when needed", "Human approval & Kill Switch"],
  },
]

const flowOrder = ["objective", "state", "planner", "executor", "environment", "verifier"]

export function ArchitectureSlide() {
  const [step, setStep] = useState(-1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const advanceStep = useCallback(() => {
    setSelectedNode(null)
    setStep((prev) => {
      if (prev >= flowOrder.length - 1) { setAutoRunning(false); return -1 }
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
    if (step >= flowOrder.length - 1) { setAutoRunning(false); return }
    autoRef.current = setTimeout(() => setStep(s => s + 1), 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoRunning, step])

  const activeSet = new Set(step >= 0 ? flowOrder.slice(0, step + 1) : selectedNode ? [selectedNode] : [])
  const currentId = step >= 0 ? flowOrder[step] : selectedNode
  const detail = components.find(c => c.id === currentId)

  const handleNodeClick = (id: string) => {
    setAutoRunning(false)
    setStep(-1)
    setSelectedNode(selectedNode === id ? null : id)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Five Core Components</h2>
            <span className="h-px flex-1 bg-border" />
            <button
              onClick={step === -1 ? startAutoRun : advanceStep}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent shrink-0"
            >
              <Play className="h-3 w-3" />
              {step === -1 ? "Run Flow" : step >= flowOrder.length - 1 ? "Reset" : `Step ${step + 1}/${flowOrder.length}`}
            </button>
            {autoRunning && <span className="text-[10px] text-muted-foreground animate-pulse">Auto-advancing...</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Every reliable agent shares the same anatomy. Click a component or run the flow to explore.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 gap-4 px-6 pb-5 min-h-0">

        {/* Diagram area */}
        <div className="flex-1 relative rounded-xl border border-foreground/80 overflow-hidden">
          {/* AGENT SYSTEM label */}
          <div className="absolute top-0 left-0 z-10 px-4 py-2">
            <span className="text-[11px] font-mono tracking-widest text-muted-foreground">AGENT SYSTEM</span>
            <span className="block h-px bg-foreground/15 mt-1 w-[calc(100%+200px)]" />
          </div>

          {/* SVG Diagram */}
          <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="currentColor" className="text-foreground/40" />
              </marker>
              <marker id="arrow-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="currentColor" className="text-foreground" />
              </marker>
            </defs>

            {/* STATE <-> PLANNER (horizontal) */}
            <line x1="250" y1="140" x2="325" y2="140"
              stroke="currentColor" className={cn("transition-all duration-500", activeSet.has("state") && activeSet.has("planner") ? "text-foreground/70" : "text-foreground/20")}
              strokeWidth="1.5" />
            <text x="288" y="133" textAnchor="middle" fontSize="14" className={cn("transition-all duration-500", activeSet.has("state") && activeSet.has("planner") ? "text-foreground/60" : "text-foreground/20")}>
              {"<=>"}
            </text>

            {/* PLANNER -> EXECUTOR (dashed vertical) */}
            <line x1="440" y1="195" x2="440" y2="285"
              stroke="currentColor" strokeDasharray="4 4"
              className={cn("transition-all duration-500", activeSet.has("planner") && activeSet.has("executor") ? "text-foreground/70" : "text-foreground/20")}
              strokeWidth="1.5" markerEnd={activeSet.has("executor") ? "url(#arrow-active)" : "url(#arrow)"} />

            {/* EXECUTOR <-> ENVIRONMENT (horizontal) */}
            <line x1="555" y1="330" x2="595" y2="330"
              stroke="currentColor" className={cn("transition-all duration-500", activeSet.has("executor") && activeSet.has("environment") ? "text-foreground/70" : "text-foreground/20")}
              strokeWidth="1.5" />
            <text x="575" y="323" textAnchor="middle" fontSize="14" className={cn("transition-all duration-500", activeSet.has("executor") && activeSet.has("environment") ? "text-foreground/60" : "text-foreground/20")}>
              {"<=>"}
            </text>

            {/* EXECUTOR -> VERIFIER (dashed vertical) */}
            <line x1="440" y1="385" x2="440" y2="435"
              stroke="currentColor" strokeDasharray="4 4"
              className={cn("transition-all duration-500", activeSet.has("executor") && activeSet.has("verifier") ? "text-foreground/70" : "text-foreground/20")}
              strokeWidth="1.5" markerEnd={activeSet.has("verifier") ? "url(#arrow-active)" : "url(#arrow)"} />

            {/* Self-loop on planner */}
            <path d="M 470 100 C 490 70, 510 70, 490 100" fill="none"
              stroke="currentColor" className="text-foreground/20" strokeWidth="1.5"
              markerEnd="url(#arrow)" />
          </svg>

          {/* Box nodes */}
          {/* STATE */}
          <button
            onClick={() => handleNodeClick("state")}
            className={cn(
              "absolute transition-all duration-400 rounded-lg border-2 bg-background px-5 py-4 text-left",
              activeSet.has("state") ? "border-foreground shadow-sm" : "border-foreground/25 hover:border-foreground/50"
            )}
            style={{ left: "8%", top: "14%", width: "22%", minHeight: "80px" }}
          >
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1.5">STATE</div>
            <div className="text-base font-semibold text-foreground">Memory(t)</div>
            <div className="text-xs text-muted-foreground mt-0.5">Persistent context</div>
          </button>

          {/* PLANNER */}
          <button
            onClick={() => handleNodeClick("planner")}
            className={cn(
              "absolute transition-all duration-400 rounded-lg border-2 bg-background px-5 py-4 text-left",
              activeSet.has("planner") ? "border-foreground shadow-sm" : "border-foreground/25 hover:border-foreground/50"
            )}
            style={{ left: "38%", top: "14%", width: "28%", minHeight: "80px" }}
          >
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1.5">PLANNER</div>
            <div className="text-base font-semibold text-foreground">
              {'Strategy(G, S) \u2192 \u03C0'}
            </div>
          </button>

          {/* OBJECTIVE */}
          <button
            onClick={() => handleNodeClick("objective")}
            className={cn(
              "absolute transition-all duration-400 rounded-lg border-2 bg-background px-5 py-4 text-left",
              activeSet.has("objective") ? "border-foreground shadow-sm" : "border-foreground/25 hover:border-foreground/50"
            )}
            style={{ left: "8%", top: "46%", width: "22%", minHeight: "70px" }}
          >
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1.5">OBJECTIVE</div>
            <div className="text-base font-semibold text-foreground">Goal(G)</div>
          </button>

          {/* EXECUTOR */}
          <button
            onClick={() => handleNodeClick("executor")}
            className={cn(
              "absolute transition-all duration-400 rounded-lg border-2 bg-background px-5 py-4 text-left",
              activeSet.has("executor") ? "border-foreground shadow-sm" : "border-foreground/25 hover:border-foreground/50"
            )}
            style={{ left: "38%", top: "46%", width: "28%", minHeight: "70px" }}
          >
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1.5">EXECUTOR</div>
            <div className="text-base font-semibold text-foreground">
              {'Execute(\u03C0) \u2192 a'}
            </div>
          </button>

          {/* ENVIRONMENT */}
          <button
            onClick={() => handleNodeClick("environment")}
            className={cn(
              "absolute transition-all duration-400 rounded-lg border-2 bg-background px-5 py-4 text-left",
              activeSet.has("environment") ? "border-foreground shadow-sm" : "border-foreground/25 hover:border-foreground/50"
            )}
            style={{ left: "72%", top: "46%", width: "24%", minHeight: "70px" }}
          >
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1.5">ENVIRONMENT</div>
            <div className="text-sm font-semibold text-foreground">External actions</div>
            <div className="text-sm font-semibold text-foreground">& observations</div>
          </button>

          {/* VERIFIER */}
          <button
            onClick={() => handleNodeClick("verifier")}
            className={cn(
              "absolute transition-all duration-400 rounded-lg border-2 bg-background px-5 py-4 text-left",
              activeSet.has("verifier") ? "border-foreground shadow-sm" : "border-foreground/25 hover:border-foreground/50"
            )}
            style={{ left: "30%", top: "76%", width: "35%", minHeight: "70px" }}
          >
            <div className="text-[11px] font-mono tracking-widest text-muted-foreground mb-1.5">VERIFIER</div>
            <div className="text-base font-semibold text-foreground">
              {'Verify(G, S\') \u2192 \u2713/\u2717'}
            </div>
          </button>
        </div>

        {/* Detail panel */}
        <div className="w-[240px] shrink-0 hidden lg:flex flex-col">
          {detail ? (
            <div key={currentId} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 slide-enter">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-muted-foreground mb-1">{detail.label}</div>
                <h3 className="text-sm font-semibold text-foreground">{detail.title}</h3>
              </div>
              <span className="text-xs italic text-muted-foreground">{detail.question}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{detail.desc}</p>
              <div className="h-px bg-border" />
              <ul className="flex flex-col gap-2">
                {detail.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/70 leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-4">
              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                Click a component or run the flow to see details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
