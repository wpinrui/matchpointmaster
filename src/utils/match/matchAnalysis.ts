/**
 * Analysis functions for match engine (point loss/win analysis and commentary)
 */
import {
  calculateR1LossProbability,
  calculateR2LossProbability,
  calculateCombinedLossProbability
} from './matchCalculations'

/**
 * Analyze what caused R1 loss - determine which stat was dominant
 */
export function analyzeR1LossCause(
  r1: number,
  breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? "opponent's serve" : "opponent's placement"
  }

  if (isServe && breakdown.playerAServe) {
    // For serve: opponent's serve vs my footwork
    const serveAdvantage = breakdown.playerAServe - (breakdown.playerBFootwork || 0)
    if (serveAdvantage > 10) {
      return "opponent's powerful serve"
    } else if (serveAdvantage > 5) {
      return "opponent's strong serve"
    } else {
      return "opponent's serve (my poor footwork)"
    }
  } else if (breakdown.playerAPlacement) {
    // For rally: opponent's placement vs my footwork
    const placementAdvantage =
      breakdown.playerAPlacement - (breakdown.playerBFootwork || 0)
    if (placementAdvantage > 10) {
      return "opponent's excellent placement"
    } else if (placementAdvantage > 5) {
      return "opponent's good placement"
    } else {
      return "opponent's placement (my poor footwork)"
    }
  }

  return isServe ? "opponent's serve" : "opponent's placement"
}

/**
 * Analyze what caused R2 loss - determine which stat was dominant
 */
export function analyzeR2LossCause(
  r2: number,
  breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? "opponent's serve" : "opponent's stroke/spin"
  }

  if (isServe && breakdown.playerAServe && breakdown.playerBReceive) {
    // For serve: opponent's serve vs my receive
    const serveAdvantage = breakdown.playerAServe - breakdown.playerBReceive
    if (serveAdvantage > 10) {
      return "opponent's powerful serve"
    } else if (serveAdvantage > 5) {
      return "opponent's strong serve"
    } else {
      return "opponent's serve (my poor receive)"
    }
  } else if (breakdown.playerAStroke && breakdown.playerASpin) {
    // For rally: opponent's stroke/spin vs mine
    const opponentWeighted = breakdown.playerAStroke * 0.6 + breakdown.playerASpin * 0.4
    const myWeighted =
      (breakdown.playerBStroke || 0) * 0.6 + (breakdown.playerBSpin || 0) * 0.4
    const advantage = opponentWeighted - myWeighted

    // Determine which aspect was stronger
    const strokeAdvantage =
      (breakdown.playerAStroke || 0) - (breakdown.playerBStroke || 0)
    const spinAdvantage = (breakdown.playerASpin || 0) - (breakdown.playerBSpin || 0)

    if (advantage > 10) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `opponent's powerful ${breakdown.playerAStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return "opponent's heavy spin"
      }
    } else if (advantage > 5) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `opponent's strong ${breakdown.playerAStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return "opponent's strong spin"
      }
    } else {
      return "opponent's stroke/spin (my weakness)"
    }
  }

  return isServe ? "opponent's serve" : "opponent's stroke/spin"
}

/**
 * Analyze what caused R1 win - determine which stat was dominant
 */
export function analyzeR1WinCause(
  r1: number,
  breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? 'powerful serve' : 'excellent placement'
  }

  if (isServe && breakdown.playerAServe) {
    // For serve: my serve vs opponent's footwork
    const serveAdvantage = breakdown.playerAServe - (breakdown.playerBFootwork || 0)
    if (serveAdvantage > 10) {
      return 'powerful serve'
    } else if (serveAdvantage > 5) {
      return 'strong serve'
    } else {
      return "serve (opponent's poor footwork)"
    }
  } else if (breakdown.playerAPlacement) {
    // For rally: my placement vs opponent's footwork
    const placementAdvantage =
      breakdown.playerAPlacement - (breakdown.playerBFootwork || 0)
    if (placementAdvantage > 10) {
      return 'excellent placement'
    } else if (placementAdvantage > 5) {
      return 'good placement'
    } else {
      return "placement (opponent's poor footwork)"
    }
  } else if (breakdown.playerBFootwork) {
    // My superior footwork
    return 'superior footwork'
  }

  return isServe ? 'serve' : 'placement'
}

/**
 * Analyze what caused R2 win - determine which stat was dominant
 */
export function analyzeR2WinCause(
  r2: number,
  breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? 'powerful serve' : 'powerful stroke'
  }

  if (isServe && breakdown.playerAServe && breakdown.playerBReceive) {
    // For serve: my serve vs opponent's receive
    const serveAdvantage = breakdown.playerAServe - breakdown.playerBReceive
    if (serveAdvantage > 10) {
      return 'powerful serve'
    } else if (serveAdvantage > 5) {
      return 'strong serve'
    } else {
      return "serve (opponent's poor receive)"
    }
  } else if (breakdown.playerBStroke && breakdown.playerBSpin) {
    // For rally: my stroke/spin vs opponent's
    const myWeighted = breakdown.playerBStroke * 0.6 + breakdown.playerBSpin * 0.4
    const opponentWeighted =
      (breakdown.playerAStroke || 0) * 0.6 + (breakdown.playerASpin || 0) * 0.4
    const advantage = myWeighted - opponentWeighted

    // Determine which aspect was stronger
    const strokeAdvantage =
      (breakdown.playerBStroke || 0) - (breakdown.playerAStroke || 0)
    const spinAdvantage = (breakdown.playerBSpin || 0) - (breakdown.playerASpin || 0)

    if (advantage > 10) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `powerful ${breakdown.playerBStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return 'heavy spin'
      }
    } else if (advantage > 5) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `strong ${breakdown.playerBStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return 'strong spin'
      }
    } else {
      return `${breakdown.playerBStroke > 50 ? 'forehand' : 'backhand'}/spin (opponent's weakness)`
    }
  } else if (breakdown.playerBReceive) {
    // My superior receive
    return 'superior receive'
  }

  return isServe ? 'serve' : 'stroke/spin'
}

/**
 * Check if point is lost based on R1 and R2 using curved probabilities
 * Returns true if point is lost, false otherwise
 */
export function checkPointLoss(
  r1: number,
  r2: number,
  r1Breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  r2Breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): { lost: boolean; reason: string | null } {
  // Calculate individual probabilities
  const r1LossProb = calculateR1LossProbability(r1)
  const r2LossProb = calculateR2LossProbability(r2)
  const combinedLossProb = calculateCombinedLossProbability(r1 + r2)

  // Combine probabilities: use the maximum (worst deficit determines risk)
  // This ensures that severe deficits in any area create significant risk
  // Note: We could also use combined probability formula, but max is simpler and more intuitive
  const maxLossProb = Math.max(r1LossProb, r2LossProb, combinedLossProb)

  // Roll for loss
  if (Math.random() < maxLossProb) {
    // Generate specific commentary based on which deficit caused the loss
    let reason: string

    if (combinedLossProb >= r1LossProb && combinedLossProb >= r2LossProb) {
      // Combined deficit - analyze both
      const r1Cause = analyzeR1LossCause(r1, r1Breakdown, isServe)
      const r2Cause = analyzeR2LossCause(r2, r2Breakdown, isServe)
      reason = `lost to ${r1Cause} and ${r2Cause}`
    } else if (r1LossProb >= r2LossProb) {
      // R1 deficit
      const cause = analyzeR1LossCause(r1, r1Breakdown, isServe)
      reason = `lost to ${cause}`
    } else {
      // R2 deficit
      const cause = analyzeR2LossCause(r2, r2Breakdown, isServe)
      reason = `lost to ${cause}`
    }

    return { lost: true, reason }
  }

  return { lost: false, reason: null }
}

/**
 * Check if point is won based on R1 and R2
 * Returns true if point is won, false otherwise
 * Strong shots (high positive R1 or R2, or combined) can win the point
 */
export function checkPointWin(
  r1: number,
  r2: number,
  rallyLength: number,
  r1Breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  r2Breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): { won: boolean; reason: string | null } {
  // Very strong individual stats can win immediately
  if (r1 > 30) {
    const cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
    return { won: true, reason: `overwhelming advantage through ${cause}` }
  }
  if (r2 > 30) {
    const cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
    return { won: true, reason: `overwhelming advantage through ${cause}` }
  }

  // Very strong combined performance
  if (r1 + r2 > 40) {
    const r1Cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
    const r2Cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
    return { won: true, reason: `overwhelming advantage (${r1Cause} and ${r2Cause})` }
  }

  // Strong shots have a chance to win based on quality difference
  // Probability increases with better R1+R2, decreases with rally length
  if (r1 + r2 > 20) {
    const winChance = 0.2 + (r1 + r2 - 20) / 100 // 20% base, up to 50% at R1+R2=50
    const rallyPenalty = Math.min(0.15, rallyLength * 0.01) // Penalty for long rallies
    const adjustedChance = Math.max(0.05, winChance - rallyPenalty)

    if (Math.random() < adjustedChance) {
      const r1Cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
      const r2Cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
      // Determine primary cause
      const primaryCause = r1 > r2 ? r1Cause : r2Cause
      return { won: true, reason: `won with strong ${primaryCause}` }
    }
  }

  // Moderate advantage: lower chance
  if (r1 + r2 > 10) {
    const winChance = 0.1 + (r1 + r2 - 10) / 150 // 10% base, up to ~27% at R1+R2=25
    const rallyPenalty = Math.min(0.1, rallyLength * 0.01)
    const adjustedChance = Math.max(0.02, winChance - rallyPenalty)

    if (Math.random() < adjustedChance) {
      const r1Cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
      const r2Cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
      const primaryCause = r1 > r2 ? r1Cause : r2Cause
      return { won: true, reason: `won with good ${primaryCause}` }
    }
  }

  return { won: false, reason: null }
}
