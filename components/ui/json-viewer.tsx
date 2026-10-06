"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface JsonViewerProps extends React.HTMLAttributes<HTMLPreElement> {
  data: unknown
}

export function JsonViewer({ data, className, ...props }: JsonViewerProps) {
  return (
    <pre
      className={cn(
        "json-viewer-theme font-mono text-xs md:text-sm leading-relaxed overflow-auto max-h-[500px] selection:bg-zinc-800",
        className
      )}
      {...props}
    >
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  )
}
