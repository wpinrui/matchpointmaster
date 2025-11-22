import {
  Player,
  Gender,
  Handedness,
  GripStyle,
  RubberType,
  FavourStyle,
  PlayStyle
} from '../services/savegame/types'

/**
 * Create a test player with all stats at specified value
 */
export function createTestPlayer(
  name: string,
  id: string,
  statValue: number = 50
): Player {
  return {
    id,
    firstName: name,
    lastName: 'Test',
    shortName: name,
    isChinese: false,
    gender: Gender.MALE,
    age: 15,
    year: 2,
    elo: 1500,
    skills: {
      forehand: statValue,
      backhand: statValue,
      footwork: statValue,
      serve: statValue,
      receive: statValue,
      spin: statValue,
      placement: statValue,
      consistency: statValue
    },
    handedness: Handedness.RIGHT,
    gripStyle: GripStyle.SHAKE_HAND,
    forehandRubber: RubberType.SPIN_RUBBER,
    backhandRubber: RubberType.SPIN_RUBBER,
    forehandBackhandTendency: FavourStyle.BALANCED,
    playStyle: PlayStyle.ALL_ROUNDER,
    imagePath: '',
    traits: []
  }
}
