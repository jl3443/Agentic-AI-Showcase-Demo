"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SlideDeckProps {
  children: React.ReactNode[]
  titles: string[]
}

export function SlideDeck({ children, titles }: SlideDeckProps) {
  const [current, setCurrent] = useState(0)
  const [slideKey, setSlideKey] = useState(0) // forces re-mount for entry animation
  const [isAnimating, setIsAnimating] = useState(false)
  const total = children.length

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating || index === current || index < 0 || index >= total) return
      setIsAnimating(true)
      setCurrent(index)
      setSlideKey((k) => k + 1)
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
    <div className="relative flex h-screen w-screen flex-col bg-background">
      {/* Top bar */}
      <header className="relative z-20 flex h-11 shrink-0 items-center justify-between border-b-2 border-border px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
              <path d="M8 1l6 3.5v7L8 15l-6-3.5v-7L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 8V1M8 8l6 3.5M8 8L2 11.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold font-mono tracking-wide text-foreground">AGENTIC AI</span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">/ {titles[current]}</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </header>

      {/* Slide area */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-6">
        <div className="relative aspect-video w-full max-h-full max-w-[1280px] overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm">
          {/* Dot grid */}
          <div className="absolute inset-0 dot-grid opacity-40" />
          {/* Slide with entry animation key */}
          <div key={slideKey} className="relative z-10 flex h-full w-full flex-col slide-enter">
            {children[current]}
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <footer className="relative z-20 flex h-12 shrink-0 items-center justify-between border-t-2 border-border px-5">
        <div className="flex items-center gap-1.5">
          {titles.map((title, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide: ${title}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-7 bg-primary" : i < current ? "w-1.5 bg-primary/30" : "w-1.5 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={next}
            disabled={current === total - 1}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  )
}
