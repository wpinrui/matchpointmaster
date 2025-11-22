import React from 'react'
import { ScreenProps } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { theme } from '../theme/theme'
import GameCard from '../components/cards/GameCard'
import { ManagerStatsDisplay } from '../components/manager/ManagerStatsDisplay'

const ProfileScreen: React.FC<ScreenProps> = () => {
  const { manager, school } = useSaveDataContext()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        height: '100%'
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
          marginBottom: theme.spacing.xl,
          textAlign: 'left'
        }}
      >
        Profile
      </h1>

      {/* Manager Section */}
      <div style={{ marginBottom: theme.spacing.xl }}>
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg
          }}
        >
          Manager
        </h2>
        {manager.fullName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.lg
            }}
          >
            {manager.imagePath && (
              <img
                src={manager.imagePath}
                alt="Manager"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: theme.borderRadius.full,
                  border: `3px solid ${theme.colors.primary.main}`,
                  objectFit: 'cover'
                }}
              />
            )}
            <div>
              <h3
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs
                }}
              >
                {manager.fullName}
              </h3>
              {manager.shortName && (
                <p
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.secondary
                  }}
                >
                  {manager.shortName}
                </p>
              )}
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs
                }}
              >
                Gender: {manager.gender}
              </p>
            </div>
          </div>
        )}
        {manager.stats && <ManagerStatsDisplay stats={manager.stats} />}
      </div>

      {/* School Section */}
      <div>
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg
          }}
        >
          School
        </h2>
        {school.name && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.lg
            }}
          >
            {school.crestPath && (
              <img
                src={school.crestPath}
                alt="School Crest"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: theme.borderRadius.lg,
                  border: `3px solid ${theme.colors.secondary.main}`,
                  objectFit: 'contain',
                  background: theme.colors.neutral.white,
                  padding: theme.spacing.sm
                }}
              />
            )}
            <div>
              <h3
                style={{
                  fontFamily: theme.typography.fontFamily.heading,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs
                }}
              >
                {school.name}
              </h3>
              {school.teamType && (
                <p
                  style={{
                    fontSize: theme.typography.fontSize.base,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    marginTop: theme.spacing.xs,
                    marginBottom: theme.spacing.sm
                  }}
                >
                  Team Type:{' '}
                  {school.teamType === 'boys'
                    ? 'Boys Only'
                    : school.teamType === 'girls'
                      ? 'Girls Only'
                      : 'Both Teams'}
                </p>
              )}
              {school.reputation !== undefined && (
                <div style={{ marginTop: theme.spacing.md }}>
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.xs
                    }}
                  >
                    School Reputation Rank: {school.reputation}
                  </p>
                  <div
                    style={{
                      height: '12px',
                      background: theme.colors.neutral.gray200,
                      borderRadius: theme.borderRadius.sm,
                      overflow: 'hidden',
                      width: '200px'
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, ((100 - school.reputation) * 100) / 100)}%`,
                        height: '100%',
                        background: theme.colors.secondary.main,
                        borderRadius: theme.borderRadius.sm,
                        transition: 'width 0.5s ease-in-out'
                      }}
                    />
                  </div>
                </div>
              )}
              {school.funding !== undefined && (
                <div style={{ marginTop: theme.spacing.sm }}>
                  <p
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.xs
                    }}
                  >
                    School Funding Rank: {school.funding}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginTop: theme.spacing.lg
          }}
        >
          <div>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs
              }}
            >
              Primary Color
            </p>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: theme.borderRadius.md,
                background: school.primaryColor,
                border: `2px solid ${theme.colors.neutral.gray300}`
              }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs
              }}
            >
              Secondary Color
            </p>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: theme.borderRadius.md,
                background: school.secondaryColor,
                border: `2px solid ${theme.colors.neutral.gray300}`
              }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs
              }}
            >
              Accent Color
            </p>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: theme.borderRadius.md,
                background: school.accentColor,
                border: `2px solid ${theme.colors.neutral.gray300}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen
