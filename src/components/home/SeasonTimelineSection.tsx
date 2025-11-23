/**
 * Season timeline section for home screen
 */
import React from 'react'
import GameCard from '../cards/GameCard'
import { TimelineItem } from './TimelineItem'
import { theme } from '../../theme/theme'
import { StyledHeading, StyledFlex } from '../../styles'

interface SeasonTimelineSectionProps {
  currentMonth: number
  draftCompleted: boolean
  isDraftPhase?: boolean
  isTrainingPhase?: boolean
}

export const SeasonTimelineSection: React.FC<SeasonTimelineSectionProps> = ({
  currentMonth,
  draftCompleted,
  isDraftPhase = false,
  isTrainingPhase = false
}) => {
  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: isDraftPhase || isTrainingPhase ? 'none' : '400px',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      <StyledHeading
        size="h5"
        margin={`0 0 ${theme.spacing.md} 0`}
        style={{ flexShrink: 0 }}
      >
        Season Timeline
      </StyledHeading>
      <StyledFlex
        direction="column"
        gap="sm"
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0
        }}
      >
        <TimelineItem
          month={1}
          label="Player Draft"
          currentMonth={currentMonth}
          completed={draftCompleted}
        />
        <TimelineItem month={2} label="Training Phase" currentMonth={currentMonth} />
        <TimelineItem month={3} label="Training Phase" currentMonth={currentMonth} />
        <TimelineItem month={4} label="Training Phase" currentMonth={currentMonth} />
        <TimelineItem
          month={5}
          label="Intra-Club Round-Robin"
          currentMonth={currentMonth}
        />
        <TimelineItem
          month={6}
          label="Zonal School Tournament"
          currentMonth={currentMonth}
        />
        <TimelineItem
          month={7}
          label="National Championships"
          currentMonth={currentMonth}
        />
        <TimelineItem month={8} label="Training Phase" currentMonth={currentMonth} />
        <TimelineItem month={9} label="Training Phase" currentMonth={currentMonth} />
        <TimelineItem month={10} label="Training Phase" currentMonth={currentMonth} />
        <TimelineItem
          month={11}
          label="National Singles Tournament"
          currentMonth={currentMonth}
        />
        <TimelineItem
          month={12}
          label="Graduation & Celebrations"
          currentMonth={currentMonth}
        />
      </StyledFlex>
    </GameCard>
  )
}
