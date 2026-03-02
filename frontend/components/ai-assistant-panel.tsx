"use client"

import * as React from "react"
import { Brain, Send, X, Loader2 } from "lucide-react"

import { useAIChat } from "@/hooks/use-ai-chat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { AIChatMessage } from "@/lib/types"

export function AIAssistantPanel() {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<AIChatMessage[]>([])
  const [conversationId, setConversationId] = React.useState<string | undefined>()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const chatMutation = useAIChat()

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when panel opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || chatMutation.isPending) return

    const userMessage: AIChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    chatMutation.mutate(
      { message: trimmed, conversation_id: conversationId },
      {
        onSuccess: (data) => {
          setConversationId(data.conversation_id)
          const assistantMessage: AIChatMessage = {
            role: "assistant",
            content: data.response,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        },
        onError: () => {
          const errorMessage: AIChatMessage = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, errorMessage])
        },
      }
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Brain className="size-4" />
          <span className="sr-only">AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[440px] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Brain className="size-4 text-primary" />
            AP AI Assistant
          </SheetTitle>
        </SheetHeader>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-8 space-y-3">
              <Brain className="size-10 mx-auto text-muted-foreground/50" />
              <p className="font-medium">AP AI Assistant</p>
              <p className="text-xs max-w-[280px] mx-auto">
                Ask me about invoices, exceptions, approvals, vendor status, or AP best practices.
              </p>
              <div className="space-y-1.5 text-xs">
                <button
                  className="block w-full text-left px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
                  onClick={() => {
                    setInput("How many invoices are pending approval?")
                    inputRef.current?.focus()
                  }}
                >
                  &quot;How many invoices are pending approval?&quot;
                </button>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
                  onClick={() => {
                    setInput("Summarize today's open exceptions")
                    inputRef.current?.focus()
                  }}
                >
                  &quot;Summarize today&apos;s open exceptions&quot;
                </button>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
                  onClick={() => {
                    setInput("What should I prioritize right now?")
                    inputRef.current?.focus()
                  }}
                >
                  &quot;What should I prioritize right now?&quot;
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 className="size-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t px-4 py-3 shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AP operations..."
              className="flex-1 h-9"
              disabled={chatMutation.isPending}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="h-9 px-3"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
