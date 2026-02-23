"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react"

interface SlideDeckProps {
  children: React.ReactNode[]
  titles: string[]
}

export function SlideDeck({ children, titles }: SlideDeckProps) {
  const [current, setCurrent] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const total = children.length

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current || index < 0 || index >= total) return
      setIsAnimating(true)
      setCurrent(index)
      setSlideKey((k) => k + 1)
      setMobileNav(false)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [current, total, isAnimating]
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
    <div className="relative flex h-screen w-screen flex-col bg-background md:h-screen md:overflow-hidden">
      {/* Top bar - clean, minimal */}
      <header className="relative z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
              <path d="M8 1l6 3.5v7L8 15l-6-3.5v-7L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 8V1M8 8l6 3.5M8 8L2 11.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-foreground">Agentic AI</span>
            <span className="text-[10px] text-muted-foreground hidden sm:block leading-none">{titles[current]}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="hidden items-center gap-1 sm:flex">
            {titles.map((title, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide: ${title}`}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === current ? "w-6 bg-primary" : i < current ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
            {String(current + 1).padStart(2, "0")}<span className="text-border mx-0.5">/</span>{String(total).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              disabled={current === 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary disabled:opacity-25 disabled:cursor-not-allowed"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              disabled={current === total - 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-25 disabled:cursor-not-allowed"
              aria-label="Next slide"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileNav && (
        <div className="absolute inset-x-0 top-12 bottom-0 z-20 bg-background/95 backdrop-blur-sm md:hidden slide-enter">
          <nav className="flex flex-col p-4 gap-1">
            {titles.map((title, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  i === current ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <span className="text-xs font-mono tabular-nums w-5">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-medium">{title}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Slide area - full bleed white bg */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="relative h-full w-full max-w-[1440px] overflow-hidden bg-background md:m-4 md:h-[calc(100%-2rem)] md:rounded-xl md:border md:border-border md:shadow-sm">
          {/* Subtle dot grid */}
          <div className="absolute inset-0 dot-grid opacity-25" />
          {/* Slide content */}
          <div key={slideKey} className="relative z-10 flex h-full w-full flex-col slide-enter">
            {children[current]}
          </div>
        </div>
      </main>
    </div>
  )
}
