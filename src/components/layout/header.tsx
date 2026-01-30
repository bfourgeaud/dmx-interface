import { cn } from "@/lib/utils"
import { ComponentProps } from "react"
import { ProjectActions } from "../project/project-actions"
import { PortSelector } from "./PortSelector"

export function AppHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "bg-secondary p-2 flex items-center justify-between",
        className,
      )}
      {...props}
    >
      <PortSelector />
      <ProjectActions />
    </header>
  )
}
