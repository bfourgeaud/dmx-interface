import { useDmx } from "@/context/DMXContext"
import { usePlayback } from "@/context/PlaybackContext"
import { SceneAction } from "@/types/scene"
import { useCallback, useRef, useState } from "react"
import { SceneAPI } from "./use-scene-api"

export function useActionControl() {
  const { setChannelValue, reset } = useDmx()
  const { playAudio, stopAudio, isPlaying } = usePlayback()

  const playAction = async (action: SceneAction) => {
    console.log(`▶️ Exécution de l'action: ${action.type}`, action)

    switch (action.type) {
      case "AUDIO_PLAY":
        playAudio(action)
        break

      case "AUDIO_STOP":
        stopAudio()
        break

      case "LIGHT_SET":
        // Logique DMX : On envoie les valeurs au buffer de sortie
        // On boucle sur action.values et on met à jour l'univers DMX
        Object.entries(action.values).forEach(([address, value]) => {
          setChannelValue(Number(address), value)
        })
        break

      case "LIGHT_BLACKOUT":
        console.log("DMX Out: Blackout total")
        reset()
        break
    }
  }

  const stopAction = async (action: Pick<SceneAction, "id" | "type">) => {
    switch (action.type) {
      case "AUDIO_PLAY":
        stopAudio(action.id)
        break
    }
  }

  return { playAction, stopAction, isPlaying }
}

export function useSceneControl() {
  const {
    playAction,
    stopAction,
    isPlaying: isActionPlaying,
  } = useActionControl()

  // On garde une trace des timeouts actifs pour pouvoir les stopper
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null)

  const stopScene = () => {
    // 1. Annuler tous les lancements programmés
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // 2. Stopper tous les moteurs (Audio global, etc.)
    stopAction({ type: "AUDIO_PLAY", id: "" }) // Si ton stopAction sans ID coupe tout

    setActiveSceneId(null)
  }

  const playScene = (
    scene: Omit<SceneAPI.Item, "play" | "stop" | "isPlaying">,
  ) => {
    // On stop tout ce qui joue déjà avant
    stopScene()
    setActiveSceneId(scene.id)

    scene.actions.list().forEach((action) => {
      // On programme le lancement de chaque action selon son startTime
      const timeout = setTimeout(() => {
        playAction(action)
      }, action.startTime * 1000)

      timeoutsRef.current.push(timeout)
    })
  }

  // La scène joue si elle est marquée active OU si une action est encore en train de jouer
  const isScenePlaying = useCallback(
    (sceneId: string) => {
      return activeSceneId === sceneId
    },
    [activeSceneId],
  )

  return { playScene, stopScene, isScenePlaying }
}
