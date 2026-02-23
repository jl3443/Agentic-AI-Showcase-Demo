"use client"

import { SlideDeck } from "@/components/showcase/slide-deck"
import { CoverSlide } from "@/components/showcase/slides/cover-slide"
import { ArchitectureSlide } from "@/components/showcase/slides/architecture-slide"
import { WorkflowOverviewSlide } from "@/components/showcase/slides/workflow-overview-slide"
import { WorkflowSlide } from "@/components/showcase/slides/workflow-slide"
import { PatternsSlide } from "@/components/showcase/slides/patterns-slide"
import { OrchestrationSlide } from "@/components/showcase/slides/orchestration-slide"
import { GovernanceSlide } from "@/components/showcase/slides/governance-slide"
import { UIAgentsSlide } from "@/components/showcase/slides/ui-agents-slide"
import { ResearchSlide } from "@/components/showcase/slides/research-slide"

const titles = [
  "Cover",
  "Five Core Components",
  "Collaboration Patterns",
  "Multi-Agent Orchestration",
  "Controlling Autonomous AI",
  "How AI Prevents Scrap",
  "Live AI Production Supervisor",
  "UI Agents",
  "Executive Summary",
]

export default function ShowcasePage() {
  return (
    <SlideDeck titles={titles}>
      <CoverSlide />
      <ArchitectureSlide />
      <PatternsSlide />
      <OrchestrationSlide />
      <GovernanceSlide />
      <WorkflowOverviewSlide />
      <WorkflowSlide />
      <UIAgentsSlide />
      <ResearchSlide />
    </SlideDeck>
  )
}
