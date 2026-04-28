"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Label as LabelPrimitive } from "radix-ui"
import * as React from "react"

const LABEL_CLASSES = `
  flex items-center gap-2 text-sm leading-none font-medium select-none
  group-data-[disabled=true]/field:pointer-events-none
  group-data-[disabled=true]/field:opacity-50
  peer-disabled:cursor-not-allowed peer-disabled:opacity-50
`

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(LABEL_CLASSES, className)}
      {...props}
    />
  )
}
