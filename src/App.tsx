import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { FixtureView } from "./components/vues/fixture-view"
import { SceneView } from "./components/vues/scene-view"
import { View, views } from "./types/navigation"

function App() {
  const [currentView, setCurrentView] = useState<View>("fixtures")

  const renderView = () => {
    switch (currentView) {
      case "fixtures":
        return <FixtureView />
      case "scenes":
        return <SceneView />
      case "live":
        return (
          <div className="p-6">
            <h1>Console Live</h1>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Tabs className="flex flex-col items-center size-full">
      <TabsList>
        {views.map((view) => (
          <TabsTrigger
            key={view.id}
            value={view.id}
            onClick={() => setCurrentView(view.id)}
          >
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={currentView} className="grow w-full p-4">
        {renderView()}
      </TabsContent>
    </Tabs>
  )
}

/**
 * const { toggleBlackout, isBlackout } = useDmx()
 * <Button variant={"secondary"} onClick={toggleBlackout}>
        <div
          className={cn(
            "size-6 rounded-full",
            isBlackout ? "bg-green-800" : "bg-red-800",
          )}
        />
        {`BLACKOUT ${isBlackout ? "ON" : "OFF"}`}
      </Button>
 */
export default App
