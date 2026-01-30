import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export function FaderGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dmx-fader-group"
      className={cn("flex items-start", className)}
      {...props}
    />
  )
}
