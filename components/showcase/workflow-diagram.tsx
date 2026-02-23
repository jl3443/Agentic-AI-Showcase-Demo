"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

/* ── Types ── */
export type NodeShape = "rect" | "diamond" | "circle" | "pill"
export type NodeCategory = "reasoning" | "tool" | "memory" | "io" | "decision" | "data"

export interface WfNode {
  id: string
  label: string
  sub?: string
  x: number
  y: number
  shape?: NodeShape
  category?: NodeCategory
  icon?: React.ReactNode
  sampleOutput?: string
}

export interface WfEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
  animated?: boolean
  route?: "h-first" | "v-first"
}

export interface WfZone {
  label: string
  x: number
  y: number
  w: number
  h: number
  color?: string
}

interface Props {
  nodes: WfNode[]
  edges: WfEdge[]
  zones?: WfZone[]
  legend?: { label: string; category: NodeCategory }[]
  className?: string
  activeChain?: string[]
  activeStep?: number
  activeNodeId?: string | null
  onNodeClick?: (id: string) => void
}

const CAT_COLORS: Record<NodeCategory, { bg: string; border: string; text: string; fill: string }> = {
  reasoning: { bg: "#e8f5e9", border: "#43a047", text: "#2e7d32", fill: "#c8e6c9" },
  tool:      { bg: "#ede7f6", border: "#7e57c2", text: "#4527a0", fill: "#d1c4e9" },
  memory:    { bg: "#e0f2f1", border: "#26a69a", text: "#00796b", fill: "#b2dfdb" },
  io:        { bg: "#f5f5f5", border: "#78909c", text: "#37474f", fill: "#eceff1" },
  decision:  { bg: "#e0f7fa", border: "#00acc1", text: "#006064", fill: "#b2ebf2" },
  data:      { bg: "#fff3e0", border: "#fb8c00", text: "#e65100", fill: "#ffe0b2" },
}

const EDGE_COLOR = "#37474f"

function getNodeCenter(n: WfNode, svgW: number, svgH: number) {
  return { cx: (n.x / 100) * svgW, cy: (n.y / 100) * svgH }
}

function buildOrthogonalPath(fx: number, fy: number, tx: number, ty: number, route?: "h-first" | "v-first") {
  const dx = Math.abs(tx - fx)
  const dy = Math.abs(ty - fy)
  if (dy < 4) return `M ${fx} ${fy} L ${tx} ${ty}`
  if (dx < 4) return `M ${fx} ${fy} L ${tx} ${ty}`
  const useHFirst = route === "h-first" || (!route && dx >= dy)
  if (useHFirst) {
    return `M ${fx} ${fy} L ${tx} ${fy} L ${tx} ${ty}`
  } else {
    return `M ${fx} ${fy} L ${fx} ${ty} L ${tx} ${ty}`
  }
}

export function WorkflowDiagram({ nodes, edges, zones, legend, className, activeChain, activeStep, activeNodeId, onNodeClick }: Props) {
  const SVG_W = 1000
  const SVG_H = 560

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const activeSet = useMemo(() => {
    if (activeNodeId) return new Set([activeNodeId])
    if (!activeChain || activeStep === undefined) return new Set<string>()
    return new Set(activeChain.slice(0, activeStep + 1))
  }, [activeChain, activeStep, activeNodeId])

  const currentNodeId = activeNodeId || (activeChain && activeStep !== undefined ? activeChain[activeStep] : null)

  const svgEdges = useMemo(
    () =>
      edges.map((e) => {
        const fn = nodeMap.get(e.from)
        const tn = nodeMap.get(e.to)
        if (!fn || !tn) return null
        const f = getNodeCenter(fn, SVG_W, SVG_H)
        const t = getNodeCenter(tn, SVG_W, SVG_H)
        const isActive = activeSet.has(e.from) && activeSet.has(e.to)
        const d = buildOrthogonalPath(f.cx, f.cy, t.cx, t.cy, e.route)
        const dx = Math.abs(t.cx - f.cx)
        const dy = Math.abs(t.cy - f.cy)
        let mx: number, my: number
        if (dy < 4 || dx < 4) {
          mx = (f.cx + t.cx) / 2; my = (f.cy + t.cy) / 2 - 10
        } else {
          const useHFirst = e.route === "h-first" || (!e.route && dx >= dy)
          if (useHFirst) { mx = t.cx; my = (f.cy + t.cy) / 2 - 5 }
          else { mx = (f.cx + t.cx) / 2; my = t.cy - 8 }
        }
        return { ...e, d, mx, my, isActive }
      }).filter(Boolean) as (WfEdge & { d: string; mx: number; my: number; isActive: boolean })[],
    [edges, nodeMap, activeSet]
  )

  return (
    <div className={cn("relative h-full w-full select-none", className)}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill={EDGE_COLOR} opacity="0.3" />
          </marker>
          <marker id="arr-active" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill={EDGE_COLOR} opacity="0.9" />
          </marker>
        </defs>

        {/* Zones */}
        {zones?.map((z, i) => (
          <g key={i}>
            <rect
              x={(z.x / 100) * SVG_W} y={(z.y / 100) * SVG_H}
              width={(z.w / 100) * SVG_W} height={(z.h / 100) * SVG_H}
              rx="6" fill={z.color || "#f0fdf4"} fillOpacity="0.06"
              stroke={z.color || "#a5d6a7"} strokeOpacity="0.3" strokeWidth="2" strokeDasharray="7 4"
            />
            <text x={(z.x / 100) * SVG_W + 10} y={(z.y / 100) * SVG_H + 14}
              fontSize="9" fontFamily="var(--font-geist-sans)" fontWeight="600"
              fill={z.color || "#2e7d32"} opacity="0.45"
            >{z.label}</text>
          </g>
        ))}

        {/* Edges */}
        {svgEdges.map((e, i) => (
          <g key={i}>
            <path d={e.d} fill="none" stroke={EDGE_COLOR}
              strokeOpacity={e.isActive ? 0.75 : 0.16}
              strokeWidth={e.isActive ? 3 : 2}
              strokeDasharray={e.dashed ? "5 3" : undefined}
              strokeLinejoin="round"
              markerEnd={e.isActive ? "url(#arr-active)" : "url(#arr)"}
              className="transition-all duration-500"
            />
            {e.label && (
              <text x={e.mx} y={e.my} textAnchor="middle" fontSize="8"
                fontFamily="var(--font-geist-sans)" fontWeight="500"
                fill={EDGE_COLOR} opacity={e.isActive ? 0.8 : 0.3}
              >{e.label}</text>
            )}
          </g>
        ))}
      </svg>

      {/* Nodes - SMALLER to prevent overlap */}
      {nodes.map((node) => {
        const cat = node.category || "io"
        const colors = CAT_COLORS[cat]
        const isInChain = activeSet.has(node.id)
        const isCurrent = currentNodeId === node.id
        const shape = node.shape ?? "rect"

        const borderC = isCurrent ? colors.border : isInChain ? colors.border : "#d0d0d0"
        const bgC = isCurrent ? colors.fill : isInChain ? colors.bg : "#fafafa"
        const shadow = isCurrent ? `0 0 10px ${colors.border}30` : "none"

        return (
          <button
            key={node.id}
            onClick={() => onNodeClick?.(node.id)}
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
            className="absolute z-10"
          >
            {shape === "diamond" ? (
              <div className="relative">
                <div className="flex h-[42px] w-[42px] rotate-45 items-center justify-center rounded-[5px] transition-all duration-400"
                  style={{ backgroundColor: bgC, border: `2px solid ${borderC}`, boxShadow: shadow }}>
                  <div className="-rotate-45 flex flex-col items-center">
                    {node.icon && <span style={{ color: colors.text }} className="[&>svg]:h-2.5 [&>svg]:w-2.5">{node.icon}</span>}
                    <span className="text-[6.5px] font-bold leading-tight text-center max-w-[34px] mt-0.5" style={{ color: colors.text }}>{node.label}</span>
                  </div>
                </div>
                {isCurrent && node.sampleOutput && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded bg-[#263238] px-2 py-0.5 text-[7px] text-[#e0e0e0] font-mono shadow-md animate-in fade-in slide-in-from-top-1 duration-300">
                    {node.sampleOutput}
                  </div>
                )}
              </div>
            ) : shape === "circle" ? (
              <div className="relative">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full transition-all duration-400"
                  style={{ backgroundColor: bgC, border: `2px solid ${borderC}`, boxShadow: shadow }}>
                  <div className="flex flex-col items-center">
                    {node.icon && <span style={{ color: colors.text }} className="[&>svg]:h-2.5 [&>svg]:w-2.5">{node.icon}</span>}
                    <span className="text-[6.5px] font-bold leading-none mt-0.5" style={{ color: colors.text }}>{node.label}</span>
                  </div>
                </div>
                {isCurrent && node.sampleOutput && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded bg-[#263238] px-2 py-0.5 text-[7px] text-[#e0e0e0] font-mono shadow-md animate-in fade-in slide-in-from-top-1 duration-300">
                    {node.sampleOutput}
                  </div>
                )}
              </div>
            ) : shape === "pill" ? (
              <div className="relative">
                <div className="flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-400"
                  style={{ backgroundColor: bgC, border: `2px solid ${borderC}`, boxShadow: shadow }}>
                  {node.icon && <span style={{ color: colors.text }} className="[&>svg]:h-2.5 [&>svg]:w-2.5">{node.icon}</span>}
                  <span className="text-[7.5px] font-bold leading-none" style={{ color: colors.text }}>{node.label}</span>
                </div>
                {isCurrent && node.sampleOutput && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded bg-[#263238] px-2 py-0.5 text-[7px] text-[#e0e0e0] font-mono shadow-md animate-in fade-in slide-in-from-top-1 duration-300">
                    {node.sampleOutput}
                  </div>
                )}
              </div>
            ) : (
              /* rect - compact */
              <div className="relative">
                <div className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-all duration-400"
                  style={{ backgroundColor: bgC, border: `2px solid ${borderC}`, boxShadow: shadow }}>
                  {node.icon && (
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded [&>svg]:h-2.5 [&>svg]:w-2.5"
                      style={{ backgroundColor: `${colors.border}15`, color: colors.text }}>
                      {node.icon}
                    </span>
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-bold leading-none whitespace-nowrap" style={{ color: colors.text }}>{node.label}</span>
                    {node.sub && <span className="text-[6.5px] leading-none mt-0.5 whitespace-nowrap" style={{ color: `${colors.text}88` }}>{node.sub}</span>}
                  </div>
                </div>
                {isCurrent && node.sampleOutput && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded bg-[#263238] px-2 py-0.5 text-[7px] text-[#e0e0e0] font-mono shadow-md animate-in fade-in slide-in-from-top-1 duration-300">
                    {node.sampleOutput}
                  </div>
                )}
              </div>
            )}
          </button>
        )
      })}

      {/* Legend - compact bottom-right */}
      {legend && legend.length > 0 && (
        <div className="absolute bottom-1.5 right-1.5 z-20 flex items-center gap-1.5 rounded border border-border/60 bg-background/85 px-1.5 py-0.5">
          <span className="text-[7px] font-medium text-foreground/35">Legend</span>
          {legend.map((l, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: CAT_COLORS[l.category].fill, border: `1px solid ${CAT_COLORS[l.category].border}` }} />
              <span className="text-[7px] text-foreground/40">{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
