/**
 * Email tag color mapping
 */

import { EmailTag } from '../../services/savegame/types'
import { theme } from '../../theme/theme'

export const emailTagColors: Record<EmailTag, string> = {
  [EmailTag.WELCOME]: theme.colors.primary.main,
  [EmailTag.NEWS]: theme.colors.secondary.main,
  [EmailTag.DRAFT]: theme.colors.warning.main,
  [EmailTag.TOURNAMENT]: theme.colors.success.main,
  [EmailTag.TRAINING]: theme.colors.secondary.main,
  [EmailTag.ADMINISTRATIVE]: theme.colors.neutral.gray600,
  [EmailTag.SOCIAL]: theme.colors.accent.main
}

