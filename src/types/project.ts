import { DmxFixture, Scene } from "./dmx"

export interface Project {
  id: string
  name: string
  fixtures: DmxFixture[]
  scenes: Scene[]
}
