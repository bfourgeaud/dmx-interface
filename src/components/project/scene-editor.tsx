import {
  DMXFader,
  DMXFaderLabel,
  DMXFaderSlider,
  DMXFaderValue,
} from "@/components/dmx/fader"
import { FaderGroup } from "@/components/dmx/fader-group"
import { useProject } from "@/context/ProjectContext"
import { SceneAPI } from "@/hooks/use-scene-api"
import { SceneTrigger } from "@/types/scene"
import {
  LightbulbIcon,
  LightbulbOff,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
} from "lucide-react"
import { useMemo } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { ActionItem } from "./action-item"

export function SceneEditor({ sceneId }: { sceneId: string }) {
  const { scenes } = useProject()
  const currentScene = useMemo(() => scenes.get(sceneId), [scenes, sceneId])

  if (!currentScene) return null

  const actions = useMemo(() => {
    return currentScene.actions.list()
  }, [currentScene.actions])

  return (
    <div className="p-6 space-y-8 size-full flex flex-col">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">{currentScene.name}</h2>
          <p className="text-sm text-muted-foreground">
            Configurez la chronologie des événements de cette scène.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Menu rapide pour ajouter des actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <LightbulbIcon className="w-4 h-4 mr-2" /> Lumière
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => currentScene.actions.add("LIGHT_SET")}
              >
                <LightbulbIcon />
                Changement
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentScene.actions.add("LIGHT_BLACKOUT")}
              >
                <LightbulbOff />
                Blackout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentScene.actions.add("AUDIO_PLAY")}
              >
                <MusicIcon className="w-4 h-4 mr-2" /> Audio
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => currentScene.actions.add("AUDIO_PLAY")}
              >
                <PlayIcon />
                Lecture
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentScene.actions.add("AUDIO_STOP")}
              >
                <PauseIcon />
                Arrêt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentScene.actions.add("AUDIO_VOLUME")}
              >
                <Volume2Icon />
                Volume
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative space-y-4 flex-1">
        {/* La ligne verticale de la timeline */}
        {/* <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted" /> */}

        {currentScene.actions.count() === 0 ? (
          <div className="pl-16 py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            Aucune action dans cette scène. Cliquez sur les boutons ci-dessus
            pour commencer.
          </div>
        ) : (
          actions.map((action) => (
            <ActionItem key={action.id} action={action} />
          ))
        )}
      </div>
      <SceneTriggerEditor scene={currentScene} />
    </div>
  )
}

export function SceneLightEditor({
  action,
}: {
  action: Extract<SceneAPI.Action, { type: "LIGHT_SET" }>
}) {
  const { data } = useProject()

  const handleValueChange = (address: number, value: number) => {
    // On met à jour le dictionnaire des valeurs de l'action
    const newValues = {
      ...action.values,
      [address.toString()]: value,
    }
    action.update({ values: newValues })
  }

  return (
    <FaderGroup className="gap-2">
      {data.fixtures.map((f) => (
        <FaderGroup key={f.id}>
          {f.channels.map((c) => {
            const addr = f.startAddress + c.number
            return (
              <DMXFader
                key={c.id}
                address={addr}
                onChange={(v) => handleValueChange(addr, v)}
              >
                <DMXFaderLabel>{c.type}</DMXFaderLabel>
                <DMXFaderValue />
                <DMXFaderSlider />
              </DMXFader>
            )
          })}
        </FaderGroup>
      ))}
    </FaderGroup>
  )
}

export function SceneTriggerEditor({ scene }: { scene: SceneAPI.Item }) {
  const handleUpdateTrigger = (type: SceneTrigger["type"]) => {
    switch (type) {
      case "auto":
        scene.update({ trigger: { type: "auto", delay: 0 } })
        break
      case "manual":
        scene.update({ trigger: { type: "manual", helperText: "" } })
        break
      case "follow":
        scene.update({ trigger: { type: "follow" } })
        break
    }
  }

  return (
    <div className="flex flex-col gap-4 p-2 border rounded">
      <h2 className="font-medium text-lg">Déclenchement</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="helperText">Mode</Label>
        <Select
          value={scene.trigger.type}
          onValueChange={(v) => handleUpdateTrigger(v as SceneTrigger["type"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="manual">Manuel</SelectItem>
            <SelectItem value="follow">Suivant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scene.trigger.type === "manual" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="helperText">Texte TOP</Label>
          <Input
            id="helperText"
            value={scene.trigger.helperText}
            onChange={(v) =>
              scene.update({
                trigger: { type: "manual", helperText: v.currentTarget.value },
              })
            }
          />
        </div>
      )}
    </div>
  )
}
