import { APP_PATHS, DEFAULT_PROJECT } from "@/lib/constants"
import { getOpenPath, getSavePath, loadJson, saveJson } from "@/lib/fs"
import { projectReducer, ProjectState } from "@/lib/project-handler"
import { DmxFixture } from "@/types/dmx"
import { Project } from "@/types/project"
import { basename, join } from "@tauri-apps/api/path"
import { ask } from "@tauri-apps/plugin-dialog"
import { exists } from "@tauri-apps/plugin-fs"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { useApp } from "./AppContext"

const initialState: ProjectState = {
  past: [],
  present: DEFAULT_PROJECT,
  future: [],
  isDirty: false,
}

interface ProjectContextType {
  data: Project
  fixtures: {
    add: (data: Omit<DmxFixture, "id" | "channels">) => void
    update: (fixture: DmxFixture) => void
    delete: (id: string) => void
  }
  load: () => Promise<UserActionResult>
  save: () => Promise<UserActionResult>
  saveAs: () => Promise<UserActionResult>
  new: () => Promise<void>
  isDirty: boolean
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  shouldSave: boolean
  path: string | null
  name: string
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, dispatch] = useReducer(projectReducer, initialState)
  const { appConfigPath, settings, updateSettings } = useApp()
  const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(
    null,
  )
  const [projectName, setProjectName] = useState("Nouveau Projet")

  const hasAttemptedAutoLoad = useRef(false)

  const shouldSave = useMemo(
    () => state.isDirty || currentProjectPath === null,
    [state.isDirty, currentProjectPath],
  )

  useEffect(() => {
    if (
      hasAttemptedAutoLoad.current ||
      !!currentProjectPath ||
      !settings.lastProjectPath
    )
      return

    console.log("init Project", {
      lastProjectPath: settings.lastProjectPath,
    })
    hasAttemptedAutoLoad.current = true
    // Charger automatiquement le dernier projet au lancement
    handleLoadProject(settings.lastProjectPath)
  }, [settings.lastProjectPath, currentProjectPath])

  const confirmDiscard = useCallback(async () => {
    if (!shouldSave) return true

    return await ask(
      "Vous avez des modifications non sauvegardées. Voulez-vous continuer ?",
      {
        title: "Changements non sauvegardés",
        kind: "warning",
        okLabel: "Continuer sans sauvegarder",
        cancelLabel: "Annuler",
      },
    )
  }, [shouldSave])

  const handlePathChange = useCallback(
    async (path: string) => {
      setCurrentProjectPath(path)
      const name = await basename(path, ".json")
      setProjectName(name)
      updateSettings({ lastProjectPath: path })
    },
    [updateSettings],
  )

  const handleLoadProject = useCallback(
    async (path: string) => {
      try {
        // Vérification de sécurité avant de tenter le load
        if (!(await exists(path))) {
          console.warn(`Le fichier projet à l'adresse ${path} est introuvable.`)
          updateSettings({ lastProjectPath: null }) // On nettoie les settings
          return false
        }

        const projectData = await loadJson<Project>(path)

        // On met à jour le state via le reducer
        dispatch({ type: "LOAD_PROJECT", payload: projectData })

        // On mémorise le chemin pour les futurs "Save"
        await handlePathChange(path)

        console.log(`Projet chargé depuis : ${path}`)
        return true
      } catch (error) {
        console.error(`Erreur lors du chargement de ${path}:`, error)
        return false
      }
    },
    [handlePathChange, updateSettings],
  )

  const handleReset = useCallback(() => {
    setCurrentProjectPath(null)
    setProjectName("Nouveau Projet")
  }, [])

  const load = useCallback(async (): Promise<UserActionResult> => {
    if (!(await confirmDiscard())) return { success: true }

    try {
      const defaultDir = await join(appConfigPath, APP_PATHS.PROJECTS_DIR)
      const path = await getOpenPath(defaultDir)

      if (path) {
        await handleLoadProject(path)
      }

      return { success: true }
    } catch (error) {
      console.error("Erreur lors du chargement :", error)
      return { success: false, error: "Erreur lors du chargement" }
    }
  }, [appConfigPath, handleLoadProject, confirmDiscard])

  const saveAs = useCallback(async (): Promise<UserActionResult> => {
    try {
      // Dossier par défaut : soit celui du projet actuel, soit le dossier 'projects' de l'app
      const defaultDir = currentProjectPath
        ? undefined // Le dialogue reprendra le dernier dossier
        : await join(appConfigPath, APP_PATHS.PROJECTS_DIR)

      const path = await getSavePath(projectName, { defaultDir })

      if (path) {
        await saveJson(path, state.present)
        handlePathChange(path)
        console.log("Projet enregistré sous :", path)
        return { success: true, message: "Projet enrengistré." }
      }

      return { success: false, error: "Aucun chemin d'enregistrement choisi" }
    } catch (error) {
      console.error("Erreur SaveAs :", error)
      return { success: false, error: "Erreur lors de l'enregistrement" }
    }
  }, [state.present, appConfigPath, currentProjectPath, projectName])

  const save = useCallback(async (): Promise<UserActionResult> => {
    if (!currentProjectPath) {
      // Premier enregistrement -> SaveAs
      return saveAs()
    }

    try {
      await saveJson(currentProjectPath, state.present)
      dispatch({ type: "MARK_SAVED" })
      console.log("Projet écrasé avec succès :", currentProjectPath)
      return { success: true, message: "Projet sauvegardé." }
    } catch (error) {
      console.error("Erreur Save :", error)
      return saveAs()
    }
  }, [state.present, currentProjectPath, saveAs])

  const createNew = useCallback(async () => {
    if (!(await confirmDiscard())) return

    dispatch({
      type: "LOAD_PROJECT",
      payload: {
        id: crypto.randomUUID(),
        fixtures: [],
        scenes: [],
      },
    })
    handleReset()
    console.log("Nouveau projet créé.")
  }, [confirmDiscard, handleReset])

  const api: ProjectContextType = {
    data: state.present,
    fixtures: {
      add: (data) => dispatch({ type: "ADD_FIXTURE", payload: data }),
      update: (f) => dispatch({ type: "UPDATE_FIXTURE", payload: f }),
      delete: (id) => dispatch({ type: "DELETE_FIXTURE", payload: id }),
    },
    load,
    save,
    saveAs,
    new: createNew,
    isDirty: state.isDirty,
    undo: () => dispatch({ type: "UNDO" }),
    redo: () => dispatch({ type: "REDO" }),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    shouldSave,
    path: currentProjectPath,
    name: projectName,
  }

  return (
    <ProjectContext.Provider value={api}>{children}</ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context)
    throw new Error("useProject doit être utilisé au sein d'un ProjectContext")
  return context
}
