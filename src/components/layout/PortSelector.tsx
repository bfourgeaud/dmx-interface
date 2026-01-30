import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/context/AppContext"
import { useSerialPorts } from "@/hooks/use-serial-ports"
import { cn } from "@/lib/utils"
import { invoke } from "@tauri-apps/api/core"
import { Link2, Link2Off, RefreshCw } from "lucide-react"
import { ComponentProps, useState } from "react"

export function PortSelector({ className, ...props }: ComponentProps<"div">) {
  const { selectedPort, setSelectedPort, isConnected, setIsConnected } =
    useApp()
  const { ports, isLoading, refreshPorts } = useSerialPorts()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!selectedPort) return
    setIsConnecting(true)
    try {
      const success = await invoke<boolean>("check_port", {
        portName: selectedPort,
      })
      setIsConnected(success)
      if (!success) alert("L'Arduino n'a pas répondu !")
    } catch (e) {
      console.error(e)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Select
        value={selectedPort || ""}
        onValueChange={setSelectedPort}
        disabled={isConnected}
      >
        <SelectTrigger className="w-45 bg-background">
          <SelectValue placeholder="Choisir un port" />
        </SelectTrigger>
        <SelectContent>
          {ports.map((port) => (
            <SelectItem key={port} value={port}>
              {port}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={refreshPorts}
        disabled={isLoading || isConnected}
      >
        <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
      </Button>

      <Button
        variant={isConnected ? "destructive" : "default"}
        onClick={isConnected ? () => setIsConnected(false) : handleConnect}
        disabled={!selectedPort || isConnecting}
        className="gap-2"
      >
        {isConnected ? <Link2Off size={16} /> : <Link2 size={16} />}
        {isConnected
          ? "Déconnecter"
          : isConnecting
            ? "Connexion..."
            : "Connecter"}
      </Button>
    </div>
  )
}
