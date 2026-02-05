import { DEFAULT_SCENE } from "@/lib/constants"
import { ProjectAction } from "@/lib/project-handler"
import { Project } from "@/types/project"
import { SceneAction } from "@/types/scene"

export function scenesReducer(state: Project, action: ProjectAction): Project {
  switch (action.type) {
    case "ADD_SCENE":
      return {
        ...state,
        scenes: [
          ...state.scenes,
          {
            id: crypto.randomUUID(),
            ...DEFAULT_SCENE,
            order:
              state.scenes.length > 0
                ? Math.max(...state.scenes.map((s) => s.order)) + 1
                : 0,
          },
        ],
      }
    case "DELETE_SCENE":
      return {
        ...state,
        scenes: state.scenes
          .filter((s) => s.id !== action.payload)
          .map((s, i) => ({ ...s, order: i })),
      }
    case "UPDATE_SCENE":
      return {
        ...state,
        scenes: state.scenes.map((s) =>
          s.id === action.payload.id
            ? { ...action.payload, order: s.order } // On force la conservation de l'ordre actuel
            : s,
        ),
      }

    case "ADD_ACTION":
      return {
        ...state,
        scenes: state.scenes.map((s) =>
          s.id === action.payload.sceneId
            ? {
                ...s,
                actions: [...s.actions, action.payload.action],
              }
            : s,
        ),
      }

    case "UPDATE_ACTION": {
      const { sceneId, actionId, data } = action.payload
      return {
        ...state,
        scenes: state.scenes.map((s) => {
          // 1. On ne touche qu'à la bonne scène
          if (s.id !== sceneId) return s

          return {
            ...s,
            actions: s.actions.map((a) =>
              // 2. On ne touche qu'à la bonne action
              a.id === actionId ? ({ ...a, ...data } as SceneAction) : a,
            ),
          }
        }),
      }
    }

    case "DELETE_ACTION":
      return {
        ...state,
        scenes: state.scenes.map((s) =>
          s.id === action.payload.sceneId
            ? {
                ...s,
                actions: s.actions.filter(
                  (a) => a.id !== action.payload.actionId,
                ),
              }
            : s,
        ),
      }

    default:
      return state
  }
}
