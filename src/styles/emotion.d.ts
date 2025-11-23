/**
 * Emotion Theme Type Declaration
 * Extends Emotion's theme interface to include our custom theme
 */

import '@emotion/react'
import { Theme as CustomTheme } from '../theme/theme'

declare module '@emotion/react' {
  export interface Theme extends CustomTheme {}
}

