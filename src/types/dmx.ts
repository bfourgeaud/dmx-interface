export type ChannelType =
  | "dimmer"
  | "red"
  | "green"
  | "blue"
  | "white"
  | "amber"
  | "pan"
  | "tilt"
  | "strobe"
  | "gobo"
  | "raw" // Pour tout le reste

export interface DmxChannel {
  id: string
  number: number // Index relatif (1, 2, 3...)
  type: ChannelType
  defaultValue: number
}

export interface DmxFixture {
  id: string
  name: string
  startAddress: number // Adresse DMX de départ (1-512)
  channelCount: number
  channels: DmxChannel[]
}
