import { AppSettings } from "@/types/app"
import { ViewItem } from "@/types/navigation"
import { Project } from "@/types/project"

export const DEFAULT_SETTINGS: AppSettings = {
  autoSave: false,
  lastProjectPath: null,
  lastUsedPort: null,
  recentProjects: [],
}

export const APP_VIEWS: ViewItem[] = [
  { id: "fixtures", label: "Fixtures" },
  { id: "scenes", label: "Scenes" },
  { id: "live", label: "Live" },
]

export const APP_PATHS = {
  PROJECTS_DIR: "projects",
  SETTINGS_FILE: "settings.json",
}

export const DEFAULT_PROJECT: Project = {
  id: crypto.randomUUID(),
  fixtures: [],
  scenes: [],
}
