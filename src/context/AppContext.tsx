import { DEFAULT_SETTINGS } from "@/lib/constants"
import { initAppFilesystem, loadSettings, saveSettings } from "@/lib/fs"
import { AppPaths, AppSettings } from "@/types/app"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

interface AppContextType {
  selectedPort: string | null
  setSelectedPort: (port: string | null) => void
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  appConfigPath: AppPaths["configPath"]
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPort, setSelectedPort] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paths, setPaths] = useState<AppPaths | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)

  // Initialisation du dossier de l'application au démarrage
  useEffect(() => {
    initAppFilesystem().then(async (paths) => {
      setPaths(paths)
      const savedSettings = await loadSettings(paths.configPath)
      setSettings(savedSettings)
    })
  }, [])

  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      if (!paths?.configPath) return

      setSettings((prev) => {
        const updated = { ...(prev || DEFAULT_SETTINGS), ...newSettings }
        // Sauvegarde asynchrone sur le disque
        saveSettings(paths?.configPath, updated)
        return updated
      })
    },
    [paths?.configPath],
  )

  // Si on n'est pas prêt, on bloque le rendu
  if (!paths || !settings) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <p className="animate-pulse text-muted-foreground">
          Initialisation du système...
        </p>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        selectedPort,
        setSelectedPort,
        isConnected,
        setIsConnected,
        error,
        setError,
        appConfigPath: paths.configPath,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error("useApp doit être utilisé au sein d'un AppProvider")
  return context
}
