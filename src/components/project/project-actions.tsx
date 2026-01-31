import { useProject } from "@/context/ProjectContext"
import {
  FolderOpenIcon,
  PlusIcon,
  RedoIcon,
  SaveIcon,
  Undo2Icon,
} from "lucide-react"
import { ActionButton } from "../ui/action-button"
import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"

export function ProjectActions() {
  const project = useProject()
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={!project.canUndo}
          onClick={project.undo}
        >
          <Undo2Icon />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={!project.canRedo}
          onClick={project.redo}
        >
          <RedoIcon />
        </Button>
        <ActionButton
          variant={"outline"}
          size={"icon"}
          action={async () => await project.save()}
          disabled={!project.shouldSave}
        >
          <SaveIcon />
        </ActionButton>
      </ButtonGroup>

      <ButtonGroup>
        <ActionButton
          variant={"outline"}
          size={"icon"}
          action={async () => await project.load()}
        >
          <FolderOpenIcon />
        </ActionButton>
        <Button variant={"outline"} size={"icon"} onClick={project.new}>
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}
