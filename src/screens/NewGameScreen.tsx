import React, { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import BackgroundImage from '../assets/tabletennisphoto.jpg'
import { CommonStyles } from '../styles/common/CommonStyles'

enum Step {
  Manager = 1,
  School = 2
}

const playStyleDescriptions: Record<string, string> = {
  aggressive:
    'An aggressive player focuses on attacking and putting pressure on the opponent.',
  defensive: 'A defensive player prioritizes returning shots and minimizing mistakes.',
  balanced:
    'A balanced player maintains a mix of both offensive and defensive strategies.',
  chopper:
    "A chopper specializes in defensive play, often using backspin to disrupt the opponent's rhythm.",
  counterAttacker:
    "A counter-attacker waits for the opponent's mistakes to capitalize on openings.",
  spinFocused:
    'A spin-focused player emphasizes spin in their shots to create opportunities.',
  firstAttack: 'A player who aims to make the first aggressive shot.',
  control: 'Focuses on precision and placement rather than power.',
  placement: 'Emphasizes placing the ball in difficult spots for the opponent.',
  heavySpin: 'Specializes in generating a lot of spin on their shots.'
}

const rubberDescriptions: Record<string, string> = {
  'Spin Rubber': 'A rubber designed to generate a high amount of spin on the ball.',
  'Antispin Rubber':
    'Reduces spin on the ball, making it harder for opponents to control.',
  'Short Pimple': 'Provides a balance between spin and control, effective for attacking.',
  'Medium Pimple': 'Offers moderate spin and control, suitable for varied styles.',
  'Long Pimple': "Disrupts the opponent's rhythm with unpredictable returns.",
  Wood: 'Traditional wood blades, offering a classic feel and control.'
}

const favoursDescriptions: Record<string, string> = {
  'Heavily Forehand': 'Emphasizes strong forehand shots over backhand.',
  'Slightly Forehand': 'A balance leaning slightly towards forehand shots.',
  Balanced: 'Equal emphasis on forehand and backhand shots.',
  'Slightly Backhand': 'A balance leaning slightly towards backhand shots.',
  'Heavily Backhand': 'Focuses on strong backhand shots over forehand.'
}

const gripDescriptions: Record<string, string> = {
  'Shake Hand': 'The most common grip, allowing for versatile play.',
  Penhold: 'A grip that allows for quick wrist movements and spin.',
  Unconventional: 'Non-traditional grips that can confuse opponents.'
}

const NewGameScreen: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Manager)
  const [managerName, setManagerName] = useState('')
  const [gender, setGender] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const [forehandRubber, setForehandRubber] = useState('')
  const [backhandRubber, setBackhandRubber] = useState('')
  const [grip, setGrip] = useState('')
  const [favors, setFavors] = useState('')
  const [playStyle, setPlayStyle] = useState('')

  const [schoolName, setSchoolName] = useState('')
  const [schoolCrest, setSchoolCrest] = useState<File | null>(null)
  const [schoolColors, setSchoolColors] = useState('')

  const [alertMessage, setAlertMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)

  const handleStartGame = () => {
    const saveData = {
      manager: {
        name: managerName,
        gender,
        profileImage,
        forehandRubber,
        backhandRubber,
        grip,
        favors,
        playStyle
      },
      school: {
        name: schoolName,
        crest: schoolCrest,
        colors: schoolColors
      }
    }

    const json = JSON.stringify(saveData)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'game_save.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleChoiceChange = (type: string, value: string) => {
    if (type === 'forehandRubber') {
      setForehandRubber(value)
      setAlertMessage(rubberDescriptions[value])
    } else if (type === 'backhandRubber') {
      setBackhandRubber(value)
      setAlertMessage(rubberDescriptions[value])
    } else if (type === 'grip') {
      setGrip(value)
      setAlertMessage(gripDescriptions[value])
    } else if (type === 'favors') {
      setFavors(value)
      setAlertMessage(favoursDescriptions[value])
    } else if (type === 'playStyle') {
      setPlayStyle(value)
      setAlertMessage(playStyleDescriptions[value])
    }
    setShowAlert(true)
  }

  const handleFileChange = (
    e: any,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files[0]
    setter(file)
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
        <h1 className="text-center">Create Your New Game</h1>
        {step === Step.Manager && (
          <div>
            <h4>Manager Information</h4>
            <Form>
              <Form.Group controlId="managerName">
                <Form.Control
                  type="text"
                  placeholder="Manager Name"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="mb-2"
                />
              </Form.Group>
              <Form.Group controlId="genderSelect">
                <Form.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mb-2"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="profileImage">
                <Form.Label>Profile Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e: any) => handleFileChange(e, setProfileImage)}
                  className="mb-2"
                />
              </Form.Group>
              <h5 className="mt-3">Preferred playing style</h5>
              {showAlert && (
                <Alert className="my-2" variant="info">
                  {alertMessage}
                </Alert>
              )}
              <Form.Group controlId="forehandRubber">
                <Form.Select
                  value={forehandRubber}
                  onChange={(e) => handleChoiceChange('forehandRubber', e.target.value)}
                  className="mb-2"
                >
                  <option disabled value="">
                    Select Forehand Rubber
                  </option>
                  {Object.keys(rubberDescriptions).map((rubber) => (
                    <option key={rubber} value={rubber}>
                      {rubber}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="backhandRubber">
                <Form.Select
                  value={backhandRubber}
                  onChange={(e) => handleChoiceChange('backhandRubber', e.target.value)}
                  className="mb-2"
                >
                  <option disabled value="">
                    Select Backhand Rubber
                  </option>
                  {Object.keys(rubberDescriptions).map((rubber) => (
                    <option key={rubber} value={rubber}>
                      {rubber}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="gripSelect">
                <Form.Select
                  value={grip}
                  onChange={(e) => handleChoiceChange('grip', e.target.value)}
                  className="mb-2"
                >
                  <option disabled value="">
                    Select Grip
                  </option>
                  {Object.keys(gripDescriptions).map((grip) => (
                    <option key={grip} value={grip}>
                      {grip}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="favorsSelect">
                <Form.Select
                  value={favors}
                  onChange={(e) => handleChoiceChange('favors', e.target.value)}
                  className="mb-2"
                >
                  <option disabled value="">
                    Select Favors
                  </option>
                  {Object.keys(favoursDescriptions).map((favour) => (
                    <option key={favour} value={favour}>
                      {favour}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="playStyleSelect">
                <Form.Select
                  value={playStyle}
                  onChange={(e) => handleChoiceChange('playStyle', e.target.value)}
                  className="mb-2"
                >
                  <option disabled value="">
                    Select Playstyle
                  </option>
                  {Object.keys(playStyleDescriptions).map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button variant="primary" onClick={() => setStep(Step.School)}>
                Next
              </Button>
            </Form>
          </div>
        )}
        {step === Step.School && (
          <div>
            <h4>School Information</h4>
            <Form>
              <Form.Group controlId="schoolName">
                <Form.Control
                  type="text"
                  placeholder="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="mb-2"
                />
              </Form.Group>
              <Form.Group controlId="schoolCrest">
                <Form.Label>School Crest</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e: any) => handleFileChange(e, setSchoolCrest)}
                  className="mb-2"
                />
              </Form.Group>
              <Form.Group controlId="schoolColors">
                <Form.Control
                  type="text"
                  placeholder="School Colors"
                  value={schoolColors}
                  onChange={(e) => setSchoolColors(e.target.value)}
                  className="mb-2"
                />
              </Form.Group>
              <Button variant="primary" onClick={handleStartGame}>
                Start Game
              </Button>
            </Form>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewGameScreen
