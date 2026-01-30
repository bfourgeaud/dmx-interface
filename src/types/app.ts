export interface AppSettings {
  autoSave: boolean
  lastProjectPath: string | null
  lastUsedPort: string | null
  recentProjects: { name: string; path: string }[]
}

export interface AppPaths {
  configPath: string
  projectsPath: string
}
