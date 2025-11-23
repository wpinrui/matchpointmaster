import { PlayerSkills, TrainingFocus } from '../../services/savegame/types'

/**
 * Skill labels mapping
 */
export const SKILL_LABELS: Record<keyof PlayerSkills, string> = {
  forehand: 'Forehand',
  backhand: 'Backhand',
  footwork: 'Footwork',
  serve: 'Serve',
  receive: 'Receive',
  spin: 'Spin',
  placement: 'Placement',
  consistency: 'Consistency'
}

/**
 * Map training focus to affected skills
 */
export function getSkillsForFocus(focus: TrainingFocus): (keyof PlayerSkills)[] {
  const skillMap: Record<TrainingFocus, (keyof PlayerSkills)[]> = {
    [TrainingFocus.FOREHAND]: ['forehand'],
    [TrainingFocus.BACKHAND]: ['backhand'],
    [TrainingFocus.FOOTWORK]: ['footwork'],
    [TrainingFocus.SERVE]: ['serve'],
    [TrainingFocus.RECEIVE]: ['receive'],
    [TrainingFocus.SPIN]: ['spin'],
    [TrainingFocus.PLACEMENT]: ['placement'],
    [TrainingFocus.CONSISTENCY]: ['consistency'],
    [TrainingFocus.MATCH_PLAY]: [
      'forehand',
      'backhand',
      'footwork',
      'serve',
      'receive',
      'spin',
      'placement',
      'consistency'
    ],
    [TrainingFocus.FUNDAMENTALS]: [
      'forehand',
      'backhand',
      'footwork',
      'serve',
      'receive',
      'spin',
      'placement',
      'consistency'
    ],
    [TrainingFocus.TOURNAMENT_PREP]: [
      'forehand',
      'backhand',
      'footwork',
      'serve',
      'receive',
      'spin',
      'placement',
      'consistency'
    ]
  }
  return skillMap[focus] || []
}

