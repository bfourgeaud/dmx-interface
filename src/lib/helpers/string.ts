export const pluralString = (value: number, singular: string, plural: string) =>
  `${value} ${value === 1 ? singular : plural}`
