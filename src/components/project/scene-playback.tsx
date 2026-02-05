import { useProject } from "@/context/ProjectContext"
import { useMemo } from "react"
import { ActionItem } from "./action-item"

export function ScenePlayback({ sceneId }: { sceneId: string }) {
  const { scenes } = useProject()
  const currentScene = scenes.get(sceneId)

  if (!currentScene) return null

  const actions = useMemo(() => {
    return currentScene.actions.list()
  }, [currentScene.actions])

  return (
    <div className="p-6 space-y-8">
      <div className="relative space-y-4">
        {/* La ligne verticale de la timeline */}
        <PlayHead />

        {currentScene.actions.count() === 0 ? (
          <div className="pl-16 py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Aucune action dans cette scène.
          </div>
        ) : (
          actions.map((action) => (
            <ActionItem key={action.id} action={action} readonly />
          ))
        )}
      </div>
    </div>
  )
}

function PlayHead() {
  return <div className="absolute left-0 -top-4 -bottom-10 w-0.5 bg-primary" />
}
