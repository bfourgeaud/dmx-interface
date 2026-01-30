import { useProject } from "@/context/ProjectContext"
import {
  DMXFader,
  DMXFaderLabel,
  DMXFaderSlider,
  DMXFaderValue,
} from "../dmx/Fader"
import { FaderGroup } from "../dmx/fader-group"

export function SceneView() {
  const { data } = useProject()

  return (
    <FaderGroup className="gap-2">
      {data.fixtures.map((f) => (
        <FaderGroup key={f.id}>
          {f.channels.map((c) => (
            <DMXFader key={c.id} address={f.startAddress + c.number}>
              <DMXFaderLabel>{c.name}</DMXFaderLabel>
              <DMXFaderValue />
              <DMXFaderSlider />
            </DMXFader>
          ))}
        </FaderGroup>
      ))}
    </FaderGroup>
  )
}
