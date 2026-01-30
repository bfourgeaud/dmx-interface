import React, { createContext, useContext, useState } from "react"

interface AppContextType {
  selectedPort: string | null
  setSelectedPort: (port: string | null) => void
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPort, setSelectedPort] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <AppContext.Provider
      value={{
        selectedPort,
        setSelectedPort,
        isConnected,
        setIsConnected,
        error,
        setError,
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
