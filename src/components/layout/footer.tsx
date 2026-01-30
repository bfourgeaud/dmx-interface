import { useApp } from "@/context/AppContext"
import { useProject } from "@/context/ProjectContext"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export function AppFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      className={cn("bg-secondary p-2 flex justify-between text-xs", className)}
      {...props}
    >
      <ProjectInfo />
      <AppStatusIndicator />
    </footer>
  )
}

function ProjectInfo() {
  const { name } = useProject()
  return <span>{`Projet : ${name}`}</span>
}

function AppStatusIndicator() {
  const { error, isConnected } = useApp()

  return (
    <div
      className={cn("flex items-center gap-1 font-medium", {
        "text-destructive": error,
      })}
    >
      <div
        className={cn("rounded-full size-3", {
          "bg-primary": !error && !isConnected,
          "bg-green-500": !error && isConnected,
          "bg-destructive": error,
        })}
      />
      <span>{error ?? (isConnected ? "Connecté" : "Non connecté")}</span>
    </div>
  )
}
