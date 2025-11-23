import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  Player,
  PlayStyle,
  RubberType
} from '../../services/savegame/types'

/**
 * Create a test player with specified stats
 */
export function createTestPlayer(
  name: string,
  id: string,
  stats: {
    forehand?: number
    backhand?: number
    footwork?: number
    serve?: number
    receive?: number
    spin?: number
    placement?: number
    consistency?: number
  }
): Player {
  const defaultStat = 50
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
      forehand: stats.forehand ?? defaultStat,
      backhand: stats.backhand ?? defaultStat,
      footwork: stats.footwork ?? defaultStat,
      serve: stats.serve ?? defaultStat,
      receive: stats.receive ?? defaultStat,
      spin: stats.spin ?? defaultStat,
      placement: stats.placement ?? defaultStat,
      consistency: stats.consistency ?? defaultStat
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
