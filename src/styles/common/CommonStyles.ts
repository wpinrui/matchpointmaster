import { theme } from '../../theme/theme'

const containerStyle: React.CSSProperties = {
  backgroundImage: `url('../assets/tabletennisphoto.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  padding: theme.spacing.md
}

const blurStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.gradients.overlay,
  backdropFilter: 'blur(12px)',
  zIndex: theme.zIndex.base
}

const dialogStyle: React.CSSProperties = {
  background: theme.gradients.card,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing['2xl'],
  zIndex: theme.zIndex.modal,
  width: '90%',
  maxWidth: '800px',
  boxShadow: theme.shadows['2xl'],
  backdropFilter: 'blur(20px)',
  border: `1px solid rgba(255, 255, 255, 0.3)`,
  animation: 'fadeIn 0.5s ease-out'
}

export const CommonStyles = {
  containerStyle,
  blurStyle,
  dialogStyle
}
