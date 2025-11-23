import {
  SaveData,
  Gender,
  Handedness,
  RubberType,
  GripStyle,
  FavourStyle,
  PlayStyle
} from '../types'

export function createManagerUpdates(
  updateAttribute: <T extends keyof SaveData, K extends keyof SaveData[T]>(
    category: T,
    key: K,
    value: SaveData[T][K]
  ) => void
) {
  return {
    fullName: (newName: string) => updateAttribute('manager', 'fullName', newName),
    shortName: (newShortName: string) =>
      updateAttribute('manager', 'shortName', newShortName),
    gender: (newGender: Gender) => updateAttribute('manager', 'gender', newGender),
    imagePath: (newImagePath: string) =>
      updateAttribute('manager', 'imagePath', newImagePath),
    handedness: (newHandedness: Handedness) =>
      updateAttribute('manager', 'handedness', newHandedness),
    forehandRubber: (newRubber: RubberType) =>
      updateAttribute('manager', 'forehandRubber', newRubber),
    backhandRubber: (newRubber: RubberType) =>
      updateAttribute('manager', 'backhandRubber', newRubber),
    gripStyle: (newGripStyle: GripStyle) =>
      updateAttribute('manager', 'gripStyle', newGripStyle),
    forehandBackhandTendency: (newTendency: FavourStyle) =>
      updateAttribute('manager', 'forehandBackhandTendency', newTendency),
    playStyle: (newPlayStyle: PlayStyle) =>
      updateAttribute('manager', 'playStyle', newPlayStyle),
    stats: (newStats: SaveData['manager']['stats']) =>
      updateAttribute('manager', 'stats', newStats)
  }
}

