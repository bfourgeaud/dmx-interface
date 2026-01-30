import { useProject } from "@/context/ProjectContext"
import { AddFixtureButton, FixtureCard } from "../dmx/fixture"

export function FixtureView() {
  const { data } = useProject()
  return (
    <div className="grid gap-8 grid-cols-3">
      {data.fixtures.map((f) => (
        <FixtureCard key={f.id} fixture={f} />
      ))}
      <AddFixtureButton />
    </div>
  )
}
