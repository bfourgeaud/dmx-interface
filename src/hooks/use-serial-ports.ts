import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"

export function useSerialPorts() {
  const [ports, setPorts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshPorts = async () => {
    setIsLoading(true)
    try {
      const availablePorts = await invoke<string[]>("list_ports")
      setPorts(availablePorts)
    } catch (error) {
      console.error("Erreur lors de la récupération des ports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshPorts()
  }, [])

  return { ports, isLoading, refreshPorts }
}
