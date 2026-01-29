import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import "./App.css"

type AppState = "CONNECTING" | "CONTROL"

function App() {
  const [state, setState] = useState<AppState>("CONNECTING")
  const [ports, setPorts] = useState<string[]>([])
  const [selectedPort, setSelectedPort] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(0)

  // Charger les ports au démarrage
  useEffect(() => {
    refreshPorts()
  }, [])

  const refreshPorts = async () => {
    try {
      const res = await invoke<string[]>("list_ports")
      setPorts(res)
      if (res.length > 0) setSelectedPort(res[0])
    } catch (err) {
      setError("Impossible de lister les ports.")
    }
  }

  const handleConnect = async () => {
    setError(null)
    try {
      const isDmxReady = await invoke<boolean>("check_port", {
        portName: selectedPort,
      })

      if (isDmxReady) {
        setState("CONTROL")
      } else {
        setError(`${selectedPort}: DMX_READY non reçu`)
      }
    } catch (err) {
      setError(
        `Erreur de connexion sur ${selectedPort}. Le port est peut-être déjà utilisé.`,
      )
    }
  }

  const handleIntensityChange = async (val: number) => {
    setIntensity(val)
    try {
      await invoke("send_dmx", {
        portName: selectedPort,
        canal: 1,
        valeur: val,
      })
    } catch (err) {
      console.error("Erreur d'envoi:", err)
      // Si on perd la connexion, on peut repasser en mode connexion
      setState("CONNECTING")
      setError("Connexion perdue avec l'Arduino.")
    }
  }

  if (state === "CONNECTING") {
    return (
      <div className="setup-container">
        <h1>Configuration DMX</h1>
        <p>Sélectionnez votre adaptateur Arduino :</p>

        <div className="setup-box">
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
          >
            {ports.length === 0 && <option>Aucun port détecté</option>}
            {ports.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button onClick={refreshPorts}>🔄</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button
          className="connect-btn"
          disabled={!selectedPort}
          onClick={handleConnect}
        >
          Vérifier et Connecter
        </button>
      </div>
    )
  }

  return (
    <div className="control-container">
      <header>
        <span>
          Connecté sur : <strong>{selectedPort}</strong>
        </span>
        <button onClick={() => setState("CONNECTING")}>Déconnecter</button>
      </header>

      <div className="slider-card">
        <h2>Dimmer Principal</h2>
        <div className="intensity-display">{intensity}</div>
        <input
          type="range"
          min="0"
          max="255"
          value={intensity}
          onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
        />
        <div className="labels">
          <span>0%</span>
          <span>Canal 1</span>
          <span>100%</span>
        </div>
      </div>

      <button className="blackout-btn" onClick={() => handleIntensityChange(0)}>
        BLACKOUT
      </button>
    </div>
  )
}

export default App
