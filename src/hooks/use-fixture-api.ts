import { ProjectAction } from "@/lib/project-handler"
import { DmxChannel, DmxFixture } from "@/types/dmx"

export namespace FixtureAPI {
  export type Channel = DmxChannel & {
    update: (data: Partial<DmxChannel>) => void
    delete: () => void
  }

  // Le niveau "Entité" : Une scène individuelle avec son API d'actions
  export type Item = Omit<DmxFixture, "channels"> & {
    update: (
      data: Partial<Omit<DmxFixture, "id" | "channels" | "channelCount">>,
    ) => void
    delete: () => void
    channels: {
      list: () => Channel[]
      add: (data: Omit<DmxChannel, "id">) => void
      get: (id: string) => Channel | null
    }
  }

  // Le niveau "Global" : Gestion de la collection de scènes
  export type Root = {
    add: (data: Omit<DmxFixture, "id" | "channels">) => void
    list: () => Item[]
    get: (id: string) => Item | null
  }
}

export function useFixtureAPI(
  fixtures: DmxFixture[],
  dispatch: React.Dispatch<ProjectAction>,
): FixtureAPI.Root {
  const createChannelAPI =
    (fixtureId: string) =>
    (channel: DmxChannel): FixtureAPI.Channel => ({
      ...channel,
      update: (data: Partial<DmxChannel>) =>
        dispatch({
          type: "UPDATE_CHANNEL",
          payload: { fixtureId, channelId: channel.id, data },
        }),
      delete: () =>
        dispatch({
          type: "DELETE_CHANNEL",
          payload: { fixtureId, channelId: channel.id },
        }),
    })

  const createFixtureAPI = (fixture: DmxFixture): FixtureAPI.Item => ({
    ...fixture,
    update: (data: any) =>
      dispatch({ type: "UPDATE_FIXTURE", payload: { ...fixture, ...data } }),
    delete: () => dispatch({ type: "DELETE_FIXTURE", payload: fixture.id }),
    channels: {
      list: () => fixture.channels.map(createChannelAPI(fixture.id)),
      add: (data) =>
        dispatch({
          type: "ADD_CHANNEL",
          payload: {
            fixtureId: fixture.id,
            channel: {
              id: crypto.randomUUID(),
              ...data,
            },
          },
        }),
      get: (id: string) => {
        const a = fixture.channels.find((a) => a.id === id)
        return a ? createChannelAPI(fixture.id)(a) : null
      },
    },
  })

  return {
    add: (data) => dispatch({ type: "ADD_FIXTURE", payload: data }),
    list: () => fixtures.map(createFixtureAPI),
    get: (id: string) => {
      const s = fixtures.find((s) => s.id === id)
      return s ? createFixtureAPI(s) : null
    },
  }
}
