import { SceneAPI } from "@/hooks/use-scene-api"
import { pluralString } from "@/lib/helpers/string"
import { cn } from "@/lib/utils"
import { SceneTrigger } from "@/types/scene"
import {
  ClockIcon,
  MousePointer2Icon,
  PlayIcon,
  SquareIcon,
} from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "../ui/item"

interface SceneListItemProps {
  scene: SceneAPI.Item
  isActive: boolean
  onSelected?: () => void
}

export function SceneListItem({
  scene,
  isActive,
  onSelected,
}: SceneListItemProps) {
  return (
    <Item
      onClick={onSelected}
      className={cn("hover:bg-muted select-none", { "bg-muted": isActive })}
    >
      {/* <ItemMedia>{scene.order}</ItemMedia> */}
      <ItemContent>
        <ItemHeader>
          <ItemTitle>{scene.name}</ItemTitle>
          <ItemDescription>
            <SceneTriggerItem trigger={scene.trigger} />
          </ItemDescription>
        </ItemHeader>

        <ItemFooter>
          {pluralString(scene.actions.count(), "action", "actions")}
        </ItemFooter>
      </ItemContent>
      <ItemActions>
        <Button
          variant={"outline"}
          size={"icon-sm"}
          onClick={scene.isPlaying ? scene.stop : scene.play}
        >
          {scene.isPlaying ? (
            <SquareIcon className="fill-current" />
          ) : (
            <PlayIcon />
          )}
        </Button>
      </ItemActions>
    </Item>
  )
}

function SceneTriggerItem({ trigger }: { trigger: SceneTrigger }) {
  switch (trigger.type) {
    case "manual":
      return (
        <Badge variant="outline" className="text-[10px] gap-1 px-1 py-0 h-4">
          <MousePointer2Icon className="w-2.5 h-2.5" /> Manuel
        </Badge>
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
