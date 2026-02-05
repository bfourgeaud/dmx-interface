import { DmxFixture } from "./dmx"
import { Scene } from "./scene"

export interface Project {
  id: string
  fixtures: DmxFixture[]
  scenes: Scene[]
}
