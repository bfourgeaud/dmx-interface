import { SceneAPI } from "@/hooks/use-scene-api"
import { cn } from "@/lib/utils"
import { basename } from "@tauri-apps/api/path"
import { open } from "@tauri-apps/plugin-dialog"
import {
  EditIcon,
  LightbulbIcon,
  MusicIcon,
  PlayIcon,
  SquareIcon,
  TrashIcon,
} from "lucide-react"
import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { InputGroup, InputGroupAddon } from "../ui/input-group"
import { Label } from "../ui/label"
import { InputGroupNumberInput } from "../ui/number-input"
import { Slider } from "../ui/slider"
import { Switch } from "../ui/switch"
import { SceneLightEditor } from "./scene-editor"

export function ActionItem({
  action,
  readonly = false,
}: {
  action: SceneAPI.Action
  readonly?: boolean
}) {
  const isAudio = action.type.startsWith("AUDIO")

  const handleTogglePlay = () =>
    action.isPlaying ? action.stop() : action.play()

  return (
    <Collapsible
      className={cn("bg-muted rounded text-muted-foreground overflow-hidden")}
      style={{ marginLeft: `${action.startTime * 4}px` }}
    >
      <div className="flex gap-8 justify-between">
        <div className="flex items-center gap-4 flex-1 p-2">
          <div
            className={cn(
              "p-1.5 rounded",
              isAudio
                ? "bg-blue-500/20 text-blue-500"
                : "bg-yellow-500/20 text-yellow-500",
            )}
          >
            {isAudio ? (
              <MusicIcon className="w-4 h-4" />
            ) : (
              <LightbulbIcon className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider opacity-50">
              {action.type.replace("_", " ")}
            </span>
            <ActionHeaderContent action={action} />
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          {!readonly && (
            <InputGroup>
              <InputGroupNumberInput
                value={action.startTime}
                onChange={(v) => action.update({ startTime: v ?? 0 })}
                min={0}
                className="w-20"
              />
              {/* <InputGroupAddon align="inline-start">départ</InputGroupAddon> */}
              <InputGroupAddon align="inline-end">s</InputGroupAddon>
            </InputGroup>
          )}
          <ButtonGroup>
            <Button size="icon-sm" onClick={handleTogglePlay}>
              {action.isPlaying ? (
                <SquareIcon className="fill-current" />
              ) : (
                <PlayIcon />
              )}
            </Button>
            {!readonly && (
              <>
                <CollapsibleTrigger asChild>
                  <Button size={"icon-sm"}>
                    <EditIcon />
                  </Button>
                </CollapsibleTrigger>
                <Button size={"icon-sm"} onClick={() => action.delete()}>
                  <TrashIcon />
                </Button>
              </>
            )}
          </ButtonGroup>
        </div>
      </div>
      <CollapsibleContent className="p-4 bg-background/30 border-t border-border">
        <ActionDetails action={action} />
      </CollapsibleContent>
    </Collapsible>
  )
}

function ActionHeaderContent({ action }: { action: SceneAPI.Action }) {
  switch (action.type) {
    case "AUDIO_PLAY":
      return (
        <span className="text-xs italic truncate">
          {action.trackName || "Sélectionner un fichier..."}
        </span>
      )
    case "LIGHT_SET":
      return (
        <span className="text-xs italic">
          {Object.keys(action.values).length} canaux modifiés
        </span>
      )
    case "LIGHT_BLACKOUT":
      return (
        <span className="text-xs font-bold text-orange-500">Noir Total</span>
      )
    default:
      return null
  }
}

function ActionDetails({ action }: { action: SceneAPI.Action }) {
  switch (action.type) {
    case "AUDIO_PLAY":
      return <AudioSettings action={action} />
    case "LIGHT_SET":
      return <SceneLightEditor action={action} />
    default:
      return (
        <div className="text-xs opacity-50">Aucun paramètre supplémentaire</div>
      )
  }
}

function AudioSettings({
  action,
}: {
  action: Extract<SceneAPI.Action, { type: "AUDIO_PLAY" }>
}) {
  const handleFileSelect = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Audio",
          extensions: ["mp3", "wav", "ogg", "m4a"],
        },
      ],
    })

    if (selected && typeof selected === "string") {
      // On récupère juste le nom du fichier pour l'affichage (trackName)
      const name = await basename(selected)

      action.update({
        path: selected, // Le vrai chemin absolu pour le moteur audio
        trackName: name, // Le nom lisible pour l'UI
      })
    }
  }

  return (
    <div className="grid gap-4 max-w-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {action.trackName || "Aucun fichier..."}
        </span>
        <Button size="sm" variant="outline" onClick={handleFileSelect}>
          Parcourir
        </Button>
      </div>
      <div className="grid gap-1.5">
        <Label>Volume</Label>
        <div className="flex items-center gap-2">
          <Slider
            min={0}
            max={100}
            orientation="horizontal"
            value={[action.volume * 100]}
            onValueChange={(vals) =>
              action.update({ volume: (vals.at(0) ?? 0) / 100 })
            }
          />
          <span>{action.volume * 100}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="loop-mode"
          checked={action.loop}
          onCheckedChange={(v) => action.update({ loop: v })}
        />
        <Label htmlFor="loop-mode">Répéter ?</Label>
      </div>
    </div>
  )
}
