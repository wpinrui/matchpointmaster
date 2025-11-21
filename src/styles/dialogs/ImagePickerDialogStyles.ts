import React from 'react'

export const imageGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '10px',
  marginTop: '20px'
}

export const imageStyle: React.CSSProperties = {
  width: '100%',
  cursor: 'pointer',
  borderRadius: '8px',
  transition: 'transform 0.2s'
}

