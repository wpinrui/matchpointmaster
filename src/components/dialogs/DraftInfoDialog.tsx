import React from 'react'
import { Modal } from 'react-bootstrap'
import { theme } from '../../theme/theme'
import GameButton from '../buttons/GameButton'

interface DraftInfoDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const DraftInfoDialog: React.FC<DraftInfoDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      backdrop
      keyboard
      centered
      style={{
        zIndex: theme.zIndex.modal
      }}
    >
      <Modal.Header
        closeButton
        style={{
          background: theme.gradients.primary,
          color: theme.colors.text.inverse,
          borderBottom: 'none',
          borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0`,
          padding: theme.spacing.lg
        }}
      >
        <Modal.Title
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontWeight: theme.typography.fontWeight.bold,
            fontSize: theme.typography.fontSize.xl
          }}
        >
          Player Draft Process
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          background: theme.colors.background.primary,
          padding: theme.spacing.xl,
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.primary,
          lineHeight: 1.6
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md
          }}
        >
          <p style={{ margin: 0 }}>
            The <strong>Player Draft</strong> is your opportunity to select players for
            your school team at the beginning of each season.
          </p>

          <div>
            <h3
              style={{
                fontFamily: theme.typography.fontFamily.heading,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
                marginTop: theme.spacing.md
              }}
            >
              How It Works
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: theme.spacing.lg,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.xs
              }}
            >
              <li>
                A pool of players interested in joining your school team will be available
                for selection.
              </li>
              <li>
                The quality and size of the player pool depends on your school&apos;s
                reputation, funding, and your coaching reputation.
              </li>
              <li>
                You can select players to add them to your team roster, up to the maximum
                team size allowed by your school&apos;s funding.
              </li>
              <li>
                Once you leave the draft screen, you cannot add more players for the rest
                of the season.
              </li>
              <li>
                Choose wisely - your selections will determine your team&apos;s
                performance throughout the season!
              </li>
            </ul>
          </div>

          <div
            style={{
              marginTop: theme.spacing.sm,
              padding: theme.spacing.md,
              background: theme.colors.primary.light + '15',
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.primary.light}`
            }}
          >
            <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm }}>
              <strong>Tip:</strong> Review each player&apos;s skills, ELO rating, and play
              style before making your selections. A well-balanced team with diverse
              strengths often performs better than a team focused on a single play style.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer
        style={{
          background: theme.colors.background.primary,
          borderTop: `1px solid ${theme.colors.neutral.gray300}`,
          borderRadius: `0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg}`,
          padding: theme.spacing.lg,
          display: 'flex',
          gap: theme.spacing.md,
          justifyContent: 'flex-end'
        }}
      >
        <GameButton variant="primary" onClick={onClose} type="button">
          Got it!
        </GameButton>
      </Modal.Footer>
    </Modal>
  )
}
