import React from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { theme } from '../../theme/theme'
import { TrainingFocus, TrainingPlan } from '../../services/savegame/types'
import {
  getAllTrainingFocuses,
  getTrainingFocusDisplayName,
  getTrainingFocusDescription
} from '../../utils/trainingPlans'

interface TeamFocusDialogProps {
  trainingPlan: TrainingPlan
  onSetFocus: (focus: TrainingFocus | null) => void
  onClose: () => void
}

export const TeamFocusDialog: React.FC<TeamFocusDialogProps> = ({
  trainingPlan,
  onSetFocus,
  onClose
}) => {
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
          marginBottom: theme.spacing.md
        }}
      >
        Set Team Training Focus
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md
        }}
      >
        {getAllTrainingFocuses().map((focus) => (
          <GameButton
            key={focus}
            variant={trainingPlan.teamFocus === focus ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSetFocus(focus)}
            style={{ textAlign: 'left' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.xs
              }}
            >
              <strong>{getTrainingFocusDisplayName(focus)}</strong>
              <span
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  opacity: 0.8
                }}
              >
                {getTrainingFocusDescription(focus)}
              </span>
            </div>
          </GameButton>
        ))}
      </div>
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <GameButton
          variant="secondary"
          size="sm"
          onClick={() => {
            onSetFocus(null)
            onClose()
          }}
        >
          Clear Team Focus
        </GameButton>
        <GameButton variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </GameButton>
      </div>
    </GameCard>
  )
}

