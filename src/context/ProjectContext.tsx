import { projectReducer } from "@/lib/project-handler"
import { DmxFixture } from "@/types/dmx"
import { Project } from "@/types/project"
import { documentDir, join } from "@tauri-apps/api/path"
import {
  open as openFileDialog,
  save as saveFileDialog,
} from "@tauri-apps/plugin-dialog"
import { mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"
import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react"

const initialState: Project = {
  id: crypto.randomUUID(),
  name: "Nouveau Projet",
  fixtures: [],
  scenes: [],
}

interface ProjectContextType {
  data: Project
  fixtures: {
    add: (data: Omit<DmxFixture, "id" | "channels">) => void
    update: (fixture: DmxFixture) => void
    delete: (id: string) => void
  }
  load: (path?: string) => Promise<UserActionResult>
  save: (path?: string) => Promise<UserActionResult>
  new: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({
  children,
  initialProject = initialState,
}: {
  children: React.ReactNode
  initialProject?: Project
}) => {
  const [state, dispatch] = useReducer(projectReducer, initialProject)

  const load = useCallback(async (path?: string): Promise<UserActionResult> => {
    try {
      // 1. Calculer le chemin par défaut pour faciliter la navigation
      const docsPath = await documentDir()
      const defaultFolder = await join(docsPath, "DMX_Projects")

      // 2. Ouvrir la boîte de dialogue de sélection de fichier
      const selected =
        path ??
        (await openFileDialog({
          multiple: false, // On ne veut qu'un seul projet à la fois
          title: "Ouvrir un projet DMX",
          defaultPath: defaultFolder,
          filters: [
            {
              name: "Projet DMX",
              extensions: ["json"],
            },
          ],
        }))

      // 3. Si l'utilisateur annule, selected sera null
      if (!selected) return { success: true }

      // selected contient le chemin complet du fichier (string sur desktop)
      const filePath = Array.isArray(selected) ? selected[0] : selected

      // 4. Lire le contenu du fichier
      const content = await readTextFile(filePath)

      // 5. Parser le JSON
      const projectData: Project = JSON.parse(content)

      // 6. Envoyer les données au reducer pour mettre à jour toute l'app
      dispatch({ type: "LOAD_PROJECT", payload: projectData })

      console.log(`Projet "${projectData.name}" chargé avec succès !`)
      return { success: true }
    } catch (error) {
      console.error("Erreur lors du chargement du projet :", error)
      return { success: false, error: "Erreur lors du chargement du projet" }
    }
  }, [])

  const save = useCallback(
    async (newName?: string): Promise<UserActionResult> => {
      try {
        // 1. Récupérer le chemin vers "Documents" de l'utilisateur actuel
        const docsPath = await documentDir()

        // 2. Créer le chemin vers ton sous-dossier spécifique
        const defaultFolder = await join(docsPath, "DMX_Projects")

        try {
          await mkdir(defaultFolder, { recursive: true })
        } catch (e) {
          // Le dossier existe probablement déjà, on ignore
          console.error("Unable to create project folder:", e)
        }

        // 3. Ouvrir la boîte de dialogue "Enregistrer sous"
        const path = await saveFileDialog({
          title: "Enregistrer le projet DMX",
          filters: [
            {
              name: "Projet DMX",
              extensions: ["json"],
            },
          ],
          // On suggère le nom actuel du projet comme nom de fichier
          defaultPath: await join(
            defaultFolder,
            `${newName ?? state.name}.json`,
          ),
        })

        // 4. Si l'utilisateur a annulé (path est null), on ne fait rien
        if (!path) return { success: true }

        // 5. Conversion du state (le projet) en chaîne JSON
        // null, 2 permet d'avoir un fichier lisible (indenté)
        const content = JSON.stringify(state, null, 2)

        // 6. Écriture physique sur le disque
        await writeTextFile(path, content)

        console.log(`Projet sauvegardé avec succès à l'emplacement : ${path}`)

        return {
          success: true,
          message: "Projet sauvegardé avec succès",
        }
      } catch (error) {
        console.error("Échec de la sauvegarde :", error)
        return {
          success: false,
          error: "Échec de la sauvegarde",
        }
      }
    },
    [state],
  )

  const createNew = useCallback(
    () =>
      dispatch({
        type: "LOAD_PROJECT",
        payload: {
          id: crypto.randomUUID(),
          name: "Nouveau Projet",
          fixtures: [],
          scenes: [],
        },
      }),
    [],
  )

  const api: ProjectContextType = {
    data: state,
    fixtures: {
      add: (data) => dispatch({ type: "ADD_FIXTURE", payload: data }),
      update: (f) => dispatch({ type: "UPDATE_FIXTURE", payload: f }),
      delete: (id) => dispatch({ type: "DELETE_FIXTURE", payload: id }),
    },
    load,
    save,
    new: createNew,
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
