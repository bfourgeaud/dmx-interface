import { useProject } from "@/context/ProjectContext"
import { PlusIcon, ScrollTextIcon } from "lucide-react"
import { useState } from "react"
import { SceneEditor } from "../project/scene-editor"
import { SceneListItem } from "../project/scene-item"
import { Button } from "../ui/button"
import { ItemGroup } from "../ui/item"

export function SceneView() {
  const { scenes } = useProject()
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    scenes.list().at(0)?.id || null,
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Colonne de gauche : Liste des scènes */}
      <div className="w-80 border-r bg-muted/20 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-background">
          <h2 className="font-semibold flex items-center gap-2">
            <ScrollTextIcon className="w-4 h-4" /> Séquence
          </h2>
          <Button size="icon" variant="ghost" onClick={() => scenes.add()}>
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>

        <ItemGroup className="flex-1 overflow-y-auto p-3 space-y-2">
          {scenes
            .list()
            .sort((a, b) => a.order - b.order)
            .map((scene) => (
              <SceneListItem
                key={scene.id}
                scene={scene}
                isActive={selectedSceneId === scene.id}
                onSelected={() => setSelectedSceneId(scene.id)}
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
      <div className="flex-1 bg-background overflow-y-auto">
        {selectedSceneId ? (
          <SceneEditor sceneId={selectedSceneId} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <ScrollTextIcon className="w-12 h-12 mb-4 opacity-20" />
            <p>Sélectionnez une scène pour l'éditer</p>
          </div>
        )}
      </div>
    </div>
  )
}
