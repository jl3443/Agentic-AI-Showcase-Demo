"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  Boxes,
  GitFork,
  Network,
  ShieldCheck,
  Workflow,
  Play,
  MonitorSmartphone,
  ClipboardList,
  Settings,
} from "lucide-react"

const navIcons = [
  Home,
  Boxes,
  GitFork,
  Network,
  ShieldCheck,
  Workflow,
  Play,
  MonitorSmartphone,
  ClipboardList,
]

const navDescriptions = [
  "Introduction & overview",
  "5 Core components",
  "4 Collaboration modes",
  "Multi-agent systems",
  "Lifecycle control",
  "How AI prevents scrap",
  "Live AI supervisor",
  "Browser & UI agents",
  "Key takeaways",
]

interface SlideDeckProps {
  children: React.ReactNode[]
  titles: string[]
}

export function SlideDeck({ children, titles }: SlideDeckProps) {
  const [current, setCurrent] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const total = children.length

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current || index < 0 || index >= total) return
      setIsAnimating(true)
      setCurrent(index)
      setSlideKey((k) => k + 1)
      setMobileNav(false)
      setTimeout(() => setIsAnimating(false), 450)
    },
    [current, total, isAnimating],
  )

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next() }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev() }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [next, prev])

  return (
    <div className="relative flex h-screen w-screen bg-background overflow-hidden">
      {/* ───── Desktop Sidebar ───── */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full border-r border-border bg-card shrink-0 transition-all duration-300",
          isCollapsed ? "w-[52px]" : "w-[240px]",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
                  <path d="M8 1l6 3.5v7L8 15l-6-3.5v-7L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 8V1M8 8l6 3.5M8 8L2 11.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">Agentic AI</div>
                <div className="text-[11px] text-muted-foreground leading-none">Knowledge Showcase</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col gap-0.5">
            {titles.map((title, i) => {
              const Icon = navIcons[i] || Boxes
              const isActive = i === current
              return (
                <li key={i}>
                  <button
                    onClick={() => goTo(i)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      isCollapsed && "justify-center px-0",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                    aria-label={title}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-foreground")} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-medium truncate">{title}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                          {navDescriptions[i]}
                        </div>
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-2 border-t border-border">
          <button
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isCollapsed && "justify-center px-0",
            )}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!isCollapsed && <span className="text-[13px]">Settings</span>}
          </button>
        </div>
      </aside>

      {/* ───── Main content area ───── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex md:hidden h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Toggle navigation"
            >
              {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-sm font-semibold text-foreground">Agentic AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {String(current + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
            <button onClick={prev} disabled={current === 0} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground disabled:opacity-25" aria-label="Previous">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={next} disabled={current === total - 1} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-25" aria-label="Next">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileNav && (
          <div className="absolute inset-x-0 top-12 bottom-0 z-20 bg-background/95 backdrop-blur-sm md:hidden slide-enter">
            <nav className="flex flex-col p-3 gap-0.5">
              {titles.map((title, i) => {
                const Icon = navIcons[i] || Boxes
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      i === current ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div>
                      <span className="text-sm font-medium">{title}</span>
                      <div className="text-[11px] text-muted-foreground">{navDescriptions[i]}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        )}

        {/* Content header bar */}
        <div className="hidden md:flex h-12 shrink-0 items-center justify-between border-b border-border px-6">
          <div>
            <h1 className="text-sm font-semibold text-foreground">{titles[current]}</h1>
            <p className="text-[11px] text-muted-foreground leading-none">{navDescriptions[current]}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
              {String(current + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
            <button onClick={prev} disabled={current === 0} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground hover:bg-accent disabled:opacity-25 disabled:cursor-not-allowed" aria-label="Previous slide">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={next} disabled={current === total - 1} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-25 disabled:cursor-not-allowed" aria-label="Next slide">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Slide content */}
        <main className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div key={slideKey} className="relative z-10 h-full w-full slide-enter">
            {children[current]}
          </div>
        </main>
      </div>
    </div>
  )
}
