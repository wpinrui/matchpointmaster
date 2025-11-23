/**
 * Style Hooks
 * React hooks for accessing theme and creating dynamic styles
 */

import { useMemo } from 'react'
import { css, CSSObject } from '@emotion/react'
import { theme } from '../../theme/theme'

/**
 * Hook to access theme values
 */
export const useTheme = () => theme

/**
 * Hook to create dynamic styles based on props
 */
export const useDynamicStyles = <T extends Record<string, any>>(
  styleFn: (props: T) => CSSObject,
  props: T
) => {
  return useMemo(() => css(styleFn(props)), [props])
}

/**
 * Hook to create conditional styles
 */
export const useConditionalStyles = (
  condition: boolean,
  trueStyles: CSSObject,
  falseStyles?: CSSObject
) => {
  return useMemo(
    () => css(condition ? trueStyles : falseStyles || {}),
    [condition, trueStyles, falseStyles]
  )
}

/**
 * Hook to merge multiple style objects
 */
export const useMergedStyles = (...styles: (CSSObject | undefined)[]) => {
  return useMemo(() => {
    return css(...(styles.filter(Boolean) as CSSObject[]))
  }, [styles])
}
