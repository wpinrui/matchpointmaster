import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  PlayStyle,
  RubberType,
  SaveData
} from './types'

export const initialSaveData: SaveData = {
  manager: {
    fullName: '',
    shortName: '',
    gender: Gender.MALE,
    imagePath: '',
    handedness: Handedness.RIGHT,
    forehandRubber: RubberType.SPIN_RUBBER,
    backhandRubber: RubberType.SPIN_RUBBER,
    gripStyle: GripStyle.SHAKE_HAND,
    forehandBackhandTendency: FavourStyle.BALANCED,
    playStyle: PlayStyle.ALL_ROUNDER,
    stats: {
      reputation: 15, // Starting reputation (low, new manager)
      coachingEffectiveness: 15 // Starting coaching effectiveness (low, new manager)
    }
  },
  school: {
    name: '',
    crestPath: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    accentColor: '#FFD23F'
  },
  players: []
}
