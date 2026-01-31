import { useProject } from "@/context/ProjectContext"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { ask } from "@tauri-apps/plugin-dialog"
import { useEffect } from "react"

export function useUnsavedClose() {
  const project = useProject()
  useEffect(() => {
    const unlisten = getCurrentWindow().onCloseRequested(async (event) => {
      if (project.shouldSave) {
        const confirm = await ask(
          "Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?",
          { title: "DMX Control", kind: "warning" },
        )

        if (!confirm) {
          event.preventDefault() // Annule la fermeture
        }
      }
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [project.shouldSave])
}
