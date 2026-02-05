import { AppSettings } from "@/types/app"
import { ViewItem } from "@/types/navigation"
import { Project } from "@/types/project"
import { Scene } from "@/types/scene"

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

export const DEFAULT_SCENE: Omit<Scene, "id" | "order"> = {
  name: "Nouvelle scène",
  trigger: { type: "manual" },
  duration: "auto",
  actions: [],
}

export const CHANNEL_TYPES = {
  dimmer: "Dimmer",
  red: "Rouge",
  green: "Vert",
  blue: "Bleu",
  white: "Blanc",
  pan: "Pan (Horizontal)",
  tilt: "Tilt (Vertical)",
  strobe: "Strobe",
  raw: "Custom / Autre",
} as const
