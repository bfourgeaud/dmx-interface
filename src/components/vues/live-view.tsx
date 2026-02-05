import { useProject } from "@/context/ProjectContext"
import { SceneAPI } from "@/hooks/use-scene-api"
import { SceneTrigger } from "@/types/scene"
import { ClockIcon, ScrollTextIcon } from "lucide-react"
import { useEffect, useEffectEvent, useMemo, useState } from "react"
import { SceneListItem } from "../project/scene-item"
import { ScenePlayback } from "../project/scene-playback"
import { Badge } from "../ui/badge"
import { ItemGroup } from "../ui/item"

interface LiveSet {
  current: SceneAPI.Item | null
  next: SceneAPI.Item | null
}

export function LiveView() {
  const { scenes } = useProject()
  const sortedLists = scenes.list().sort((a, b) => a.order - b.order)

  // 2. On ne stocke QUE l'ID de la scène active
  const [currentId, setCurrentId] = useState<string | null>(null)

  // 3. On dérive current et next dynamiquement
  const currentIndex = useMemo(
    () => sortedLists.findIndex((s) => s.id === currentId),
    [currentId, sortedLists],
  )

  const currentScene = useMemo(
    () => (currentIndex !== -1 ? sortedLists[currentIndex] : null),
    [currentIndex, sortedLists],
  )

  const nextScene = useMemo(
    () =>
      currentIndex !== -1 ? sortedLists[currentIndex + 1] : sortedLists[0],
    [currentIndex, sortedLists],
  )

  const playNextScene = useEffectEvent(() => {
    if (nextScene) {
      // Si une scène joue déjà, on peut l'arrêter (optionnel selon ton workflow)
      currentScene?.stop()

      setCurrentId(nextScene.id)
      nextScene.play()
    } else {
      currentScene?.stop()
      setCurrentId(null)
    }
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // On évite de déclencher si on tape dans un input
      if (event.key === " ") {
        event.preventDefault()
        playNextScene()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Colonne de gauche : Liste des scènes */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-background">
          <h2 className="font-semibold flex items-center gap-2">
            <ScrollTextIcon className="w-4 h-4" /> Séquence
          </h2>
        </div>

        <ItemGroup className="flex-1 overflow-y-auto p-3 space-y-2">
          {sortedLists.map((scene) => (
            <SceneListItem
              key={scene.id}
              scene={scene}
              isActive={currentId === scene.id}
              onSelected={() => {
                setCurrentId(scene.id)
                scene.play()
              }}
            />
          ))}

          {scenes.count() === 0 && (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg mt-4">
              <p className="text-xs text-muted-foreground">
                Aucune scène créée.
              </p>
            </div>
          )}
        </ItemGroup>
      </div>

      {/* Colonne de droite : Éditeur de détail */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {currentScene ? (
          <>
            <ScenePlayback sceneId={currentScene.id} />
            {nextScene && (
              <div className="p-4 bg-primary/5 border-t mt-auto">
                <p className="text-[10px] uppercase tracking-widest opacity-50">
                  Prochaine scène (Espace)
                </p>
                <SceneTriggerInfo trigger={nextScene.trigger} />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <ScrollTextIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>
              Pour démarrer, séléctionnez une scène ou appuyez sur la barre
              espace.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SceneTriggerInfo({ trigger }: { trigger: SceneTrigger }) {
  switch (trigger.type) {
    case "manual":
      return (
        <p className="font-bold text-xl">{trigger.helperText ?? "Manuel"}</p>
      )
    case "auto":
      return (
        <Badge variant="secondary" className="text-[10px] gap-1 px-1 py-0 h-4">
          <ClockIcon className="w-2.5 h-2.5" /> {trigger.delay}ms
        </Badge>
      )
    default:
      return null
  }
}
