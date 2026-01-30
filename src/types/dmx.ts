export interface DmxChannel {
  id: string
  number: number // Index relatif (1, 2, 3...)
  name: string
  description: string
}

export interface DmxFixture {
  id: string
  name: string
  startAddress: number // Adresse DMX de départ (1-512)
  channelCount: number
  channels: DmxChannel[]
}

export interface Scene {
  id: string
  name: string
  values: Record<number, number> // { canal: valeur }
}
