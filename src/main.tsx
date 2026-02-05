import React from "react"
import ReactDOM from "react-dom/client"
import { Toaster } from "sonner"
import App from "./App"
import { AppLayout } from "./components/layout/AppLayout"
import { AppProvider } from "./context/AppContext"
import { DmxProvider } from "./context/DMXContext"
import { PlaybackProvider } from "./context/PlaybackContext"
import { ProjectProvider } from "./context/ProjectContext"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <PlaybackProvider>
        <DmxProvider>
          <ProjectProvider>
            <AppLayout>
              <App />
              <Toaster richColors />
            </AppLayout>
          </ProjectProvider>
        </DmxProvider>
      </PlaybackProvider>
    </AppProvider>
  </React.StrictMode>,
)
