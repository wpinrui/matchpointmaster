import React from 'react'
import { SaveSlot } from '../../services/savegame/saveManager'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'
import { formatDateTime } from '../../utils/dateFormatter'

interface SaveSlotCardProps {
  slot: SaveSlot
  isCurrent: boolean
  onLoad: (slotId: string) => void
  onDelete: (slotId: string) => void
}

export const SaveSlotCard: React.FC<SaveSlotCardProps> = ({
  slot,
  isCurrent,
  onLoad,
  onDelete
}) => {
  return (
    <div
      style={{
        padding: theme.spacing.lg,
        border: isCurrent
          ? `2px solid ${theme.colors.primary.main}`
          : `1px solid ${theme.colors.neutral.gray300}`,
        backgroundColor: isCurrent
          ? theme.colors.primary.light + '20'
          : theme.colors.neutral.white,
        cursor: 'pointer',
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.lg,
        background: theme.gradients.card,
        backdropFilter: 'blur(20px)',
        transition: `all ${theme.transitions.normal}`
      }}
      onClick={(e) => {
        // Only load if not clicking on buttons
        const target = e.target as HTMLElement
        if (!target.closest('button')) {
          onLoad(slot.id)
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs
            }}
          >
            {slot.name}
            {isCurrent && (
              <span
                style={{
                  marginLeft: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.primary.main,
                  fontWeight: theme.typography.fontWeight.medium
                }}
              >
                (Current)
              </span>
            )}
          </h3>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs
            }}
          >
            Created: {formatDateTime(slot.createdAt)}
          </p>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary
            }}
          >
            Last Played: {formatDateTime(slot.lastPlayed)}
          </p>
          {slot.data.manager.fullName && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
                marginTop: theme.spacing.xs,
                fontWeight: theme.typography.fontWeight.medium
              }}
            >
              Manager: {slot.data.manager.fullName}
            </p>
          )}
          {slot.data.school.name && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
                fontWeight: theme.typography.fontWeight.medium
              }}
            >
              School: {slot.data.school.name}
            </p>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            flexDirection: 'column'
          }}
          onClick={(e) => {
            // Prevent card click when clicking buttons
            e.stopPropagation()
          }}
        >
          {!isCurrent && (
            <GameButton
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onLoad(slot.id)
              }}
              type="button"
            >
              Load
            </GameButton>
          )}
          <GameButton
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(slot.id)
            }}
            type="button"
          >
            Delete
          </GameButton>
        </div>
      </div>
    </div>
  )
}
