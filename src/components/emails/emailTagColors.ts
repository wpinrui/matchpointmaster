/**
 * Email tag color mapping
 */

import { EmailTag } from '../../services/savegame/types'
import { theme } from '../../theme/theme'

export const emailTagColors: Record<EmailTag, string> = {
  [EmailTag.WELCOME]: theme.colors.primary.light, // Bright orange
  [EmailTag.NEWS]: theme.colors.neon.secondary, // Neon blue for better visibility
  [EmailTag.DRAFT]: theme.colors.warning.light, // Bright orange
  [EmailTag.TOURNAMENT]: theme.colors.success.light, // Bright green
  [EmailTag.TRAINING]: theme.colors.neon.secondary, // Neon blue for better visibility
  [EmailTag.ADMINISTRATIVE]: theme.colors.text.primary, // White for maximum visibility
  [EmailTag.SOCIAL]: theme.colors.accent.light // Bright yellow
}
