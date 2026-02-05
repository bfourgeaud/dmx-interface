// src/contexts/PlaybackContext.tsx
import { SceneAction } from "@/types/scene"
import { convertFileSrc } from "@tauri-apps/api/core"
import React, { createContext, useContext, useRef, useState } from "react"

interface PlaybackContextType {
  playingIds: string[] // Un tableau d'IDs pour la réactivité React
  playAudio: (
    action: Extract<SceneAction, { type: "AUDIO_PLAY" }>,
  ) => Promise<void>
  stopAudio: (id?: string) => void
}

const PlaybackContext = createContext<PlaybackContextType | null>(null)

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  // L'état réactif : la liste des IDs en cours de lecture
  const [playingIds, setPlayingIds] = useState<string[]>([])

  // Les instances réelles (non-réactives pour la performance)
  const instances = useRef<Map<string, HTMLAudioElement>>(new Map())

  const playAudio = async (action: SceneAction) => {
    if (action.type !== "AUDIO_PLAY" || !action.path) return

    // Stop si déjà en cours
    stopAudio(action.id)

    const audio = new Audio(convertFileSrc(action.path))
    audio.volume = action.volume
    audio.loop = action.loop

    instances.current.set(action.id, audio)

    // Mise à jour du state pour l'UI
    setPlayingIds((prev) => [...prev, action.id])

    audio.onended = () => stopAudio(action.id)

    await audio.play()
  }

  const stopAudio = (id?: string) => {
    if (id) {
      const a = instances.current.get(id)
      if (a) {
        a.pause()
        a.currentTime = 0
      }
      instances.current.delete(id)
      setPlayingIds((prev) => prev.filter((p) => p !== id))
    } else {
      instances.current.forEach((a) => {
        a.pause()
        a.currentTime = 0
      })
      instances.current.clear()
      setPlayingIds([])
    }
  }

  return (
    <PlaybackContext.Provider value={{ playingIds, playAudio, stopAudio }}>
      {children}
    </PlaybackContext.Provider>
  )
}

export function usePlayback() {
  const context = useContext(PlaybackContext)

  if (!context) {
    throw new Error("usePlayback must be used within a PlaybackProvider")
  }

  // On retourne les fonctions et l'état réactif du Provider
  return {
    playingIds: context.playingIds,
    playAudio: context.playAudio,
    stopAudio: context.stopAudio,
    // On peut ajouter une petite fonction helper ici
    isPlaying: (id: string) => context.playingIds.includes(id),
  }
}
