import { SaveData } from '../types'

export function createSchoolUpdates(
  updateAttribute: <T extends keyof SaveData, K extends keyof SaveData[T]>(
    category: T,
    key: K,
    value: SaveData[T][K]
  ) => void
) {
  return {
    name: (newName: string) => updateAttribute('school', 'name', newName),
    crestPath: (crestPath: string) => updateAttribute('school', 'crestPath', crestPath),
    primaryColor: (color: string) => updateAttribute('school', 'primaryColor', color),
    secondaryColor: (color: string) => updateAttribute('school', 'secondaryColor', color),
    accentColor: (color: string) => updateAttribute('school', 'accentColor', color),
    reputation: (reputation: number) =>
      updateAttribute('school', 'reputation', reputation),
    teamType: (teamType: 'boys' | 'girls' | 'both') =>
      updateAttribute('school', 'teamType', teamType)
  }
}

