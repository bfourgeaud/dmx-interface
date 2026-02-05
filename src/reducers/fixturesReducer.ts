import { ProjectAction } from "@/lib/project-handler"
import { DmxFixture } from "@/types/dmx"
import { Project } from "@/types/project"

export function fixturesReducer(
  state: Project,
  action: ProjectAction,
): Project {
  switch (action.type) {
    case "ADD_FIXTURE":
      const newFixture: DmxFixture = {
        ...action.payload,
        id: crypto.randomUUID(),
        channels: Array.from(
          { length: action.payload.channelCount },
          (_, i) => ({
            id: crypto.randomUUID(),
            type: "raw",
            number: i,
            defaultValue: 0,
          }),
        ),
      }
      return { ...state, fixtures: [...state.fixtures, newFixture] }

    case "UPDATE_FIXTURE":
      return {
        ...state,
        fixtures: state.fixtures.map((f) =>
          f.id === action.payload.id ? action.payload : f,
        ),
      }

    case "DELETE_FIXTURE":
      return {
        ...state,
        fixtures: state.fixtures.filter((f) => f.id !== action.payload),
      }

    case "ADD_CHANNEL":
      return {
        ...state,
        fixtures: state.fixtures.map((f) =>
          f.id === action.payload.fixtureId
            ? { ...f, channels: [...f.channels, action.payload.channel] }
            : f,
        ),
      }
    case "UPDATE_CHANNEL":
      return {
        ...state,
        fixtures: state.fixtures.map((f) => ({
          ...f,
          channels: f.channels.map((c) =>
            c.id === action.payload.channelId
              ? { ...c, ...action.payload.data }
              : c,
          ),
        })),
      }
    case "DELETE_CHANNEL":
      return {
        ...state,
        fixtures: state.fixtures.map((f) =>
          f.id === action.payload.fixtureId
            ? {
                ...f,
                channels: f.channels.filter(
                  (c) => c.id !== action.payload.channelId,
                ),
              }
            : f,
        ),
      }
    default:
      return state
  }
}
