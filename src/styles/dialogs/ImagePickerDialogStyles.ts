import React from 'react'

export const imageGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '12px',
  marginTop: '20px',
  width: '100%'
}

export const imageStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'transform 0.2s'
}

