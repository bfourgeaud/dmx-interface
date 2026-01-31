// src/hooks/useKeyboardShortcuts.ts
import { useProject } from "@/context/ProjectContext"
import { useEffect } from "react"

export function useKeyboardShortcuts() {
  const project = useProject()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Vérifier si l'utilisateur n'est pas en train de taper dans un Input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      const isCtrl = event.ctrlKey || event.metaKey // Meta pour Mac

      // Ctrl + S : Sauvegarder
      if (isCtrl && event.key === "s") {
        event.preventDefault()
        project.save()
      }

      // Ctrl + Z : Undo
      if (isCtrl && event.key === "z" && !event.shiftKey) {
        event.preventDefault()
        project.undo()
      }

      // Ctrl + Y ou Ctrl + Shift + Z : Redo
      if (
        (isCtrl && event.key === "y") ||
        (isCtrl && event.shiftKey && event.key === "Z")
      ) {
        event.preventDefault()
        project.redo()
      }

      // Ctrl + N : Nouveau projet
      if (isCtrl && event.key === "n") {
        event.preventDefault()
        project.new()
      }

      // Ctrl + O : Ouvrir projet
      if (isCtrl && event.key === "o") {
        event.preventDefault()
        project.load()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [project])
}
