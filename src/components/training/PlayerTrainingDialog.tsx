/**
 * Dialog component for setting individual player training
 */
import React, { useState } from 'react'
import GameButton from '../buttons/GameButton'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'
import { getPlayerFullName } from '../../utils/playerGeneration'
import {
  getAllTrainingFocuses,
  getTrainingFocusDisplayName
} from '../../utils/trainingPlans'
import { PlayerTraining, TrainingFocus } from '../../services/savegame/types'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'

interface PlayerTrainingDialogProps {
  playerId: string
  currentAssignment: PlayerTraining | null
  teamFocus: TrainingFocus | null
  coachingSlotsUsed: number
  maxCoachingSlots: number
  hasCoaching: boolean
  onSet: (focus: TrainingFocus | null, isIndividualCoaching: boolean) => void
  onRemove: () => void
  onClose: () => void
}

export const PlayerTrainingDialog: React.FC<PlayerTrainingDialogProps> = ({
  playerId,
  currentAssignment,
  teamFocus,
  coachingSlotsUsed,
  maxCoachingSlots,
  hasCoaching,
  onSet,
  onRemove,
  onClose
}) => {
  const { players } = useSaveDataContext()
  const [selectedFocus, setSelectedFocus] = useState<TrainingFocus | null>(
    currentAssignment?.focus ?? teamFocus ?? null
  )
  const [useIndividualCoaching, setUseIndividualCoaching] = useState<boolean>(hasCoaching)

  const player = players.find((p) => p.id === playerId)
  if (!player) return null

  const canUseCoaching =
    useIndividualCoaching && hasCoaching
      ? true // Already has coaching slot
      : coachingSlotsUsed < maxCoachingSlots // Has available slot

  const handleConfirm = () => {
    if (selectedFocus === null) {
      onRemove()
    } else {
      onSet(selectedFocus, useIndividualCoaching && canUseCoaching)
    }
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
      }}
    >
      <h3
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: 0,
          marginBottom: theme.spacing.sm
        }}
      >
        Set Training for {getPlayerFullName(player)}
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.md
        }}
      >
        {/* Training Focus Selection */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing.xs,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}
          >
            Training Focus
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: theme.spacing.sm
            }}
          >
            {getAllTrainingFocuses().map((focus) => (
              <GameButton
                key={focus}
                variant={selectedFocus === focus ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedFocus(focus)}
              >
                {getTrainingFocusDisplayName(focus)}
              </GameButton>
            ))}
          </div>
        </div>

        {/* Individual Coaching Toggle */}
        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={useIndividualCoaching}
              onChange={(e) => setUseIndividualCoaching(e.target.checked)}
              disabled={!canUseCoaching && !hasCoaching}
              style={{
                width: '20px',
                height: '20px',
                cursor: canUseCoaching || hasCoaching ? 'pointer' : 'not-allowed'
              }}
            />
            <span style={{ color: theme.colors.text.primary }}>
              Individual Coaching (Uses coaching slot)
            </span>
          </label>
          {!canUseCoaching && !hasCoaching && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.error.main,
                marginTop: theme.spacing.xs,
                marginBottom: 0
              }}
            >
              No coaching slots available ({coachingSlotsUsed} / {maxCoachingSlots} used)
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <GameButton variant="primary" size="sm" onClick={handleConfirm}>
          {currentAssignment ? 'Update Training' : 'Set Training'}
        </GameButton>
        {currentAssignment && (
          <GameButton variant="danger" size="sm" onClick={onRemove}>
            Remove Individual Training
          </GameButton>
        )}
        <GameButton variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </GameButton>
      </div>
    </GameCard>
  )
}
