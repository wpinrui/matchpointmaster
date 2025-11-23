// Re-export all experiment functions from their respective modules
export { runStatAdvantageExperiments } from './matchExperiments/statAdvantageExperiments'
export { runHeadToHeadStatExperiments } from './matchExperiments/headToHeadExperiments'
export { runMultiStatExperiments } from './matchExperiments/multiStatExperiments'
export { runSkillLevelExperiments } from './matchExperiments/skillLevelExperiments'

import { runStatAdvantageExperiments } from './matchExperiments/statAdvantageExperiments'
import { runHeadToHeadStatExperiments } from './matchExperiments/headToHeadExperiments'
import { runMultiStatExperiments } from './matchExperiments/multiStatExperiments'
import { runSkillLevelExperiments } from './matchExperiments/skillLevelExperiments'

/**
 * Run all comprehensive experiments
 */
export function runComprehensiveBalanceTests(
  numPoints: number = 1500,
  numRuns: number = 2
): {
  statAdvantage: ReturnType<typeof runStatAdvantageExperiments>
  headToHead: ReturnType<typeof runHeadToHeadStatExperiments>
  multiStat: ReturnType<typeof runMultiStatExperiments>
  skillLevel: ReturnType<typeof runSkillLevelExperiments>
  summary: {
    totalPoints: number
    numRuns: number
    timestamp: string
  }
} {
  return {
    statAdvantage: runStatAdvantageExperiments(numPoints, numRuns),
    headToHead: runHeadToHeadStatExperiments(numPoints, numRuns),
    multiStat: runMultiStatExperiments(numPoints, numRuns),
    skillLevel: runSkillLevelExperiments(numPoints, numRuns),
    summary: {
      totalPoints: numPoints,
      numRuns,
      timestamp: new Date().toISOString()
    }
  }
}
