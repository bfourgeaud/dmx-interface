import { fixturesReducer } from "@/reducers/fixturesReducer"
import { scenesReducer } from "@/reducers/sceneReducer"
import { DmxChannel, DmxFixture } from "@/types/dmx"
import { Project } from "@/types/project"
import { Scene, SceneAction } from "@/types/scene"

export type ProjectAction =
  | { type: "LOAD_PROJECT"; payload: Project }
  | { type: "ADD_FIXTURE"; payload: Omit<DmxFixture, "id" | "channels"> }
  | { type: "UPDATE_FIXTURE"; payload: DmxFixture }
  | { type: "DELETE_FIXTURE"; payload: string }
  | { type: "ADD_SCENE" }
  | { type: "UPDATE_SCENE"; payload: Scene }
  | { type: "DELETE_SCENE"; payload: string }
  | { type: "ADD_ACTION"; payload: { sceneId: string; action: SceneAction } }
  | {
      type: "UPDATE_ACTION"
      payload: { sceneId: string; actionId: string; data: Partial<SceneAction> }
    }
  | { type: "DELETE_ACTION"; payload: { sceneId: string; actionId: string } }
  | { type: "ADD_CHANNEL"; payload: { fixtureId: string; channel: DmxChannel } }
  | {
      type: "UPDATE_CHANNEL"
      payload: {
        fixtureId: string
        channelId: string
        data: Partial<DmxChannel>
      }
    }
  | {
      type: "DELETE_CHANNEL"
      payload: { fixtureId: string; channelId: string }
    }

export type ProjectStateAction =
  | ProjectAction
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_SAVED" }

export interface ProjectState {
  past: Project[]
  present: Project
  future: Project[]
  isDirty: boolean
}

function baseReducer(state: Project, action: ProjectAction): Project {
  // On passe par les différents reducers.
  // Chaque reducer retourne soit le nouveau state, soit l'ancien s'il n'est pas concerné.
  let newState = state

  newState = fixturesReducer(newState, action)
  newState = scenesReducer(newState, action)

  return newState
}

export function projectReducer(
  state: ProjectState,
  action: ProjectStateAction,
): ProjectState {
  const { past, present, future } = state

  switch (action.type) {
    case "UNDO": {
      if (past.length === 0) return state
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
        isDirty: true,
      }
    }

    case "REDO": {
      if (future.length === 0) return state
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
        isDirty: true,
      }
    }

    case "LOAD_PROJECT": {
      return {
        past: [],
        present: action.payload, // Utilise l'action directement ici
        future: [],
        isDirty: false,
      }
    }

    case "MARK_SAVED": {
      return { ...state, isDirty: false }
    }

    default: {
      // On passe l'action au reducer de projet classique
      const newPresent = baseReducer(present, action as ProjectAction)

      // Si le reducer n'a rien changé (ex: action inconnue), on ne touche à rien
      if (newPresent === present) return state

      // Sinon, on enregistre l'ancien état dans le passé
      return {
        past: [...past, present].slice(-50), // On limite à 50 niveaux d'undo
        present: newPresent,
        future: [], // Une nouvelle action casse la branche "Redo"
        isDirty: true,
      }
    }
  }
}
