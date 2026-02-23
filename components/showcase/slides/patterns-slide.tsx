"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { WorkflowDiagram, type WfNode, type WfEdge, type WfZone } from "../workflow-diagram"
import { Brain, Wrench, Eye, FileText, Cpu, GitBranch, Inbox, Send, Play } from "lucide-react"

const ic = "h-3 w-3"

interface PatternDef {
  name: string
  subtitle: string
  whenToUse: string
  complexity: "Low" | "Medium" | "High"
  risk: "Low" | "Medium" | "High"
  nodes: WfNode[]
  edges: WfEdge[]
  zones: WfZone[]
  chain: string[]
}

/* ── ReAct (Thought-Action-Observe loop) ── */
const reactPattern: PatternDef = {
  name: "ReAct",
  subtitle: "Reason + Act loop",
  whenToUse: "Simple lookups, single-tool chains, Q&A with one external source",
  complexity: "Low", risk: "Low",
  nodes: [
    { id: "input",   label: "User Query", x: 8,  y: 50, shape: "circle",  category: "io",       icon: <Inbox className={ic} />,    sampleOutput: '"What is the weather in Tokyo?"' },
    { id: "thought", label: "Thought",    sub: "Reason",  x: 30, y: 50, category: "reasoning", icon: <Brain className={ic} />,    sampleOutput: "Need to call weather API for Tokyo" },
    { id: "action",  label: "Action",     sub: "Tool",    x: 52, y: 25, category: "tool",      icon: <Wrench className={ic} />,   sampleOutput: 'weather_api(city="Tokyo")' },
    { id: "observe", label: "Observe",    sub: "Result",  x: 68, y: 50, category: "data",      icon: <Eye className={ic} />,      sampleOutput: '{ temp: 22, sky: "sunny" }' },
    { id: "done",    label: "Done?",                      x: 84, y: 50, shape: "diamond", category: "decision", icon: <GitBranch className={ic} />, sampleOutput: "YES -> output" },
    { id: "output",  label: "Output",                     x: 94, y: 25, shape: "circle",  category: "io",       icon: <Send className={ic} />,     sampleOutput: '"Tokyo: 22°C sunny"' },
  ],
  edges: [
    { from: "input",   to: "thought" },
    { from: "thought", to: "action",  route: "h-first" },
    { from: "action",  to: "observe", route: "h-first" },
    { from: "observe", to: "done" },
    { from: "done",    to: "output",  label: "Yes",  route: "h-first" },
    { from: "done",    to: "thought", label: "Loop", dashed: true, route: "v-first" },
  ],
  zones: [{ label: "ReAct Loop", x: 22, y: 10, w: 55, h: 80, color: "#43a047" }],
  chain: ["input", "thought", "action", "observe", "done", "output"],
}

/* ── Tool Use (Select-Execute-Aggregate) ── */
const toolPattern: PatternDef = {
  name: "Tool Use",
  subtitle: "Select → Execute → Aggregate",
  whenToUse: "Tasks needing multiple tools in parallel: search + email + database at once",
  complexity: "Low", risk: "Low",
  nodes: [
    { id: "input",    label: "User Query",      x: 8,  y: 50, shape: "circle", category: "io",       icon: <Inbox className={ic} />,  sampleOutput: '"Find flights to Tokyo & notify team"' },
    { id: "select",   label: "Select Tool(s)",  x: 35, y: 50, category: "tool",      icon: <Brain className={ic} />,  sampleOutput: '["web_search","slack"]' },
    { id: "tool1",    label: "Web Search",       x: 56, y: 20, shape: "pill", category: "tool",      icon: <Wrench className={ic} />, sampleOutput: "google_flights results" },
    { id: "tool2",    label: "Slack",            x: 56, y: 50, shape: "pill", category: "tool",      icon: <Wrench className={ic} />, sampleOutput: "#travel channel notified" },
    { id: "tool3",    label: "Vector DB",        x: 56, y: 80, shape: "pill", category: "memory",    icon: <Wrench className={ic} />, sampleOutput: "past_bookings retrieved" },
    { id: "results",  label: "Aggregate",        x: 76, y: 50, category: "data",      icon: <FileText className={ic} />, sampleOutput: '{ flights: [...], history: [...] }' },
    { id: "generate", label: "Generate",         x: 88, y: 50, category: "reasoning", icon: <Brain className={ic} />,  sampleOutput: "compiling final answer..." },
    { id: "output",   label: "Response",         x: 96, y: 50, shape: "circle", category: "io",       icon: <Send className={ic} />,   sampleOutput: '"3 flights found, team notified"' },
  ],
  edges: [
    { from: "input",    to: "select" },
    { from: "select",   to: "tool1", route: "h-first" },
    { from: "select",   to: "tool2", route: "h-first" },
    { from: "select",   to: "tool3", route: "h-first" },
    { from: "tool1",    to: "results", route: "h-first" },
    { from: "tool2",    to: "results" },
    { from: "tool3",    to: "results", route: "h-first" },
    { from: "results",  to: "generate" },
    { from: "generate", to: "output" },
  ],
  zones: [{ label: "Parallel Execution", x: 46, y: 6, w: 24, h: 88, color: "#7e57c2" }],
  chain: ["input", "select", "tool1", "tool2", "tool3", "results", "generate", "output"],
}

/* ── Planning (Plan-Execute-Loop) ── */
const planPattern: PatternDef = {
  name: "Planning",
  subtitle: "Plan → Execute → Loop",
  whenToUse: "Multi-step tasks where sub-tasks are interdependent: code generation, research reports",
  complexity: "Medium", risk: "Medium",
  nodes: [
    { id: "input",    label: "User Query",  x: 8,  y: 40, shape: "circle",  category: "io",       icon: <Inbox className={ic} />,    sampleOutput: '"Build a REST API for user management"' },
    { id: "plan",     label: "Make a Plan", x: 28, y: 40, category: "reasoning", icon: <Brain className={ic} />,    sampleOutput: "3 sub-tasks identified" },
    { id: "task1",    label: "Task 1",      x: 42, y: 62, shape: "pill",   category: "data",      icon: <FileText className={ic} />, sampleOutput: "scaffold project" },
    { id: "task2",    label: "Task 2",      x: 42, y: 75, shape: "pill",   category: "data",      icon: <FileText className={ic} />, sampleOutput: "implement endpoints" },
    { id: "task3",    label: "Task 3",      x: 42, y: 88, shape: "pill",   category: "data",      icon: <FileText className={ic} />, sampleOutput: "add auth middleware" },
    { id: "exec",     label: "Execute",     x: 58, y: 40, category: "tool",      icon: <Cpu className={ic} />,      sampleOutput: "running task 1 of 3..." },
    { id: "tools",    label: "Tools",       x: 60, y: 68, shape: "pill",   category: "tool",      icon: <Wrench className={ic} />,   sampleOutput: "code_gen, linter" },
    { id: "check",    label: "All done?",   x: 76, y: 40, shape: "diamond", category: "decision", icon: <GitBranch className={ic} />, sampleOutput: "2/3 done → NO" },
    { id: "generate", label: "Generate",    x: 88, y: 68, category: "reasoning", icon: <Brain className={ic} />,    sampleOutput: "compiling final output..." },
    { id: "output",   label: "Response",    x: 8,  y: 80, shape: "circle",  category: "io",       icon: <Send className={ic} />,     sampleOutput: '"REST API created with 4 endpoints"' },
  ],
  edges: [
    { from: "input",    to: "plan" },
    { from: "plan",     to: "exec" },
    { from: "plan",     to: "task1", dashed: true, route: "v-first" },
    { from: "plan",     to: "task2", dashed: true, route: "v-first" },
    { from: "plan",     to: "task3", dashed: true, route: "v-first" },
    { from: "tools",    to: "exec",  route: "v-first" },
    { from: "exec",     to: "check" },
    { from: "check",    to: "exec",     label: "NO",  dashed: true, route: "v-first" },
    { from: "check",    to: "generate", label: "YES", route: "v-first" },
    { from: "generate", to: "output" },
  ],
  zones: [
    { label: "Planning Loop", x: 22, y: 6, w: 62, h: 84, color: "#43a047" },
  ],
  chain: ["input", "plan", "task1", "task2", "task3", "exec", "tools", "check", "generate", "output"],
}

/* ── Reflection (Execute-Reflect-Iterate) ── */
const reflectPattern: PatternDef = {
  name: "Reflection",
  subtitle: "Execute → Reflect → Iterate",
  whenToUse: "Quality-critical output where first draft is rarely good enough: code review, document writing",
  complexity: "Medium", risk: "Medium",
  nodes: [
    { id: "input",     label: "User Query", x: 8,  y: 35, shape: "circle",  category: "io",       icon: <Inbox className={ic} />,    sampleOutput: '"Write a Python merge sort with tests"' },
    { id: "tools",     label: "Tools",      x: 30, y: 10, shape: "pill",   category: "tool",      icon: <Wrench className={ic} />,   sampleOutput: "code_exec, linter, test_runner" },
    { id: "execute",   label: "Execute",    x: 30, y: 40, category: "tool",      icon: <Cpu className={ic} />,      sampleOutput: "def merge_sort(arr): ..." },
    { id: "draft",     label: "Draft",      x: 50, y: 40, shape: "pill",   category: "data",      icon: <FileText className={ic} />, sampleOutput: "code + 3/5 tests passed" },
    { id: "reflect",   label: "Reflect",    x: 68, y: 55, category: "reasoning", icon: <Eye className={ic} />,      sampleOutput: "edge cases missing, add error handling" },
    { id: "response",  label: "Response",   x: 68, y: 25, category: "data",      icon: <FileText className={ic} />, sampleOutput: "quality_score: 0.72" },
    { id: "improved",  label: "Improved",   x: 84, y: 55, category: "data",      icon: <FileText className={ic} />, sampleOutput: "3 improvement items" },
    { id: "output",    label: "Final",      x: 8,  y: 75, shape: "circle",  category: "io",       icon: <Send className={ic} />,     sampleOutput: '"Optimized sort with full test suite"' },
  ],
  edges: [
    { from: "input",    to: "execute",  route: "h-first" },
    { from: "tools",    to: "execute",  route: "v-first" },
    { from: "execute",  to: "draft" },
    { from: "draft",    to: "response", route: "h-first" },
    { from: "draft",    to: "reflect",  route: "v-first" },
    { from: "reflect",  to: "improved", route: "h-first" },
    { from: "improved", to: "execute",  label: "Not ok", dashed: true, route: "v-first" },
    { from: "improved", to: "output",   label: "Ok" },
  ],
  zones: [
    { label: "Execution",  x: 20, y: 4,  w: 36, h: 60, color: "#43a047" },
    { label: "Reflection", x: 60, y: 14, w: 32, h: 74, color: "#26a69a" },
  ],
  chain: ["input", "tools", "execute", "draft", "response", "reflect", "improved", "output"],
}

const patterns: PatternDef[] = [reactPattern, toolPattern, planPattern, reflectPattern]

/* ── Selection guide ── */
const selectionGuide = [
  { label: "Single lookup", arrow: "→ ReAct",       idx: 0 },
  { label: "Parallel tools", arrow: "→ Tool Use",   idx: 1 },
  { label: "Multi-step task", arrow: "→ Planning",  idx: 2 },
  { label: "Quality-critical", arrow: "→ Reflection", idx: 3 },
]

const lvlStyle = {
  Low:    "bg-[#e8f5e9] text-[#2e7d32] border-[#43a04730]",
  Medium: "bg-[#fff3e0] text-[#e65100] border-[#fb8c0030]",
  High:   "bg-[#fce4ec] text-[#c62828] border-[#ef535030]",
}

export function PatternsSlide() {
  const [active, setActive] = useState(0)
  const [step, setStep] = useState(-1)
  const [autoRunning, setAutoRunning] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const p = patterns[active]

  const advanceStep = useCallback(() => {
    setStep((prev) => {
      if (prev >= p.chain.length - 1) { setAutoRunning(false); return -1 }
      return prev + 1
    })
  }, [p.chain.length])

  const startAutoRun = useCallback(() => {
    setStep(0)
    setAutoRunning(true)
  }, [])

  // Auto-start animation on mount
  useEffect(() => {
    const t = setTimeout(() => { setStep(0); setAutoRunning(true) }, 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!autoRunning || step < 0) return
    if (step >= p.chain.length - 1) { setAutoRunning(false); return }
    autoRef.current = setTimeout(() => setStep(s => s + 1), 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoRunning, step, p.chain.length])

  const handleSwitch = (i: number) => { setStep(-1); setActive(i); setAutoRunning(false) }

  return (
    <div className="flex h-full flex-col px-5 pt-3 pb-3 md:px-8 md:pt-4">

      {/* Title bar */}
      <div className="mb-2 flex items-start gap-3">
        <span className="font-mono text-[10px] tracking-widest text-primary mt-1.5">02</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground md:text-xl">Agent Collaboration Patterns</h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Four core patterns—choose by task type. More complex patterns (RAG, Supervisor) compose these as building blocks.
          </p>
        </div>
      </div>

      {/* Selection guide strip */}
      <div className="mb-2 flex items-center gap-1.5 rounded-lg border-2 border-border bg-card/50 px-3 py-1.5">
        <span className="text-[9px] font-semibold text-muted-foreground shrink-0 pr-1">When to use:</span>
        {selectionGuide.map((g, i) => (
          <button
            key={i}
            onClick={() => handleSwitch(g.idx)}
            className={cn(
              "flex items-center gap-1 rounded-md border px-2 py-0.5 transition-all",
              active === g.idx
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-background/50 hover:border-primary/20"
            )}
          >
            <span className={cn("text-[9px] text-muted-foreground", active === g.idx && "text-foreground/60")}>{g.label}</span>
            <span className={cn("text-[9px] font-bold font-mono", active === g.idx ? "text-primary" : "text-muted-foreground/50")}>{g.arrow}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 gap-3 min-h-0">

        {/* Left: pattern selector */}
        <div className="flex w-[148px] shrink-0 flex-col gap-1">
          {patterns.map((pat, i) => (
            <button key={i} onClick={() => handleSwitch(i)}
              className={cn(
                "rounded-lg border-2 px-3 py-2 text-left transition-all",
                active === i ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
              )}
            >
              <span className={cn("text-xs font-bold font-mono", active === i ? "text-primary" : "text-foreground")}>{pat.name}</span>
              <p className={cn("text-[9px] mt-0.5", active === i ? "text-primary/70" : "text-muted-foreground")}>{pat.subtitle}</p>
            </button>
          ))}

          {/* Metrics */}
          <div className="mt-auto flex flex-col gap-1">
            <div className="flex items-center justify-between rounded-lg border-2 border-border px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground font-medium">Complexity</span>
              <span className={cn("rounded-md border px-1.5 py-0.5 text-[9px] font-bold", lvlStyle[p.complexity])}>{p.complexity}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border-2 border-border px-2.5 py-1.5">
              <span className="text-[9px] text-muted-foreground font-medium">Risk</span>
              <span className={cn("rounded-md border px-1.5 py-0.5 text-[9px] font-bold", lvlStyle[p.risk])}>{p.risk}</span>
            </div>
          </div>
        </div>

        {/* Right: diagram + step controls */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <button onClick={step === -1 ? startAutoRun : advanceStep}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/10"
            >
              <Play className="h-3 w-3" />
              {step === -1 ? "Run" : step >= p.chain.length - 1 ? "Reset" : `Step ${step + 1}/${p.chain.length}`}
            </button>
            {autoRunning && <span className="text-[9px] text-muted-foreground animate-pulse">Auto-advancing...</span>}
            {step >= 0 && step < p.chain.length && (
              <span className="rounded bg-foreground/5 border border-border px-2 py-0.5 text-[9px] text-foreground font-mono">{p.chain[step]}</span>
            )}
            {step === -1 && !autoRunning && (
              <span className="text-[9px] text-muted-foreground">Click Run to auto-step through the data flow</span>
            )}
          </div>

          <div className="flex-1 relative rounded-lg border-2 border-border bg-[#f4f6fa] overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-30" />
            <WorkflowDiagram
              key={active}
              nodes={p.nodes}
              edges={p.edges}
              zones={p.zones}
              activeChain={step >= 0 ? p.chain : undefined}
              activeStep={step >= 0 ? step : undefined}
              legend={[
                { label: "Reasoning", category: "reasoning" },
                { label: "Tool Use",  category: "tool" },
                { label: "Memory",    category: "memory" },
              ]}
            />
          </div>

          {/* Use case bar */}
          <div className="flex items-center gap-2 rounded-lg border-2 border-border bg-card/60 px-3 py-1.5">
            <span className="text-[9px] font-bold text-muted-foreground shrink-0">Best for:</span>
            <span className="text-[10px] font-medium text-foreground/80">{p.whenToUse}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
