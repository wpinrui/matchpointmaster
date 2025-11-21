import React, { useState } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { PlayerCard } from '../components/players/PlayerCard'
import { generatePlayers, IntakeQuality } from '../utils/playerGeneration'
import GameButton from '../components/buttons/GameButton'
import { theme } from '../theme/theme'
import { CommonStyles } from '../styles/common/CommonStyles'

const PlayersScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players, updatePlayers } = useSaveDataContext()
  const [selectedQuality, setSelectedQuality] = useState<IntakeQuality>(
    IntakeQuality.AVERAGE
  )

  const handleGeneratePlayers = () => {
    const newPlayers = generatePlayers(5, selectedQuality, 1)
    updatePlayers.set([...players, ...newPlayers])
  }

  const handleClearPlayers = () => {
    updatePlayers.set([])
  }

  return (
    <div
      style={CommonStyles.containerStyle}
      className="d-flex justify-content-center align-items-center"
    >
      <div style={CommonStyles.dialogStyle} className="rounded p-4 position-relative">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xl
          }}
        >
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}
          >
            Players ({players.length})
          </h1>
          <GameButton
            variant="secondary"
            onClick={() => changeScreen(Screens.HOME)}
            type="button"
          >
            Back to Home
          </GameButton>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <label
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              fontWeight: theme.typography.fontWeight.medium
            }}
          >
            Intake Quality:
          </label>
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value as IntakeQuality)}
            style={{
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `2px solid ${theme.colors.neutral.gray300}`,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.primary,
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.neutral.white
            }}
          >
            <option value={IntakeQuality.POOR}>Poor</option>
            <option value={IntakeQuality.BELOW_AVERAGE}>Below Average</option>
            <option value={IntakeQuality.AVERAGE}>Average</option>
            <option value={IntakeQuality.ABOVE_AVERAGE}>Above Average</option>
            <option value={IntakeQuality.EXCELLENT}>Excellent</option>
          </select>
          <GameButton variant="primary" onClick={handleGeneratePlayers} type="button">
            Generate 5 Players
          </GameButton>
          {players.length > 0 && (
            <GameButton variant="secondary" onClick={handleClearPlayers} type="button">
              Clear All
            </GameButton>
          )}
        </div>

        {/* Players Grid */}
        {players.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: theme.spacing.xl,
              color: theme.colors.text.secondary
            }}
          >
            No players yet. Generate some players to get started!
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: theme.spacing.lg
            }}
          >
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayersScreen
