// src/styles/screens/LoadScreenStyles.ts
const containerStyle: React.CSSProperties = {
  backgroundImage: `url('../assets/tabletennisphoto.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
}

const blurStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backdropFilter: 'blur(8px)',
  zIndex: 1
}

const dialogStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '8px',
  padding: '20px',
  zIndex: 2,
  maxWidth: '700px',
  boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'
}

const inlineTextButtonStyle: React.CSSProperties = {
  display: 'inline-block'
}

export const LoadScreenStyles = {
  blurStyle,
  containerStyle,
  dialogStyle,
  inlineTextButtonStyle
}
