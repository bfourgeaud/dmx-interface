import { useProject } from "@/context/ProjectContext"
import { FolderOpenIcon, PlusIcon, SaveIcon, Undo2Icon } from "lucide-react"
import { ActionButton } from "../ui/action-button"
import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"

export function ProjectActions() {
  const project = useProject()
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button variant={"outline"} size={"icon"} disabled>
          <Undo2Icon />
        </Button>
        <ActionButton
          variant={"outline"}
          size={"icon"}
          action={async () => await project.save()}
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
