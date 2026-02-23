import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Agentic AI Knowledge Showcase",
    template: "%s | Agentic AI",
  },
  description:
    "Agentic AI Knowledge Showcase - A comprehensive system covering architecture design, collaboration patterns, production governance, AgentOps, and research directions.",
  keywords: [
    "Agentic AI",
    "AI Agent",
    "Multi-Agent",
    "ReAct",
    "AgentOps",
    "LLM",
    "AI Governance",
    "AI Architecture",
  ],
  authors: [{ name: "Agentic AI Learner" }],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
