"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  Activity, AlertTriangle, ArrowRight, CheckCircle2, Clock, Cpu,
  Factory, Gauge, Play, Pause, Radio, Server, Shield, ShieldCheck, Users,
  Wrench, Zap, BarChart3, FileText, Bell, Truck, Eye, Brain, SkipForward,
  X, ChevronRight, Layers,
} from "lucide-react"

/* ─── scenario data ─── */
const scenarios = [
  { key: "battery", label: "Battery Line", icon: <Zap className="h-3 w-3" /> },
  { key: "cnc", label: "CNC Machining", icon: <Cpu className="h-3 w-3" /> },
  { key: "paint", label: "Paint Shop", icon: <Factory className="h-3 w-3" /> },
]

/* ─── Orchestrator narration per step ─── */
const orchestratorStatus = [
  "Monitoring line... deviation detected in sensor stream",
  "Dispatching Defect Intelligence for root cause analysis",
  "Evaluating decision -- applying approval policy",
  "Executing corrective action via Line Optimization",
  "Recording compliance evidence, generating audit trail",
]

/* ─── KPI ─── */
type KpiDef = { label: string; icon: React.ReactNode; withoutVal: number; withoutUnit: string; withVal: number; withUnit: string; prefix?: string; isPositive: boolean }
const kpis: KpiDef[] = [
  { label: "Scrap Risk", icon: <AlertTriangle className="h-3 w-3" />, withoutVal: 120000, withoutUnit: "", withVal: 0, withUnit: "", prefix: "$", isPositive: false },
  { label: "Downtime Risk", icon: <Clock className="h-3 w-3" />, withoutVal: 6.5, withoutUnit: " hrs", withVal: 0, withUnit: " hrs", isPositive: false },
  { label: "Recall Exposure", icon: <Shield className="h-3 w-3" />, withoutVal: 1, withoutUnit: "", withVal: 0, withUnit: "", isPositive: false },
  { label: "OEE Impact", icon: <Gauge className="h-3 w-3" />, withoutVal: -12, withoutUnit: "%", withVal: 0.3, withUnit: "%", isPositive: true },
  { label: "Cost Protected", icon: <BarChart3 className="h-3 w-3" />, withoutVal: 0, withoutUnit: "", withVal: 120000, withUnit: "", prefix: "$", isPositive: true },
]

/* Agent definitions -- with full detail panel content */
interface AgentDef {
  id: string; label: string; sub: string; icon: React.ReactNode; color: string; bg: string
  input: string; output: string; liveAction: string; role: string; bizValue: string
  contextUsed: string[]; analysisPerformed: string; decisionContribution: string; confidence: number
}

const agents: AgentDef[] = [
  { id: "monitor", label: "Process Monitoring", sub: "Sensor anomaly detection", icon: <Radio className="h-3 w-3" />, color: "#2e7d32", bg: "#e8f5e9",
    input: "Real-time vibration, temp, pressure streams", output: "anomaly_score: 0.91 (CRITICAL)",
    liveAction: "Analyzing sensor stream...", role: "Continuously monitors real-time sensor data for process deviations", bizValue: "Reduces detection time from hours to milliseconds",
    contextUsed: ["Machine state", "Quality history"], analysisPerformed: "Statistical process control + time-series anomaly detection", decisionContribution: "Triggers the detection pipeline when deviation exceeds threshold", confidence: 94 },
  { id: "defect", label: "Defect Intelligence", sub: "Classify + financial impact", icon: <Eye className="h-3 w-3" />, color: "#4527a0", bg: "#ede7f6",
    input: "anomaly_score, sensor_snapshot, image feed", output: 'type: "micro-crack", scrap_risk: $120K',
    liveAction: "Classifying defect type...", role: "Classifies defect type using vision model and estimates financial exposure", bizValue: "Quantifies risk before damage occurs -- enables informed decisions",
    contextUsed: ["Quality spec", "Supplier batch", "History"], analysisPerformed: "Computer vision classification + historical failure mode analysis + financial impact model", decisionContribution: "Provides risk classification and impact estimate to Orchestrator", confidence: 88 },
  { id: "decision", label: "Production Decision", sub: "Autonomous action selection", icon: <Brain className="h-3 w-3" />, color: "#e65100", bg: "#fff3e0",
    input: "defect_class, risk_level, policy_rules", output: "ACTION: auto-adjust pressure -0.3bar",
    liveAction: "Evaluating policy...", role: "Makes autonomous production decisions based on risk policy", bizValue: "Eliminates human decision bottleneck -- seconds vs hours",
    contextUsed: ["Machine state", "Work order", "Quality spec"], analysisPerformed: "Risk-based decision tree + approval policy evaluation + action recommendation", decisionContribution: "Core decision -- selects corrective action and routes through approval policy", confidence: 87 },
  { id: "optimize", label: "Line Optimization", sub: "MES parameter update", icon: <Wrench className="h-3 w-3" />, color: "#00796b", bg: "#e0f2f1",
    input: "adjustment: pressure -= 0.3 bar", output: "MES_CMD_SENT: line_4, param_ok",
    liveAction: "Preparing MES update...", role: "Executes parameter adjustments to the production line via MES", bizValue: "Executes corrections without stopping the line",
    contextUsed: ["Machine state", "Work order"], analysisPerformed: "Parameter optimization + safety boundary check + MES command generation", decisionContribution: "Translates Orchestrator decision into executable machine commands", confidence: 96 },
  { id: "quality", label: "Quality Compliance", sub: "Record + SAP notification", icon: <ShieldCheck className="h-3 w-3" />, color: "#1565c0", bg: "#e3f2fd",
    input: "action_log, quality_spec, decision_trail", output: "SAP_QN: #QN-20260213-0042",
    liveAction: "Generating compliance records...", role: "Creates audit-compliant quality records across SAP, MES, and ISO systems", bizValue: "Automated GMP/ISO documentation -- zero manual paperwork",
    contextUsed: ["Quality spec", "History", "Supplier batch"], analysisPerformed: "Compliance rule matching + record generation + supplier notification", decisionContribution: "Final validation -- confirms all actions meet regulatory requirements", confidence: 99 },
]

const approvalRules = [
  { level: "Low risk", action: "Auto execute", color: "#43a047" },
  { level: "Medium", action: "Supervisor", color: "#fb8c00" },
  { level: "High risk", action: "Plant manager", color: "#e53935" },
]

const systemActions = [
  { label: "MES updated", icon: <Server className="h-3 w-3" />, step: 3 },
  { label: "SAP QN created", icon: <FileText className="h-3 w-3" />, step: 4 },
  { label: "Maintenance ticket", icon: <Wrench className="h-3 w-3" />, step: 4 },
  { label: "Supplier alert", icon: <Bell className="h-3 w-3" />, step: 4 },
  { label: "Report generated", icon: <Truck className="h-3 w-3" />, step: 4 },
]

const contextNodes = ["Machine state", "Work order", "Supplier batch", "Quality spec", "History"]

const timeline = [
  { t: "T+0s", label: "Anomaly detected" },
  { t: "T+2s", label: "Root cause analyzed" },
  { t: "T+4s", label: "Decision generated" },
  { t: "T+6s", label: "Line auto-adjusted" },
  { t: "T+8s", label: "Compliance recorded" },
]

const withoutSteps = [
  { label: "T+4 hrs: Issue discovered", sub: "Operator notices scrap buildup" },
  { label: "Manual inspection", sub: "Quality team dispatched" },
  { label: "Line stopped", sub: "6.5 hrs downtime" },
  { label: "Scrap produced: $120K", sub: "Irreversible material loss" },
]

/* ─── animated number hook ─── */
function useAnimatedNumber(target: number, duration = 800, active = false) {
  const [val, setVal] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    if (!active) { setVal(0); return }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, active])
  return val
}

/* ─── KPI card ─── */
function KpiCard({ kpi, step, mode }: { kpi: KpiDef; step: number; mode: "with" | "without" }) {
  const isRunning = step >= 0
  const isWithout = mode === "without"
  const showDanger = isWithout && isRunning
  const showRecovery = !isWithout && step >= 3

  const dangerTarget = isWithout ? kpi.withoutVal : (step >= 0 && step < 3 && !kpi.isPositive ? kpi.withoutVal : 0)
  const successTarget = showRecovery ? kpi.withVal : 0

  const dangerNum = useAnimatedNumber(dangerTarget, 900, isRunning && !kpi.isPositive)
  const successNum = useAnimatedNumber(successTarget, 900, showRecovery && kpi.isPositive)

  let displayVal = "--"
  let displayColor = "#999"

  if (isRunning) {
    if (isWithout) {
      if (kpi.label === "Recall Exposure") { displayVal = "HIGH"; displayColor = "#e53935" }
      else { displayVal = `${kpi.prefix || ""}${kpi.withoutVal.toLocaleString()}${kpi.withoutUnit}`; displayColor = "#e53935" }
    } else if (step < 3 && !kpi.isPositive) {
      if (kpi.label === "Recall Exposure") { displayVal = step >= 1 ? "HIGH" : "Assessing..."; displayColor = step >= 1 ? "#e53935" : "#fb8c00" }
      else { displayVal = `${kpi.prefix || ""}${Math.round(dangerNum).toLocaleString()}${kpi.withoutUnit}`; displayColor = "#e53935" }
    } else if (step >= 3) {
      if (kpi.label === "Recall Exposure") { displayVal = "NONE"; displayColor = "#2e7d32" }
      else if (kpi.isPositive) { displayVal = `${kpi.prefix || ""}${kpi.withVal === 0.3 ? successNum.toFixed(1) : Math.round(successNum).toLocaleString()}${kpi.withUnit}`; displayColor = "#2e7d32" }
      else { displayVal = `${kpi.prefix || ""}0${kpi.withUnit}`; displayColor = "#2e7d32" }
    } else {
      displayVal = `${kpi.prefix || ""}0${kpi.withUnit}`; displayColor = "#999"
    }
  }

  return (
    <div className={cn("flex flex-col rounded-md border-2 px-2 py-1.5 transition-all duration-500",
      showDanger ? "border-[#e5393540] bg-[#fbe9e7]" : showRecovery ? "border-[#43a04740] bg-[#f1f8e9]" : "border-border bg-card/30")}>
      <div className="flex items-center gap-1 text-muted-foreground mb-0.5">{kpi.icon}<span className="text-[7px] font-bold">{kpi.label}</span></div>
      <span className="text-[13px] font-bold font-mono leading-none transition-all duration-300" style={{ color: displayColor }}>{displayVal}</span>
    </div>
  )
}

/* ─── Decision Card ─── */
function DecisionCard({ onExecute, onApproval, autoPlay }: { onExecute: () => void; onApproval: () => void; autoPlay: boolean }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setTimeout(onExecute, 3000)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }
  }, [autoPlay, onExecute])

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
      <div className="w-[340px] rounded-lg border-2 border-[#e65100] bg-background shadow-lg slide-enter">
        <div className="border-b-2 border-[#e65100]/20 bg-[#fff3e0] px-4 py-2 rounded-t-lg">
          <span className="text-[11px] font-bold text-[#e65100] tracking-wide">ORCHESTRATOR: CRITICAL PROCESS DEVIATION</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="flex gap-4">
            <div>
              <span className="text-[8px] font-bold text-muted-foreground block">Predicted impact</span>
              <p className="text-[10px] font-mono text-[#e53935]">Scrap risk: $120,000</p>
              <p className="text-[10px] font-mono text-[#e53935]">Downtime risk: 6.5 hours</p>
            </div>
            <div>
              <span className="text-[8px] font-bold text-muted-foreground block">Recommended action</span>
              <p className="text-[10px] font-mono text-foreground">Auto-adjust paint viscosity</p>
              <p className="text-[10px] font-mono text-[#43a047] mt-0.5">Confidence: 87%</p>
            </div>
          </div>
          <div className="rounded bg-[#f1f8e9] border border-[#43a04730] px-2 py-1">
            <span className="text-[8px] font-bold font-mono text-[#2e7d32]">{"POLICY APPLIED: LOW RISK \u2192 AUTO EXECUTE"}</span>
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={onExecute}
              className="flex-1 rounded-md border-2 border-[#2e7d32] bg-[#2e7d32] px-3 py-1.5 text-[9px] font-bold text-[#fff] hover:bg-[#1b5e20] transition-colors">
              Execute Automatically
            </button>
            <button onClick={onApproval}
              className="flex-1 rounded-md border-2 border-[#fb8c00] bg-[#fff3e0] px-3 py-1.5 text-[9px] font-bold text-[#e65100] hover:bg-[#ffe0b2] transition-colors">
              Send for Approval
            </button>
          </div>
          {autoPlay && <span className="text-[7px] text-muted-foreground text-center mt-1">Auto-executing in 3s...</span>}
        </div>
      </div>
    </div>
  )
}

/* ─── Outcome Panel ─── */
function OutcomePanel({ mode }: { mode: "with" | "without" }) {
  if (mode === "with") {
    return (
      <div className="rounded-md border-2 border-[#2e7d32] bg-[#f1f8e9] px-3 py-2 slide-enter">
        <span className="text-[9px] font-bold text-[#2e7d32] tracking-wide block mb-1">ORCHESTRATOR OUTCOME</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-[#43a047]" /><span className="text-[9px] font-mono text-[#2e7d32]">Line continues running</span></div>
          <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-[#43a047]" /><span className="text-[9px] font-mono text-[#2e7d32]">No scrap produced</span></div>
          <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-[#43a047]" /><span className="text-[9px] font-mono text-[#2e7d32]">$120,000 cost avoided</span></div>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-md border-2 border-destructive bg-[#fbe9e7] px-3 py-2 slide-enter">
      <span className="text-[9px] font-bold text-destructive tracking-wide block mb-1">MANUAL REACTION OUTCOME</span>
      <span className="text-[9px] font-mono text-destructive">$120,000 scrap + 6.5 hrs downtime. No real-time decision.</span>
    </div>
  )
}

/* ─── Agent Detail Panel (slide-in from right) ─── */
function AgentDetailPanel({ agent, onClose }: { agent: AgentDef; onClose: () => void }) {
  return (
    <div className="absolute right-0 top-0 bottom-0 z-40 w-[280px] border-l-2 bg-background shadow-xl slide-enter flex flex-col overflow-y-auto"
      style={{ borderColor: agent.color }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 shrink-0" style={{ backgroundColor: agent.bg, borderColor: `${agent.color}40` }}>
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: `${agent.color}20`, color: agent.color }}>{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold block" style={{ color: agent.color }}>{agent.label}</span>
          <span className="text-[8px] text-muted-foreground">{agent.sub}</span>
        </div>
        <button onClick={onClose} className="rounded p-0.5 hover:bg-background/50 transition-colors"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
      </div>

      {/* Content sections */}
      <div className="flex flex-col gap-2.5 p-3 text-[8px]">
        {/* Role */}
        <Section title="ROLE" color={agent.color}>
          <p className="text-foreground/80 leading-relaxed">{agent.role}</p>
        </Section>

        {/* Input data */}
        <Section title="INPUT DATA" color={agent.color}>
          <code className="block rounded bg-secondary/40 px-2 py-1 font-mono text-[7.5px] text-foreground/70">{agent.input}</code>
        </Section>

        {/* Context from Production Graph */}
        <Section title="CONTEXT FROM PRODUCTION GRAPH" color={agent.color}>
          <div className="flex flex-wrap gap-1">
            {agent.contextUsed.map((c, i) => (
              <span key={i} className="rounded border px-1.5 py-0.5 text-[7px] font-mono" style={{ borderColor: `${agent.color}30`, color: agent.color, backgroundColor: `${agent.color}08` }}>{c}</span>
            ))}
          </div>
          <span className="text-[7px] text-muted-foreground mt-1 block italic">Shared context synchronized by Orchestrator</span>
        </Section>

        {/* Analysis performed */}
        <Section title="ANALYSIS PERFORMED" color={agent.color}>
          <p className="text-foreground/80 leading-relaxed">{agent.analysisPerformed}</p>
        </Section>

        {/* Decision contribution */}
        <Section title="DECISION CONTRIBUTION" color={agent.color}>
          <p className="text-foreground/80 leading-relaxed">{agent.decisionContribution}</p>
        </Section>

        {/* Output */}
        <Section title="OUTPUT" color={agent.color}>
          <code className="block rounded px-2 py-1 font-mono text-[7.5px]" style={{ backgroundColor: `${agent.color}10`, color: agent.color }}>{agent.output}</code>
        </Section>

        {/* Business impact */}
        <Section title="BUSINESS IMPACT" color={agent.color}>
          <p className="font-bold" style={{ color: agent.color }}>{agent.bizValue}</p>
        </Section>

        {/* Confidence */}
        <Section title="CONFIDENCE" color={agent.color}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${agent.confidence}%`, backgroundColor: agent.color }} />
            </div>
            <span className="font-bold font-mono" style={{ color: agent.color }}>{agent.confidence}%</span>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[7px] font-bold tracking-wider block mb-1" style={{ color }}>{title}</span>
      {children}
    </div>
  )
}

/* ─── Orchestrator Decision Panel ─── */
function OrchestratorDetailPanel({ step, onClose }: { step: number; onClose: () => void }) {
  const decisionTimeline = [
    { label: "Deviation detected", detail: "Sensor anomaly score 0.91 exceeds threshold 0.75", done: step >= 0 },
    { label: "Impact calculated", detail: "Defect type: micro-crack, estimated scrap: $120K", done: step >= 1 },
    { label: "Policy applied", detail: "Risk level: LOW -- auto-execute policy matched", done: step >= 2 },
    { label: "Action selected", detail: "Corrective action: reduce pressure by 0.3 bar", done: step >= 2 },
    { label: "Execution triggered", detail: "MES command sent, line continues running", done: step >= 3 },
  ]

  return (
    <div className="absolute right-0 top-0 bottom-0 z-40 w-[280px] border-l-2 border-[#0d47a1] bg-background shadow-xl slide-enter flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-[#0d47a140] bg-[#e3f2fd] shrink-0">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0d47a120]"><Layers className="h-3 w-3 text-[#0d47a1]" /></span>
        <div className="flex-1">
          <span className="text-[10px] font-bold text-[#0d47a1] block">Orchestrator Agent</span>
          <span className="text-[8px] text-muted-foreground">Real-time production supervisor</span>
        </div>
        <button onClick={onClose} className="rounded p-0.5 hover:bg-background/50 transition-colors"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
      </div>

      <div className="flex flex-col gap-2.5 p-3 text-[8px]">
        <Section title="DECISION TIMELINE" color="#0d47a1">
          <div className="flex flex-col gap-1.5">
            {decisionTimeline.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={cn("h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                  d.done ? "border-[#0d47a1] bg-[#0d47a1]" : "border-border bg-secondary/20")}>
                  {d.done && <CheckCircle2 className="h-2 w-2 text-[#fff]" />}
                </div>
                <div>
                  <span className={cn("font-bold block", d.done ? "text-[#0d47a1]" : "text-muted-foreground")}>{d.label}</span>
                  <span className="text-[7px] text-muted-foreground">{d.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="APPLIED POLICY" color="#0d47a1">
          <div className="rounded border border-[#43a04730] bg-[#f1f8e9] px-2 py-1">
            <span className="text-[7.5px] font-mono text-[#2e7d32] font-bold">{"LOW RISK \u2192 AUTO EXECUTE"}</span>
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            {approvalRules.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="font-mono" style={{ color: r.color }}>{r.level}</span>
                <ArrowRight className="h-2 w-2 text-muted-foreground/40" />
                <span className="text-muted-foreground">{r.action}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="REASONING" color="#0d47a1">
          <p className="text-foreground/80 leading-relaxed">
            Anomaly score (0.91) classified as critical but corrective action has high confidence (87%) and historical success rate (96%). Risk level assessed as LOW because the recommended parameter adjustment is within safe operating bounds and does not require line stoppage. Policy allows autonomous execution.
          </p>
        </Section>

        <Section title="ROLE" color="#0d47a1">
          <p className="text-foreground/80 leading-relaxed">
            The Orchestrator is the only component that makes decisions. It monitors, decides, delegates, executes, and explains its reasoning. All other agents are specialists that contribute data and analysis.
          </p>
        </Section>
      </div>
    </div>
  )
}

/* ─── main component ─── */
export function WorkflowSlide() {
  const [scenario, setScenario] = useState(0)
  const [mode, setMode] = useState<"with" | "without">("with")
  const [step, setStep] = useState(-1)
  const [autoPlay, setAutoPlay] = useState(false)
  const [showDecision, setShowDecision] = useState(false)
  const [decisionMade, setDecisionMade] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)
  const [showOrchestrator, setShowOrchestrator] = useState(false)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── idle animations (like slides 07/08) ── */
  const [visibleCards, setVisibleCards] = useState(0)
  const [idleHighlight, setIdleHighlight] = useState(-1)

  // staggered entrance for agent cards
  useEffect(() => {
    const timers = agents.map((_, i) =>
      setTimeout(() => setVisibleCards(i + 1), 120 + i * 80)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // auto-cycling highlight through agent cards when idle (not running)
  useEffect(() => {
    if (step >= 0) { setIdleHighlight(-1); return }
    let idx = -1
    const timer = setInterval(() => {
      idx = (idx + 1) % agents.length
      setIdleHighlight(idx)
    }, 1800)
    return () => clearInterval(timer)
  }, [step])

  const maxSteps = mode === "with" ? 5 : withoutSteps.length

  useEffect(() => {
    if (!autoPlay || step === -1) return
    if (mode === "with" && step === 2 && !decisionMade) {
      setShowDecision(true)
      return
    }
    if (step >= maxSteps - 1) { setAutoPlay(false); return }
    autoRef.current = setTimeout(() => setStep(s => s + 1), 3000)
    return () => { if (autoRef.current) clearTimeout(autoRef.current) }
  }, [autoPlay, step, mode, maxSteps, decisionMade])

  const advanceStep = useCallback(() => {
    if (mode === "with" && step === 2 && !decisionMade) { setShowDecision(true); return }
    setStep((prev) => (prev >= maxSteps - 1 ? -1 : prev + 1))
    if (step >= maxSteps - 1) { setDecisionMade(false); setShowDecision(false) }
  }, [maxSteps, step, mode, decisionMade])

  const handleDecisionExecute = useCallback(() => { setShowDecision(false); setDecisionMade(true); setStep(3) }, [])
  const handleDecisionApproval = useCallback(() => { setShowDecision(false); setDecisionMade(true); setStep(3) }, [])

  const startAutoPlay = () => { setStep(0); setAutoPlay(true); setDecisionMade(false); setShowDecision(false); setSelectedAgent(null); setShowOrchestrator(false) }

  const switchMode = (m: "with" | "without") => { setMode(m); setStep(-1); setAutoPlay(false); setDecisionMade(false); setShowDecision(false); setSelectedAgent(null); setShowOrchestrator(false) }
  const switchScenario = (i: number) => { setScenario(i); setStep(-1); setAutoPlay(false); setDecisionMade(false); setShowDecision(false); setSelectedAgent(null); setShowOrchestrator(false) }

  const isRunning = step >= 0
  const isComplete = step >= maxSteps - 1

  return (
    <div className="flex h-full flex-col relative">
      {/* Decision overlay */}
      {showDecision && mode === "with" && (
        <DecisionCard onExecute={handleDecisionExecute} onApproval={handleDecisionApproval} autoPlay={autoPlay} />
      )}

      {/* Agent detail panel */}
      {selectedAgent !== null && (
        <AgentDetailPanel agent={agents[selectedAgent]} onClose={() => setSelectedAgent(null)} />
      )}

      {/* Orchestrator detail panel */}
      {showOrchestrator && (
        <OrchestratorDetailPanel step={step} onClose={() => setShowOrchestrator(false)} />
      )}

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b-2 border-border px-4 py-1.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-primary">06</span>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">Live AI Production Supervisor</h2>
            <span className="text-[7px] text-muted-foreground">Real-time autonomous decision system for the factory</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-md border-2 border-border p-0.5 ml-2">
            {scenarios.map((s, i) => (
              <button key={s.key} onClick={() => switchScenario(i)}
                className={cn("flex items-center gap-1 rounded px-2 py-0.5 text-[8px] font-bold font-mono transition-all",
                  scenario === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {s.icon}<span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoPlay(!autoPlay)}
            className={cn("flex items-center gap-1 rounded-md border-2 px-2 py-0.5 text-[8px] font-bold font-mono transition-all",
              autoPlay ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
            {autoPlay ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
            Auto Play: {autoPlay ? "ON" : "OFF"}
          </button>
          <div className="flex items-center gap-0.5 rounded-md border-2 border-border p-0.5">
            <button onClick={() => switchMode("without")}
              className={cn("rounded px-2 py-0.5 text-[8px] font-bold font-mono transition-all",
                mode === "without" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:text-foreground")}>
              Without Agent
            </button>
            <button onClick={() => switchMode("with")}
              className={cn("rounded px-2 py-0.5 text-[8px] font-bold font-mono transition-all",
                mode === "with" ? "bg-[#2e7d32] text-[#fff]" : "text-muted-foreground hover:text-foreground")}>
              With Agent
            </button>
          </div>
          <button onClick={step === -1 ? startAutoPlay : advanceStep}
            className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-0.5 text-[8px] font-bold text-primary hover:bg-primary/10 transition-colors">
            {step === -1 ? <Play className="h-2.5 w-2.5" /> : <SkipForward className="h-2.5 w-2.5" />}
            {step === -1 ? "Run" : isComplete ? "Reset" : `Step ${step + 1}/${maxSteps}`}
          </button>
        </div>
      </div>

      {/* ── System mode label ── */}
      {isRunning && (
        <div className={cn("px-4 py-1 shrink-0 flex items-center gap-3", mode === "with" ? "bg-[#263238]" : "bg-[#4a1c1c]")}>
          {mode === "with" ? (
            <>
              <span className="text-[8px] font-bold font-mono text-[#4fc3f7] tracking-wider">AGENT-DRIVEN PLANT</span>
              <span className="text-[8px] text-[#b0bec5] font-mono">Autonomous decision latency: seconds</span>
              <span className="mx-2 text-[#546e7a]">|</span>
              <Layers className="h-3 w-3 text-[#4fc3f7]" />
              <span className="text-[8px] font-mono text-[#e0e0e0]">{step >= 0 && step < orchestratorStatus.length ? orchestratorStatus[step] : "Idle"}</span>
            </>
          ) : (
            <>
              <span className="text-[8px] font-bold font-mono text-[#ef9a9a] tracking-wider">TRADITIONAL PLANT</span>
              <span className="text-[8px] text-[#ef9a9a80] font-mono">Manual decision latency: hours</span>
            </>
          )}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT: KPI cards */}
        <div className="w-[140px] shrink-0 border-r-2 border-border p-2 flex flex-col gap-1">
          <span className="text-[7px] font-bold font-mono text-muted-foreground tracking-widest mb-0.5">LIVE BUSINESS IMPACT</span>
          {kpis.map((k, i) => (
            <div key={i} className={cn("transition-all duration-500", i < visibleCards ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3")}
              style={{ transitionDelay: `${i * 60}ms` }}>
              <KpiCard kpi={k} step={step} mode={mode} />
            </div>
          ))}
        </div>

        {/* CENTER: Agent canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {mode === "with" ? (
            <div className="flex flex-1 flex-col p-2 gap-1.5 min-h-0">
              {/* Orchestrator Agent card - top center */}
              <button onClick={() => { setShowOrchestrator(true); setSelectedAgent(null) }}
                className={cn("rounded-md border-2 px-3 py-1.5 flex items-center gap-2 transition-all duration-500 shrink-0 text-left",
                  isRunning ? "border-[#0d47a1] bg-[#e3f2fd] shadow-md" : "border-border bg-card/20 hover:border-[#0d47a180]")}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#0d47a120]">
                  <Layers className={cn("h-3 w-3 transition-colors", isRunning ? "text-[#0d47a1]" : "text-muted-foreground")} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[9px] font-bold", isRunning ? "text-[#0d47a1]" : "text-foreground")}>Orchestrator Agent</span>
                    <span className="text-[7px] text-muted-foreground">Real-time production supervisor</span>
                    {isRunning && <span className="ml-auto text-[6px] font-mono text-[#0d47a1] animate-pulse">ACTIVE</span>}
                  </div>
                  {isRunning && step >= 0 && step < orchestratorStatus.length && (
                    <span className="text-[7px] font-mono text-[#0d47a1]/70 block mt-0.5">{orchestratorStatus[step]}</span>
                  )}
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>

              {/* Context graph */}
              <div className={cn("rounded-md border-2 border-dashed px-2.5 py-1 flex items-center gap-2 transition-all duration-700 shrink-0",
                isRunning ? "border-[#1565c060] bg-[#e3f2fd60]" : "border-border bg-card/20")}>
                <Activity className={cn("h-3 w-3 transition-colors", isRunning ? "text-[#1565c0]" : "text-muted-foreground")} />
                <span className="text-[7px] font-bold text-foreground">Production Context Graph</span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {contextNodes.map((t, i) => (
                    <span key={i} className={cn("rounded border px-1 py-0.5 text-[6.5px] font-mono transition-all duration-500",
                      isRunning ? "bg-[#e3f2fd] border-[#1565c030] text-[#1565c0]" : "bg-secondary/30 border-border text-muted-foreground/50")}
                      style={{ transitionDelay: isRunning ? `${i * 100}ms` : "0ms" }}>{t}</span>
                  ))}
                </div>
                {isRunning && <span className="text-[6px] font-mono text-[#1565c0] ml-1 animate-pulse">synced</span>}
              </div>

              {/* Agent cards -- clickable */}
              <div className="flex gap-1 flex-1 min-h-0">
                {agents.map((a, i) => {
                  const isActive = step >= i
                  const isCurrent = step === i
                  const isIdleHl = step === -1 && idleHighlight === i
                  const isVisible = i < visibleCards
                  return (
                    <button key={a.id}
                      onClick={() => { setSelectedAgent(i); setShowOrchestrator(false) }}
                      className={cn("relative flex flex-1 flex-col rounded-md border-2 transition-all duration-500 text-left overflow-hidden",
                        isCurrent ? "shadow-md" : "",
                        isActive ? "" : isIdleHl ? "border-primary/40 shadow-sm" : "border-border hover:border-muted-foreground/30",
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
                      style={{
                        borderColor: isActive ? a.color : isIdleHl ? `${a.color}60` : undefined,
                        backgroundColor: isActive ? a.bg : isIdleHl ? `${a.bg}80` : "#fafafa",
                        boxShadow: isCurrent ? `0 0 0 2px ${a.color}40` : isIdleHl ? `0 0 12px ${a.color}20` : undefined,
                        transitionDelay: !isActive && isVisible ? `${i * 80}ms` : "0ms",
                      }}>
                      {/* Header */}
                      <div className="flex items-center gap-1 px-1.5 py-1 border-b border-border/30 shrink-0" style={{ backgroundColor: isActive ? `${a.color}08` : "transparent" }}>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded" style={{ backgroundColor: `${a.color}15`, color: a.color }}>{a.icon}</span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[7px] font-bold leading-tight truncate" style={{ color: isActive ? a.color : "#888" }}>{a.label}</span>
                          <span className="text-[6px] leading-tight truncate text-muted-foreground">{a.sub}</span>
                        </div>
                        {isActive && <CheckCircle2 className="h-2.5 w-2.5 shrink-0" style={{ color: a.color }} />}
                      </div>
                      {/* Body */}
                      <div className="flex-1 px-1.5 py-1 flex flex-col gap-0.5 text-[6.5px] overflow-auto">
                        {isActive && isCurrent && (
                          <span className="font-mono animate-pulse" style={{ color: a.color }}>{a.liveAction}</span>
                        )}
                        {isActive && !isCurrent && (
                          <>
                            <div><span className="font-bold text-muted-foreground">IN:</span> <span className="font-mono text-foreground/70">{a.input}</span></div>
                            <div><span className="font-bold text-muted-foreground">OUT:</span> <span className="font-mono" style={{ color: a.color }}>{a.output}</span></div>
                          </>
                        )}
                        {!isActive && <span className="text-muted-foreground/40 italic">Standby</span>}
                      </div>
                      {/* Click hint */}
                      <div className="px-1.5 py-0.5 border-t border-border/20 flex items-center justify-center shrink-0">
                        <span className="text-[6px] text-muted-foreground/40">Click for details</span>
                      </div>
                      {/* Connection line to orchestrator */}
                      {isActive && (
                        <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 h-[3px] w-[2px] rounded-full" style={{ backgroundColor: a.color }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Approval gate */}
              <div className="flex items-center gap-2 rounded-md border-2 border-border px-2 py-1 shrink-0">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-[7px] font-bold text-foreground">Human Approval Policy</span>
                <div className="flex items-center gap-2 ml-auto">
                  {approvalRules.map((r, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-[6.5px] font-mono" style={{ color: r.color }}>{r.level}</span>
                      <ArrowRight className="h-2 w-2 text-muted-foreground/30" />
                      <span className="text-[6.5px] font-mono text-muted-foreground">{r.action}</span>
                    </span>
                  ))}
                </div>
              </div>

              {isComplete && <OutcomePanel mode="with" />}
            </div>
          ) : (
            /* WITHOUT AGENT */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
              <span className="text-[8px] font-bold font-mono text-destructive tracking-widest">TRADITIONAL WORKFLOW -- NO REAL-TIME DECISION</span>
              <div className="flex items-center gap-2">
                {withoutSteps.map((s, i) => {
                  const active = step >= i
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn("flex flex-col items-center gap-1 rounded-md border-2 px-3 py-2 text-center transition-all duration-500 w-[130px]",
                        active ? "border-destructive bg-[#fbe9e7]" : "border-border bg-secondary/20")}>
                        <span className={cn("text-[8px] font-bold font-mono", active ? "text-destructive" : "text-muted-foreground")}>{s.label}</span>
                        <span className={cn("text-[7px]", active ? "text-destructive/70" : "text-muted-foreground/40")}>{s.sub}</span>
                      </div>
                      {i < withoutSteps.length - 1 && <ArrowRight className={cn("h-3 w-3 shrink-0", active ? "text-destructive" : "text-border")} />}
                    </div>
                  )
                })}
              </div>
              {isComplete && <OutcomePanel mode="without" />}
            </div>
          )}
        </div>

        {/* RIGHT: System actions */}
        {mode === "with" && (
          <div className="w-[120px] shrink-0 border-l-2 border-border p-2 flex flex-col gap-1">
            <span className="text-[7px] font-bold font-mono text-muted-foreground tracking-widest mb-0.5">SYSTEM ACTIONS</span>
            {systemActions.map((sa, i) => {
              const active = step >= sa.step
              return (
                <div key={i} className={cn("flex items-center gap-1 rounded-md border-2 px-1.5 py-1 transition-all duration-500",
                  active ? "border-[#43a04740] bg-[#f1f8e9]" : "border-border bg-secondary/10")}
                  style={{ transitionDelay: active ? `${i * 150}ms` : "0ms" }}>
                  <span className={cn("transition-colors", active ? "text-[#2e7d32]" : "text-muted-foreground/30")}>{sa.icon}</span>
                  <span className={cn("text-[7px] font-bold transition-colors", active ? "text-[#2e7d32]" : "text-muted-foreground/30")}>{sa.label}</span>
                  {active && <CheckCircle2 className="h-2.5 w-2.5 text-[#43a047] ml-auto shrink-0" />}
                </div>
              )
            })}
            {isComplete && (
              <div className="mt-auto rounded-md border-2 border-[#2e7d32] bg-[#f1f8e9] p-1.5 slide-enter">
                <span className="text-[7px] font-bold text-[#2e7d32] block">VALUE PROTECTED</span>
                <p className="text-[8px] font-bold font-mono text-[#2e7d32] mt-0.5">$120,000 saved</p>
                <p className="text-[7px] font-mono text-[#2e7d32]">OEE +0.3%</p>
                <p className="text-[7px] font-mono text-[#2e7d32]">0 downtime</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Timeline bar ── */}
      <div className="border-t-2 border-border px-4 py-1 flex items-center gap-1 shrink-0">
        <span className="text-[7px] font-bold font-mono text-muted-foreground mr-1">TIMELINE</span>
        {mode === "with" ? timeline.map((t, i) => {
          const active = step >= i
          const isCurrent = step === i
          return (
            <div key={i} className="flex items-center gap-0.5">
              <div className={cn("flex items-center gap-1 rounded border-2 px-1.5 py-0.5 transition-all duration-500",
                isCurrent ? "border-primary bg-primary/5 scale-105" : active ? "border-[#43a04740] bg-[#f1f8e9]" : "border-border bg-secondary/10")}>
                <span className={cn("text-[7px] font-bold font-mono", isCurrent ? "text-primary" : active ? "text-[#2e7d32]" : "text-muted-foreground/30")}>{t.t}</span>
                <span className={cn("text-[6.5px] font-mono", active ? "text-foreground/70" : "text-muted-foreground/20")}>{t.label}</span>
              </div>
              {i < timeline.length - 1 && <ArrowRight className={cn("h-2 w-2 shrink-0", active ? "text-[#43a047]" : "text-border/30")} />}
            </div>
          )
        }) : (
          <span className="text-[8px] text-destructive font-mono">Manual process: 2+ hours total response time</span>
        )}
      </div>
    </div>
  )
}
