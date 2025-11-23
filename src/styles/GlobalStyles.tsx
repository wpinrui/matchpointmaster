/**
 * Global Styles
 * Applies global CSS styles using Emotion
 */

import { Global, css } from '@emotion/react'
import { theme } from '../theme/theme'

export const GlobalStyles = () => (
  <Global
    styles={css`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        font-family: ${theme.typography.fontFamily.primary};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
        background: ${theme.colors.background.primary};
        color: ${theme.colors.text.primary};
      }

      /* Dropdown styling */
      select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }

      select::-ms-expand {
        display: none;
      }

      /* Style dropdown options - Dark theme */
      select option {
        padding: 12px 16px;
        background: ${theme.colors.background.secondary};
        color: ${theme.colors.text.primary};
        border: none;
        margin: 2px 0;
      }

      select option:hover,
      select option:focus {
        background: ${theme.colors.background.nested};
      }

      select option:checked {
        background: ${theme.colors.primary.main};
        color: white;
        font-weight: ${theme.typography.fontWeight.semibold};
      }

      /* Custom scrollbar - Dark theme */
      ::-webkit-scrollbar {
        width: 10px;
      }

      ::-webkit-scrollbar-track {
        background: ${theme.colors.background.primary};
        border-radius: 10px;
      }

      ::-webkit-scrollbar-thumb {
        background: ${theme.colors.border.default};
        border-radius: 10px;
        border: 1px solid ${theme.colors.border.dark};
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.colors.border.hover};
      }

      /* Image picker modal styling */
      .image-picker-modal-content {
        border-radius: ${theme.borderRadius.lg} !important;
        overflow: hidden;
        border: ${theme.borderWidth.default} solid ${theme.colors.border.default} !important;
        background: transparent !important;
      }

      .image-picker-modal-content .modal-content {
        border-radius: ${theme.borderRadius.lg} !important;
        overflow: hidden;
        border: none !important;
        background: transparent !important;
      }

      .image-picker-modal-content .modal-body {
        background: ${theme.colors.background.primary} !important;
      }

      .image-picker-modal-content .modal-footer {
        background: ${theme.colors.background.primary} !important;
      }
    `}
  />
)
