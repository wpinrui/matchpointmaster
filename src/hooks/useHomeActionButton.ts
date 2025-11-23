import { useMemo } from 'react'
import { Screens } from '../screen_manager/screens'
import { GamePhase, getNextPhase } from '../utils/gamePhases'
import { isPhaseImplemented } from '../utils/phaseProgression'
import {
  isTrainingPhase as checkIsTrainingPhase,
  getDraftActionButton,
  getTrainingActionButton,
  getIntraClubActionButton
} from '../utils/actionButtonHelpers'

import {
  advanceToNextPhase,
  type PhaseProgressionParams,
  type PhaseProgressionCallbacks
} from '../utils/phaseProgression'
import { Email } from '../services/savegame/types'

interface UseHomeActionButtonParams {
  season: { phase: string; month: number; year: number }
  draftCompleted: boolean
  unreadEmails: Email[]
  players: any[]
  teamRoster: string[]
  trainingPlan: any
  skillSnapshots: any[]
  aiSchools: any[]
  manager: any
  school: any
  updateSeason: any
  updatePlayers: any
  updateTrainingPlan: any
  updateSkillSnapshots: any
  updateAISchools: any
  addEmail: any
  changeScreen: (screen: Screens) => void
  setShowTimeProgressionDialog: (show: boolean) => void
  setPendingTimeProgression: (action: (() => void) | null) => void
  roundRobinData?: any
}

export function useHomeActionButton({
  season,
  draftCompleted,
  unreadEmails,
  players,
  teamRoster,
  trainingPlan,
  skillSnapshots,
  aiSchools,
  manager,
  school,
  updateSeason,
  updatePlayers,
  updateTrainingPlan,
  updateSkillSnapshots,
  updateAISchools,
  addEmail,
  changeScreen,
  setShowTimeProgressionDialog,
  setPendingTimeProgression,
  roundRobinData
}: UseHomeActionButtonParams) {
  return useMemo(() => {
    const currentPhase = season.phase as GamePhase
    const currentPhaseString = season.phase

    // If there are unread emails, show "Unread messages" button that goes to email screen
    if (unreadEmails.length > 0) {
      return {
        text: 'Unread messages',
        action: () => changeScreen(Screens.EMAIL)
      }
    }

    // Draft phase button
    const draftButton = getDraftActionButton(draftCompleted, changeScreen)
    if (draftButton) return draftButton

    // Training phase button
    if (checkIsTrainingPhase(currentPhaseString)) {
      return getTrainingActionButton(changeScreen)
    }

    // Intra-club round-robin phase button
    if (currentPhase === GamePhase.INTRA_CLUB) {
      return getIntraClubActionButton(changeScreen, roundRobinData)
    }

    // Continue button for other phases
    const phaseIsImplemented = isPhaseImplemented(currentPhase)
    const nextPhase = getNextPhase(currentPhase, season.month)

    return {
      text: 'Continue',
      disabled: !phaseIsImplemented,
      action: () => {
        if (!phaseIsImplemented) return

        const progressionAction = () => {
          const params: PhaseProgressionParams = {
            currentMonth: season.month,
            currentYear: season.year,
            currentPhase: currentPhaseString as GamePhase,
            players,
            teamRoster,
            manager,
            school,
            trainingPlan,
            skillSnapshots,
            aiSchools
          }

          const callbacks: PhaseProgressionCallbacks = {
            updateSeason,
            updatePlayers,
            updateTrainingPlan,
            updateSkillSnapshots,
            updateAISchools,
            addEmail
          }

          advanceToNextPhase(params, callbacks)
        }

        setPendingTimeProgression(progressionAction)
        setShowTimeProgressionDialog(true)
      }
    }
  }, [
    season,
    draftCompleted,
    unreadEmails.length,
    players,
    teamRoster,
    trainingPlan,
    skillSnapshots,
    aiSchools,
    manager,
    school,
    updateSeason,
    updatePlayers,
    updateTrainingPlan,
    updateSkillSnapshots,
    updateAISchools,
    addEmail,
    changeScreen,
    setShowTimeProgressionDialog,
    setPendingTimeProgression,
    roundRobinData
  ])
}
