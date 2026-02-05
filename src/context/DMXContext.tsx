import { invoke } from "@tauri-apps/api/core"
import React, { createContext, useCallback, useContext, useState } from "react"
import { useApp } from "./AppContext"

// Interface pour l'usage global (ex: Bouton Blackout)
interface DmxGlobalActions {
  universe: Record<number, number>
  setChannelValue: (channel: number, value: number) => void

  isBlackout: boolean
  toggleBlackout: () => void

  reset: () => void
}

// Interface pour l'usage spécifique (ex: Fader)
interface DmxChannelActions {
  value: number
  setValue: (val: number) => void

  isBlackout: boolean
  toggleBlackout: () => void

  reset: () => void
}

const DmxContext = createContext<DmxGlobalActions | undefined>(undefined)

export const DmxProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedPort, isConnected, setError } = useApp()
  const [universe, setUniverse] = useState<Record<number, number>>({})
  const [isBlackout, setIsBlackout] = useState(false)

  const sendToHardware = useCallback(
    async (channel: number, value: number) => {
      if (isConnected && selectedPort) {
        try {
          await invoke("send_dmx", {
            portName: selectedPort,
            canal: channel,
            valeur: value,
          })
        } catch (e) {
          setError("DMX Send Error")
          console.error("DMX Send Error:", e)
        }
      }
    },
    [isConnected, selectedPort],
  )

  // Fonction pour envoyer la donnée au Rust et mettre à jour le state local
  const setChannelValue = useCallback(
    (channel: number, value: number) => {
      setUniverse((prev) => ({ ...prev, [channel]: value }))

      // Si on n'est pas en blackout, on envoie la valeur immédiatement
      // Si on est en blackout, on met à jour l'univers (mémoire) mais on envoie rien (ou on laisse à 0)
      if (!isBlackout) {
        sendToHardware(channel, value)
      }
    },
    [isBlackout, sendToHardware],
  )

  // Toggle Blackout
  const toggleBlackout = useCallback(() => {
    setIsBlackout((prev) => {
      const nextBlackout = !prev

      // Quand on change l'état du blackout, on doit mettre à jour TOUS les canaux physiques
      Object.entries(universe).forEach(([ch, val]) => {
        const channel = parseInt(ch)
        // Si on passe en blackout, on envoie 0, sinon on renvoie la valeur de l'univers
        sendToHardware(channel, nextBlackout ? 0 : val)
      })

      return nextBlackout
    })
  }, [universe, sendToHardware])

  const reset = () => {
    Object.keys(universe).forEach((ch) => {
      const channel = parseInt(ch)
      // Si on passe en blackout, on envoie 0, sinon on renvoie la valeur de l'univers
      setChannelValue(channel, 0)
    })
  }

  return (
    <DmxContext.Provider
      value={{ universe, setChannelValue, toggleBlackout, isBlackout, reset }}
    >
      {children}
    </DmxContext.Provider>
  )
}

export function useDmx(): DmxGlobalActions
export function useDmx(address: number): DmxChannelActions

export function useDmx(address?: number) {
  const context = useContext(DmxContext)
  if (!context) throw new Error("useDmx must be used within DmxProvider")

  const { universe, setChannelValue, reset, ...rest } = context

  if (address !== undefined) {
    const value = universe[address] ?? 0
    const setValue = (val: number) => setChannelValue(address, val)
    const reset = () => setChannelValue(address, 0)

    return { value, setValue, reset, ...rest }
  }

  return context
}
