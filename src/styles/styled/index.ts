/**
 * Styled Components System
 * Standardized styled components using Emotion for consistent styling across the application
 */

import styled from '@emotion/styled'
import { css } from '@emotion/react'
import { theme } from '../../theme/theme'

// ============================================================================
// Base Styled Components
// ============================================================================

export const StyledContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: ${theme.spacing.md};
`

export const StyledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.gradients.overlay};
  backdrop-filter: blur(12px);
  z-index: ${theme.zIndex.base};
`

// ============================================================================
// Typography Components
// ============================================================================

interface HeadingProps {
  size?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  color?: 'primary' | 'secondary' | 'light'
  align?: 'left' | 'center' | 'right'
  margin?: string
}

const getHeadingSize = (size: HeadingProps['size'] = 'h1') => {
  const sizeMap = {
    h1: theme.typography.fontSize['5xl'],
    h2: theme.typography.fontSize['4xl'],
    h3: theme.typography.fontSize['3xl'],
    h4: theme.typography.fontSize['2xl'],
    h5: theme.typography.fontSize.xl,
    h6: theme.typography.fontSize.lg
  }
  return sizeMap[size]
}

const getHeadingColor = (color: HeadingProps['color'] = 'primary') => {
  const colorMap = {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    light: theme.colors.text.light
  }
  return colorMap[color]
}

export const StyledHeading = styled.h1<HeadingProps>`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${({ size }) => getHeadingSize(size)};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${({ color }) => getHeadingColor(color)};
  line-height: ${theme.typography.lineHeight.tight};
  margin: ${({ margin }) => margin || `0 0 ${theme.spacing.lg} 0`};
  text-align: ${({ align }) => align || 'left'};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`

export const StyledText = styled.p<{
  size?: keyof typeof theme.typography.fontSize
  color?: 'primary' | 'secondary' | 'light'
  weight?: keyof typeof theme.typography.fontWeight
  align?: 'left' | 'center' | 'right'
}>`
  font-size: ${({ size = 'base' }) => theme.typography.fontSize[size]};
  color: ${({ color = 'primary' }) => {
    const colorMap = {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
      light: theme.colors.text.light
    }
    return colorMap[color]
  }};
  font-weight: ${({ weight = 'normal' }) => theme.typography.fontWeight[weight]};
  text-align: ${({ align }) => align || 'left'};
  margin: 0;
  line-height: ${theme.typography.lineHeight.normal};
`

// ============================================================================
// Card Components
// ============================================================================

interface CardProps {
  nested?: boolean
  glow?: boolean
  clickable?: boolean
}

export const StyledCard = styled.div<CardProps>`
  background: ${({ nested }) =>
    nested ? theme.gradients.nestedCard : theme.gradients.card};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  border: ${theme.borderWidth.default} solid ${theme.colors.border.default};
  transition: all ${theme.transitions.normal};
  position: relative;

  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
      &:focus {
        outline: 2px solid ${theme.colors.border.selection};
        outline-offset: 2px;
      }
      &:focus-visible {
        outline: 2px solid ${theme.colors.border.selection};
        outline-offset: 2px;
      }
    `}

  ${({ glow }) =>
    glow &&
    css`
      &:hover {
        border-color: ${theme.colors.border.selection};
      }
    `}
`

// ============================================================================
// Button Components
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  glow?: boolean
}

const getButtonGradient = (variant: ButtonVariant) => {
  const gradientMap: Record<ButtonVariant, string> = {
    primary: theme.gradients.primary,
    secondary: theme.gradients.secondary,
    accent: theme.gradients.accent,
    success: `linear-gradient(135deg, ${theme.colors.success.main} 0%, ${theme.colors.success.light} 100%)`,
    danger: `linear-gradient(135deg, ${theme.colors.error.main} 0%, ${theme.colors.error.light} 100%)`
  }
  return gradientMap[variant]
}

const getButtonPadding = (size: ButtonSize) => {
  const paddingMap = {
    sm: `${theme.spacing.sm} ${theme.spacing.md}`,
    md: `${theme.spacing.md} ${theme.spacing.xl}`,
    lg: `${theme.spacing.lg} ${theme.spacing['2xl']}`
  }
  return paddingMap[size]
}

const getButtonFontSize = (size: ButtonSize) => {
  const fontSizeMap = {
    sm: theme.typography.fontSize.sm,
    md: theme.typography.fontSize.base,
    lg: theme.typography.fontSize.lg
  }
  return fontSizeMap[size]
}

const getButtonNeonColor = (variant: ButtonVariant) => {
  const neonMap: Record<ButtonVariant, string> = {
    primary: theme.colors.neon.primary,
    secondary: theme.colors.neon.secondary,
    accent: theme.colors.neon.accent,
    success: theme.colors.neon.success,
    danger: theme.colors.neon.danger
  }
  return neonMap[variant]
}

export const StyledButton = styled.button<ButtonProps>`
  background: ${({ variant = 'primary' }) => getButtonGradient(variant)};
  color: ${theme.colors.neutral.white};
  border: ${theme.borderWidth.default} solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.lg};
  padding: ${({ size = 'md' }) => getButtonPadding(size)};
  font-size: ${({ size = 'md' }) => getButtonFontSize(size)};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.primary};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    border-color: ${({ variant = 'primary', glow }) =>
      glow ? getButtonNeonColor(variant) : theme.colors.border.hover};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:not(:disabled):hover::before {
    left: 100%;
  }

  &:active {
    transform: scale(0.98);
  }
`

// ============================================================================
// Input Components
// ============================================================================

interface InputProps {
  error?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const StyledInput = styled.input<InputProps>`
  background: ${theme.colors.background.secondary};
  border: ${theme.borderWidth.default} solid
    ${({ error }) => (error ? theme.colors.error.main : theme.colors.border.default)};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  width: 100%;
  font-family: ${theme.typography.fontFamily.primary};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ error }) =>
      error ? theme.colors.error.main : theme.colors.border.selection};
  }

  &::placeholder {
    color: ${theme.colors.text.light};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* React Bootstrap Form.Control compatibility */
  &.form-control {
    display: block;
  }

  &.form-control-sm {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  }

  &.form-control-lg {
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    font-size: ${theme.typography.fontSize.lg};
  }
`

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-family: ${theme.typography.fontFamily.primary};
`

export const StyledErrorText = styled.span`
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.xs};
  display: block;
  font-family: ${theme.typography.fontFamily.primary};
`

export const StyledHelperText = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.xs};
  display: block;
  font-family: ${theme.typography.fontFamily.primary};
`

const getSelectArrowColor = (focused: boolean) => {
  return focused ? theme.colors.primary.main : theme.colors.text.secondary
}

export const StyledSelect = styled.select.withConfig({
  shouldForwardProp: (prop) => prop !== '$focused' && prop !== 'error'
})<{ error?: boolean; $focused?: boolean }>`
  background: ${theme.colors.background.secondary};
  border: ${theme.borderWidth.default} solid
    ${({ error, $focused }) =>
      error
        ? theme.colors.error.main
        : $focused
          ? theme.colors.border.selection
          : theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md} ${theme.spacing['2xl']} ${theme.spacing.md}
    ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  transition: all ${theme.transitions.fast};
  width: 100%;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  font-family: ${theme.typography.fontFamily.primary};
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.md} center;
  background-size: 14px 14px;

  background-image: ${({ $focused }) => {
    const color = getSelectArrowColor($focused || false)
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='${encodeURIComponent(
      color
    )}' d='M7 10L2 5h10z'/%3E%3C/svg%3E")`
  }};

  &:focus {
    outline: none;
    border-color: ${({ error }) =>
      error ? theme.colors.error.main : theme.colors.border.selection};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const StyledTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: ${theme.spacing.sm};
  background: ${theme.colors.text.primary};
  color: ${theme.colors.text.inverse};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  max-width: 400px;
  min-width: 250px;
  z-index: ${theme.zIndex.tooltip};
  border: ${theme.borderWidth.default} solid ${theme.colors.border.default};
  white-space: normal;
  line-height: ${theme.typography.lineHeight.relaxed};
  pointer-events: none;
  font-family: ${theme.typography.fontFamily.primary};

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${theme.colors.text.primary};
  }
`

// ============================================================================
// Layout Components
// ============================================================================

export const StyledFlex = styled.div<{
  direction?: 'row' | 'column'
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch'
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
  gap?: keyof typeof theme.spacing
  wrap?: boolean
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'stretch' }) => align};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  gap: ${({ gap = 'md' }) => theme.spacing[gap]};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};
`

export const StyledGrid = styled.div<{
  columns?: number | string
  gap?: keyof typeof theme.spacing
  align?: 'start' | 'end' | 'center' | 'stretch'
}>`
  display: grid;
  grid-template-columns: ${({ columns = 1 }) =>
    typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns};
  gap: ${({ gap = 'md' }) => theme.spacing[gap]};
  align-items: ${({ align = 'stretch' }) => align};
`

// ============================================================================
// Utility Components
// ============================================================================

export const StyledSpacer = styled.div<{
  size?: keyof typeof theme.spacing
}>`
  height: ${({ size = 'md' }) => theme.spacing[size]};
  width: ${({ size = 'md' }) => theme.spacing[size]};
`

export const StyledDivider = styled.hr`
  border: none;
  border-top: ${theme.borderWidth.thin} solid ${theme.colors.border.default};
  margin: ${theme.spacing.lg} 0;
`

// ============================================================================
// Badge/Status Components
// ============================================================================

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning'
}

export const StyledBadge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-family: ${theme.typography.fontFamily.primary};

  ${({ variant = 'primary' }) => {
    const variantMap = {
      primary: css`
        background: ${theme.colors.primary.main};
        color: ${theme.colors.primary.contrast};
      `,
      secondary: css`
        background: ${theme.colors.secondary.main};
        color: ${theme.colors.secondary.contrast};
      `,
      success: css`
        background: ${theme.colors.success.main};
        color: ${theme.colors.success.contrast};
      `,
      error: css`
        background: ${theme.colors.error.main};
        color: ${theme.colors.error.contrast};
      `,
      warning: css`
        background: ${theme.colors.warning.main};
        color: ${theme.colors.warning.contrast};
      `
    }
    return variantMap[variant]
  }}
`

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  value: number
  max: number
  completed?: boolean
  width?: string
  height?: string
}

export const StyledProgressBarContainer = styled.div<{ width?: string; height?: string }>`
  width: ${({ width = '100px' }) => width};
  height: ${({ height = '8px' }) => height};
  background: ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  position: relative;
`

export const StyledProgressBarFill = styled.div<{
  percentage: number
  completed?: boolean
}>`
  width: ${({ percentage }) => Math.min(100, percentage)}%;
  height: 100%;
  background: ${({ completed }) =>
    completed ? theme.colors.success.main : theme.colors.primary.main};
  transition: width 0.3s;
`

// ============================================================================
// Badge Components
// ============================================================================

interface RatingBadgeProps {
  bgColor: string
  borderColor: string
  textColor: string
}

export const StyledRatingBadge = styled.div<RatingBadgeProps>`
  position: absolute;
  top: ${theme.spacing.sm};
  left: ${theme.spacing.sm};
  width: 50px;
  height: 50px;
  background: ${({ bgColor }) => bgColor};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border: 2px solid ${({ borderColor }) => borderColor};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
`

export const StyledRatingBadgeText = styled.span<{ textColor: string }>`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.extrabold};
  color: ${({ textColor }) => textColor};
  font-family: ${theme.typography.fontFamily.heading};
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`

// ============================================================================
// Skill Bar Components
// ============================================================================

export const StyledSkillBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`

export const StyledSkillBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography.fontSize.sm};
`

export const StyledSkillBarTrack = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${theme.colors.border.dark};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`

export const StyledSkillBarFill = styled.div<{ percentage: number; color: string }>`
  width: ${({ percentage }) => Math.min(100, Math.max(0, percentage))}%;
  height: 100%;
  background-color: ${({ color }) => color};
  border-radius: ${theme.borderRadius.full};
  transition: width 0.3s ease;
`

// ============================================================================
// Toggle Button Components
// ============================================================================

interface ToggleButtonProps {
  active?: boolean
}

export const StyledToggleContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  background: ${theme.colors.border.default}40;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};
`

export const StyledToggleButton = styled.button<ToggleButtonProps>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${({ active }) =>
    active ? theme.colors.primary.main : theme.colors.text.secondary};
  background: ${({ active }) =>
    active ? theme.colors.background.primary : 'transparent'};
  border: 1px solid
    ${({ active }) => (active ? theme.colors.primary.main : theme.colors.border.default)};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${theme.typography.fontFamily.primary};

  &:hover:not(:disabled) {
    border-color: ${({ active }) =>
      active ? theme.colors.primary.main : theme.colors.border.hover};
  }
`

// ============================================================================
// Pagination Components
// ============================================================================

export const StyledPaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${theme.spacing.md};
  border-top: ${theme.borderWidth.default} solid ${theme.colors.border.default};
  flex-shrink: 0;
`

export const StyledPaginationButton = styled.button<{ disabled?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${({ disabled }) =>
    disabled ? theme.colors.text.secondary : theme.colors.primary.main};
  background: ${({ disabled }) =>
    disabled ? theme.colors.border.default + '40' : theme.colors.primary.main + '20'};
  border: 1px solid
    ${({ disabled }) =>
      disabled ? theme.colors.border.default : theme.colors.primary.main};
  border-radius: ${theme.borderRadius.sm};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  font-family: ${theme.typography.fontFamily.primary};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary.light};
    background: ${theme.colors.primary.main + '30'};
  }
`

// ============================================================================
// Sidebar Navigation Components
// ============================================================================

interface SidebarButtonProps {
  active?: boolean
}

export const StyledSidebarButton = styled.button<SidebarButtonProps>`
  padding: ${theme.spacing.md};
  background: ${({ active }) => (active ? theme.gradients.primary : 'transparent')};
  border: ${theme.borderWidth.default} solid
    ${({ active }) => (active ? theme.colors.primary.main : theme.colors.border.default)};
  border-radius: ${theme.borderRadius.lg};
  color: ${({ active }) =>
    active ? theme.colors.neutral.white : theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${({ active }) =>
    active ? theme.typography.fontWeight.bold : theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    border-color: ${({ active }) =>
      active ? theme.colors.primary.main : theme.colors.border.hover};
  }
`
