/**
 * Match engine - main rally simulation and match initialization
 */
import { FavourStyle, Player } from '../services/savegame/types'
import { MatchState, PlayerPosition, RallyEvent } from './match/matchTypes'
import {
  checkLuckyBounce,
  determineBallPosition,
  getEquipmentModifiers,
  getPositioningBias
} from './match/matchHelpers'
import {
  calculateR1,
  calculateR1Serve,
  calculateR2,
  calculateR2Serve
} from './match/matchCalculations'
import { checkPointLoss, checkPointWin } from './match/matchAnalysis'

// Re-export types for external use
export type { MatchState, PlayerPosition, RallyEvent } from './match/matchTypes'

/**
 * Simulate a single rally using new R1/R2 mechanics
 */
export function simulateRally(
  player1: Player,
  player2: Player,
  servingPlayer: number,
  playerPositions: [PlayerPosition, PlayerPosition],
  isServe: boolean
): {
  winner: number
  events: RallyEvent[]
  newPositions: [PlayerPosition, PlayerPosition]
} {
  const events: RallyEvent[] = []
  const positions: [PlayerPosition, PlayerPosition] = [...playerPositions]
  let currentPlayer = servingPlayer
  let rallyLength = 0
  let cumulativeR1R2Bonus = 0 // Track (R1+R2)/2 bonus/penalty to apply to next shot

  // Serve: Player A serves to Player B
  const server = currentPlayer === 0 ? player1 : player2
  const receiver = currentPlayer === 0 ? player2 : player1
  const serverModifiers = getEquipmentModifiers(server.forehandRubber)
  const receiverModifiers = getEquipmentModifiers(receiver.forehandRubber)

  // Consistency check before serve
  const serveConsistencyRatio = server.skills.consistency / 100
  const serveErrorChance = Math.pow(1 - serveConsistencyRatio, 2) * 0.08 // Max 8% error chance (tuned down from 10%)
  const serveQualityPenalty = (1 - server.skills.serve / 100) * 0.04 // Up to 4% additional (tuned down from 5%)
  const totalServeErrorChance = Math.min(0.12, serveErrorChance + serveQualityPenalty) // Capped at 12% (down from 15%)

  if (Math.random() < totalServeErrorChance) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'error',
      player: currentPlayer,
      description: `${serverName} serves out`,
      timestamp: Date.now()
    })
    events.push({
      type: 'point',
      player: 1 - currentPlayer,
      description: `${receiverName} wins the point (serve error)`,
      timestamp: Date.now()
    })
    return {
      winner: 1 - currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Check for lucky bounce on serve
  const serveLucky = checkLuckyBounce(server.skills.serve)
  // Lucky bounce effects: net makes placement better (harder footwork) but slower/less spin (easier receive)
  // Edge makes placement better only
  const serveR1Penalty = serveLucky.occurred ? -serveLucky.r1Bonus : 0 // Makes receiver's R1 worse (harder placement)
  const serveR2BonusForReceiver = serveLucky.occurred ? -serveLucky.r2Bonus : 0 // Makes receiver's R2 better (easier receive)
  if (serveLucky.occurred) {
    events.push({
      type: 'lucky_bounce',
      player: currentPlayer,
      description: `${server.shortName || server.firstName} gets a lucky ${serveLucky.type} bounce on serve!`,
      timestamp: Date.now()
    })
  }

  events.push({
    type: 'serve',
    player: currentPlayer,
    description: `${server.shortName || server.firstName} serves`,
    timestamp: Date.now()
  })

  // Calculate R1 and R2 for serve receive
  // For service: use serve/receive stats for both R1 and R2
  // R1 uses serve stat (placement difficulty), R2 uses serve stat (speed/spin)
  // Lucky bounce: better placement (harder footwork) but net bounce = slower serve (easier receive)
  const serveR1Result = calculateR1Serve(receiver, server, serveR1Penalty)
  const serveR2Result = calculateR2Serve(
    receiver,
    server,
    receiverModifiers,
    serveR2BonusForReceiver
  )

  const serveR1 = serveR1Result.r1
  const serveR2 = serveR2Result.r2

  // No need to log return attempts - only log point wins/losses

  // Check if receiver loses point on serve return (service ace)
  const serveLossCheck = checkPointLoss(
    serveR1,
    serveR2,
    serveR1Result.breakdown,
    serveR2Result.breakdown,
    true
  )
  if (serveLossCheck.lost) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'point',
      player: currentPlayer,
      description: `${serverName} wins the point (${serveLossCheck.reason})`,
      timestamp: Date.now()
    })
    return {
      winner: currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Consistency check on receiver's return
  const receiveConsistencyRatio = receiver.skills.consistency / 100
  const receiveErrorChance = Math.pow(1 - receiveConsistencyRatio, 2) * 0.12 // Max 12% error chance (tuned down from 15%)
  const receiveQualityPenalty = (1 - (serveR1 + serveR2) / 200) * 0.08 // Penalty based on poor R1/R2 (tuned down from 10%)
  const totalReceiveErrorChance = Math.min(
    0.2,
    receiveErrorChance + receiveQualityPenalty
  ) // Capped at 20% (down from 25%)

  if (Math.random() < totalReceiveErrorChance) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'error',
      player: 1 - currentPlayer,
      description: `${receiverName} returns the ball out`,
      timestamp: Date.now()
    })
    events.push({
      type: 'point',
      player: currentPlayer,
      description: `${serverName} wins the point (receive error)`,
      timestamp: Date.now()
    })
    return {
      winner: currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Check if receiver wins point on serve return (strong return) - after consistency check
  const serveWinCheck = checkPointWin(
    serveR1,
    serveR2,
    rallyLength,
    serveR1Result.breakdown,
    serveR2Result.breakdown,
    true
  )
  if (serveWinCheck.won) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'point',
      player: 1 - currentPlayer,
      description: `${receiverName} wins the point (${serveWinCheck.reason})`,
      timestamp: Date.now()
    })
    return {
      winner: 1 - currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Calculate cumulative bonus for next shot: (R1+R2)/2
  cumulativeR1R2Bonus = (serveR1 + serveR2) / 2

  // Switch to receiver (now they become the hitter)
  currentPlayer = 1 - currentPlayer
  rallyLength++

  // Rally loop: Each shot follows the same pattern
  const pointWon = false
  while (!pointWon) {
    const hitter = currentPlayer === 0 ? player1 : player2
    const opponent = currentPlayer === 0 ? player2 : player1
    const hitterModifiers = getEquipmentModifiers(
      hitter.forehandBackhandTendency === FavourStyle.HEAVILY_FOREHAND ||
        hitter.forehandBackhandTendency === FavourStyle.SLIGHTLY_FOREHAND
        ? hitter.forehandRubber
        : hitter.backhandRubber
    )
    const opponentModifiers = getEquipmentModifiers(opponent.forehandRubber)

    // Consistency check before hit
    const hitterConsistencyRatio = hitter.skills.consistency / 100
    const hitterErrorChance = Math.pow(1 - hitterConsistencyRatio, 2) * 0.12 // Max 12% error chance (tuned down from 15%)
    const bonusPenalty = (1 - cumulativeR1R2Bonus / 50) * 0.04 // Penalty if previous shot was poor (tuned down from 5%)
    const totalHitterErrorChance = Math.min(0.2, hitterErrorChance + bonusPenalty) // Capped at 20% (down from 25%)

    if (Math.random() < totalHitterErrorChance) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'error',
        player: currentPlayer,
        description: `${hitterName} hits the ball out`,
        timestamp: Date.now()
      })
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponentName} wins the point (error)`,
        timestamp: Date.now()
      })
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Determine where the ball goes based on opponent's placement
    // The opponent just hit the ball, so determine where it goes to the hitter
    const ballPosition = determineBallPosition(opponent, true) // Assume opponent used forehand
    const isHitterForehand = ballPosition.isForehand

    // Check for lucky bounce on opponent's shot
    // The opponent just hit the ball, so check if they got a lucky bounce
    const opponentStroke = isHitterForehand
      ? opponent.skills.forehand
      : opponent.skills.backhand
    const opponentWeightedStroke =
      opponentStroke * 0.6 + opponent.skills.spin * opponentModifiers.spinMultiplier * 0.4
    const lucky = checkLuckyBounce(opponentWeightedStroke)

    // Lucky bounce effects on returner's R1/R2:
    // Net bounce: Better placement (harder footwork) but slower/less spin (easier to counter)
    // - R1: Placement improves → subtract from returner's R1 (harder to return) → r1Penalty = -10
    // - R2: Spin/speed reduces → add to returner's R2 (easier to counter) → r2Bonus = +5
    // Edge bounce: Better placement only, no spin change
    // - R1: Placement improves → subtract from returner's R1 (harder to return) → r1Penalty = -30
    // - R2: No change to spin/speed → r2Bonus = 0
    // Note: r1Bonus/r2Bonus from checkLuckyBounce represent benefits to the hitter
    // We apply the opposite effect to the returner's calculations
    const r1Penalty = lucky.occurred ? -lucky.r1Bonus : 0 // Makes returner's R1 worse (harder placement)
    const r2BonusForReturner = lucky.occurred ? -lucky.r2Bonus : 0 // Makes returner's R2 better (less spin/speed)

    if (lucky.occurred) {
      events.push({
        type: 'lucky_bounce',
        player: 1 - currentPlayer,
        description: `${opponent.shortName || opponent.firstName} gets a lucky ${lucky.type} bounce!`,
        timestamp: Date.now()
      })
    }

    // Calculate R1: Hitter's footwork vs Opponent's placement + cumulative bonus + lucky bounce effect
    // Lucky bounce makes opponent's placement better → subtracts from hitter's R1 (harder to return)
    const r1Result = calculateR1(hitter, opponent, cumulativeR1R2Bonus + r1Penalty)
    const r1 = r1Result.r1

    // Calculate R2: Hitter's stroke+spin vs Opponent's stroke+spin + cumulative bonus + lucky bounce effect
    // Net bounce makes opponent's shot slower/less spin → adds to hitter's R2 (easier to counter)
    const r2Result = calculateR2(
      hitter,
      opponent,
      isHitterForehand,
      hitterModifiers,
      opponentModifiers,
      cumulativeR1R2Bonus + r2BonusForReturner
    )
    const r2 = r2Result.r2

    // Check if hitter loses point
    const lossCheck = checkPointLoss(
      r1,
      r2,
      r1Result.breakdown,
      r2Result.breakdown,
      false
    )
    if (lossCheck.lost) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponentName} wins the point (${lossCheck.reason})`,
        timestamp: Date.now()
      })
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Check if hitter wins point (strong shot)
    const winCheck = checkPointWin(
      r1,
      r2,
      rallyLength,
      r1Result.breakdown,
      r2Result.breakdown,
      false
    )
    if (winCheck.won) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'point',
        player: currentPlayer,
        description: `${hitterName} wins the point (${winCheck.reason})`,
        timestamp: Date.now()
      })
      return {
        winner: currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Consistency check on hitter's return
    const returnConsistencyRatio = hitter.skills.consistency / 100
    const returnErrorChance = Math.pow(1 - returnConsistencyRatio, 2) * 0.12 // Tuned down from 15%
    const returnQualityPenalty = (1 - (r1 + r2) / 200) * 0.08 // Tuned down from 10%
    const totalReturnErrorChance = Math.min(0.2, returnErrorChance + returnQualityPenalty) // Capped at 20% (down from 25%)

    if (Math.random() < totalReturnErrorChance) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'error',
        player: currentPlayer,
        description: `${hitterName} hits the ball out`,
        timestamp: Date.now()
      })
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponentName} wins the point (error)`,
        timestamp: Date.now()
      })
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Calculate cumulative bonus for next shot: (R1+R2)/2
    cumulativeR1R2Bonus = (r1 + r2) / 2

    // No need to log return attempts - only log point wins/losses

    // Switch players
    currentPlayer = 1 - currentPlayer
    rallyLength++

    // Prevent infinite loops (safety check)
    if (rallyLength > 50) {
      // Long rally - decide randomly
      const winner = Math.random() > 0.5 ? currentPlayer : 1 - currentPlayer
      events.push({
        type: 'point',
        player: winner,
        description: `Point won after long rally`,
        timestamp: Date.now()
      })
      return {
        winner,
        events,
        newPositions: positions
      }
    }
  }

  // Fallback (should never reach here, but TypeScript requires it)
  return {
    winner: 0,
    events,
    newPositions: positions
  }
}

/**
 * Initialize match state
 */
export function initializeMatch(player1: Player, player2: Player): MatchState {
  const position1 = getPositioningBias(
    player1.forehandBackhandTendency,
    player1.playStyle
  )
  const position2 = getPositioningBias(
    player2.forehandBackhandTendency,
    player2.playStyle
  )

  return {
    sets: [0, 0],
    currentSet: 0,
    setScores: [[0, 0]],
    currentGameScore: [0, 0],
    servingPlayer: Math.random() > 0.5 ? 0 : 1,
    playerPositions: [
      { horizontal: position1.horizontal, vertical: position1.vertical },
      { horizontal: position2.horizontal, vertical: position2.vertical }
    ],
    rallyEvents: [],
    isComplete: false,
    winner: null
  }
}
