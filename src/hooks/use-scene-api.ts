import { ProjectAction } from "@/lib/project-handler"
import { Scene, SceneAction, SceneActionItem } from "@/types/scene"
import { useActionControl, useSceneControl } from "./use-action-control"

export namespace SceneAPI {
  // Le niveau "Atome" : Une action avec ses méthodes
  export type Action = SceneAction & {
    update: (data: Partial<SceneAction>) => void
    delete: () => void
    play: () => Promise<void>
    stop: () => Promise<void>
    isPlaying: boolean
  }

  // Le niveau "Entité" : Une scène individuelle avec son API d'actions
  export type Item = Omit<Scene, "actions"> & {
    update: (data: Partial<Omit<Scene, "id" | "order" | "actions">>) => void
    delete: () => void
    play: () => void // Pour jouer la scène entière
    stop: () => void // Pour reinitialiser la scène
    isPlaying: boolean
    actions: {
      list: () => Action[]
      count: () => number
      add: (type: SceneActionItem["type"]) => void
      get: (id: string) => Action | null
    }
  }

  // Le niveau "Global" : Gestion de la collection de scènes
  export type Root = {
    add: () => void
    list: () => Item[]
    count: () => number
    get: (id: string) => Item | null
  }
}

const getDefaultAction = (type: SceneActionItem["type"]): SceneActionItem => {
  switch (type) {
    case "LIGHT_SET":
      return { type, values: {} }
    case "AUDIO_PLAY":
      return {
        type,
        path: "",
        trackName: "",
        volume: 0,
        loop: false,
        duration: "auto",
      }

    case "AUDIO_VOLUME":
      return { type, volume: 0 }
    default:
      return { type }
  }
}

export function useSceneAPI(
  scenes: Scene[],
  dispatch: React.Dispatch<ProjectAction>,
): SceneAPI.Root {
  const { playAction, stopAction, isPlaying } = useActionControl()
  const { playScene, stopScene, isScenePlaying } = useSceneControl()

  const createSceneActionAPI =
    (sceneId: string) =>
    (action: SceneAction): SceneAPI.Action => ({
      ...action,
      update: (data: Partial<SceneAction>) =>
        dispatch({
          type: "UPDATE_ACTION",
          payload: { sceneId, actionId: action.id, data },
        }),
      delete: () =>
        dispatch({
          type: "DELETE_ACTION",
          payload: { sceneId, actionId: action.id },
        }),
      play: () => playAction(action),
      stop: () => stopAction({ id: action.id, type: action.type }),
      isPlaying: isPlaying(action.id),
    })

  const createSceneAPI = (scene: Scene): SceneAPI.Item => {
    const api = {
      ...scene,
      update: (data: any) =>
        dispatch({ type: "UPDATE_SCENE", payload: { ...scene, ...data } }),
      delete: () => dispatch({ type: "DELETE_SCENE", payload: scene.id }),
      actions: {
        list: () => scene.actions.map(createSceneActionAPI(scene.id)),
        count: () => scene.actions.length,
        add: (type: SceneActionItem["type"]) =>
          dispatch({
            type: "ADD_ACTION",
            payload: {
              sceneId: scene.id,
              action: {
                id: crypto.randomUUID(),
                startTime: 0,
                transitionTime: 0,
                ...getDefaultAction(type),
              },
            },
          }),
        get: (id: string) => {
          const a = scene.actions.find((a) => a.id === id)
          return a ? createSceneActionAPI(scene.id)(a) : null
        },
      },
    }

    return {
      ...api,
      play: () => playScene(api),
      stop: () => stopScene(),
      isPlaying: isScenePlaying(scene.id),
    }
  }

  return {
    add: () => dispatch({ type: "ADD_SCENE" }),
    list: () => scenes.map(createSceneAPI),
    count: () => scenes.length,
    get: (id: string) => {
      const s = scenes.find((s) => s.id === id)
      return s ? createSceneAPI(s) : null
    },
  }
}
