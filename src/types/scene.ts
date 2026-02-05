export type SceneTrigger =
  | {
      type: "manual"
      helperText?: string
    }
  | {
      type: "auto"
      delay: number
    }
  | {
      type: "follow"
    }

// L'atome : une action spécifique
export type SceneActionItem =
  | {
      type: "LIGHT_SET"
      values: Record<string, number>
    }
  | { type: "LIGHT_BLACKOUT" }
  | {
      type: "AUDIO_PLAY"
      path: string
      trackName: string
      volume: number
      loop: boolean
      duration: "auto" | number
    }
  | { type: "AUDIO_STOP" }
  | { type: "AUDIO_VOLUME"; volume: number }

export type SceneAction = SceneActionItem & {
  id: string
  startTime: number
  transitionTime: number
}

export interface Scene {
  id: string
  order: number
  name: string
  trigger: SceneTrigger
  duration: "auto" | number
  actions: SceneAction[] // Une scène peut déclencher plusieurs choses
}
