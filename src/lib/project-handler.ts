import { DmxFixture, Scene } from "@/types/dmx"
import { Project } from "@/types/project"

export type ProjectAction =
  | { type: "LOAD_PROJECT"; payload: Project }
  | { type: "ADD_FIXTURE"; payload: Omit<DmxFixture, "id" | "channels"> }
  | { type: "UPDATE_FIXTURE"; payload: DmxFixture }
  | { type: "DELETE_FIXTURE"; payload: string }
  | { type: "ADD_SCENE"; payload: Scene }
  | { type: "DELETE_SCENE"; payload: string }

export function projectReducer(state: Project, action: ProjectAction): Project {
  switch (action.type) {
    case "ADD_FIXTURE":
      const newFixture: DmxFixture = {
        ...action.payload,
        id: crypto.randomUUID(),
        channels: Array.from(
          { length: action.payload.channelCount },
          (_, i) => ({
            id: crypto.randomUUID(),
            name: `Canal ${i + 1}`,
            description: "",
            number: i,
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

    case "LOAD_PROJECT":
      return action.payload

    default:
      return state
  }
}
