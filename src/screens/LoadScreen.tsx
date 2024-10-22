import SaveIcon from '@mui/icons-material/Save'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import React, { useRef } from 'react'
import { Button } from 'react-bootstrap'
import BackgroundImage from '../assets/tabletennisphoto.jpg'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { CommonStyles } from '../styles/common/CommonStyles'

const LoadScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNewGame = () => {
    changeScreen(Screens.NEW_GAME)
  }

  const handleLoadFile = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      style={CommonStyles.containerStyle}
      className="d-flex justify-content-center align-items-center"
    >
      <img
        src={BackgroundImage}
        alt="Background image"
        className="position-absolute w-100 h-100"
      />
      <div style={CommonStyles.blurStyle} className="position-absolute w-100 h-100" />
      <div style={CommonStyles.dialogStyle} className="rounded p-4 position-relative">
        <h1>🏓Matchpoint Master: The Game</h1>
        <p className="text-muted">
          Lead your school squad to national glory as you train talented players, outsmart
          rival teams, and strategize your way to the top of the national championships.
        </p>
        <Button
          className="btn btn-primary d-flex align-items-center"
          onClick={handleLoadFile}
        >
          <SaveIcon />
          &nbsp; Load Save File
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
        </Button>
        <Button
          variant="success"
          onClick={handleNewGame}
          className="mt-2 d-flex align-items-center"
        >
          <SportsEsportsIcon />
          &nbsp; Start New Game
        </Button>
      </div>
    </div>
  )
}

export default LoadScreen
