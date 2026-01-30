import { DmxFixture, Scene } from "./dmx"

export interface Project {
  id: string
  fixtures: DmxFixture[]
  scenes: Scene[]
}
