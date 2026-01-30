import { AppPaths, AppSettings } from "@/types/app"
import { appConfigDir, join } from "@tauri-apps/api/path"
import {
  open as openFileDialog,
  save as saveFileDialog,
} from "@tauri-apps/plugin-dialog"
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs"
import { APP_PATHS, DEFAULT_SETTINGS } from "./constants"

/**
 * Initialise l'environnement de l'application
 * @returns Le chemin du dossier de config
 */
export async function initAppFilesystem(): Promise<AppPaths> {
  const configPath = await appConfigDir()
  const projectsPath = await join(configPath, APP_PATHS.PROJECTS_DIR)
  const settingsPath = await join(configPath, APP_PATHS.SETTINGS_FILE)

  // Création récursive des dossiers nécessaires
  if (!(await exists(configPath))) {
    await mkdir(configPath, { recursive: true })
  }

  // Création récursive des dossiers nécessaires
  if (!(await exists(projectsPath))) {
    await mkdir(projectsPath, { recursive: true })
  }

  // Création du fichier de configuration

  if (!(await exists(settingsPath))) {
    await saveJson(settingsPath, DEFAULT_SETTINGS)
  }

  return { configPath, projectsPath }
}

export async function saveJson<T>(path: string, data: T) {
  const content = JSON.stringify(data, null, 2)
  await writeTextFile(path, content)
}

export async function loadJson<T>(path: string): Promise<T> {
  const content = await readTextFile(path)
  return JSON.parse(content) as T
}

export async function getSavePath(
  defaultName: string,
  opts?: { defaultDir?: string; title?: string },
) {
  return await saveFileDialog({
    title: opts?.title ?? "Enregistrer le projet",
    defaultPath: opts?.defaultDir
      ? await join(opts.defaultDir, `${defaultName}.json`)
      : `${defaultName}.json`,
    filters: [{ name: "Projet DMX", extensions: ["json"] }],
  })
}

export async function getOpenPath(defaultDir?: string): Promise<string | null> {
  const selected = await openFileDialog({
    multiple: false,
    title: "Ouvrir un projet",
    defaultPath: defaultDir,
    filters: [{ name: "Projet DMX", extensions: ["json"] }],
  })

  if (!selected) return null
  // Sur desktop, openFileDialog retourne une string (le path)
  return Array.isArray(selected) ? selected[0] : selected
}

export async function saveSettings(configPath: string, settings: AppSettings) {
  const path = await join(configPath, APP_PATHS.SETTINGS_FILE)
  await saveJson(path, settings)
}

export async function loadSettings(configPath: string): Promise<AppSettings> {
  const path = await join(configPath, APP_PATHS.SETTINGS_FILE)
  if (!(await exists(path))) {
    return DEFAULT_SETTINGS
  }
  try {
    return await loadJson<AppSettings>(path)
  } catch {
    return DEFAULT_SETTINGS
  }
}
