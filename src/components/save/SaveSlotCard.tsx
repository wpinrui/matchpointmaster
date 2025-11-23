import React from 'react'
import { SaveSlot } from '../../services/savegame/saveManager'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'
import { formatDateTime } from '../../utils/dateFormatter'
import { StyledCard, StyledHeading, StyledText, StyledFlex } from '../../styles'

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
    <StyledCard
      clickable
      style={{
        padding: theme.spacing.lg,
        border: isCurrent
          ? `2px solid ${theme.colors.primary.main}`
          : `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
        backgroundColor: isCurrent ? theme.colors.primary.light + '20' : undefined,
        cursor: 'pointer'
      }}
      onClick={(e) => {
        // Only load if not clicking on buttons
        const target = e.target as HTMLElement
        if (!target.closest('button')) {
          onLoad(slot.id)
        }
      }}
    >
      <StyledFlex
        justify="space-between"
        align="flex-start"
        style={{ marginBottom: theme.spacing.sm }}
      >
        <div style={{ flex: 1 }}>
          <StyledHeading size="h5" margin={`0 0 ${theme.spacing.xs} 0`}>
            {slot.name}
            {isCurrent && (
              <StyledText
                size="sm"
                weight="medium"
                style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary.main }}
              >
                (Current)
              </StyledText>
            )}
          </StyledHeading>
          <StyledText
            size="sm"
            color="secondary"
            style={{ marginBottom: theme.spacing.xs }}
          >
            Created: {formatDateTime(slot.createdAt)}
          </StyledText>
          <StyledText size="sm" color="secondary">
            Last Played: {formatDateTime(slot.lastPlayed)}
          </StyledText>
          {slot.data.manager.fullName && (
            <StyledText
              size="sm"
              weight="medium"
              color="primary"
              style={{ marginTop: theme.spacing.xs }}
            >
              Manager: {slot.data.manager.fullName}
            </StyledText>
          )}
          {slot.data.school.name && (
            <StyledText size="sm" weight="medium" color="primary">
              School: {slot.data.school.name}
            </StyledText>
          )}
        </div>
        <StyledFlex
          direction="column"
          gap="sm"
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
        </StyledFlex>
      </StyledFlex>
    </StyledCard>
  )
}
