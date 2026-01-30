export type View = "fixtures" | "scenes" | "live"

export const views: { id: View; label: string }[] = [
  { id: "fixtures", label: "Fixtures" },
  { id: "scenes", label: "Scenes" },
  { id: "live", label: "Live" },
]
