import React, { useState } from 'react'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { CommonStyles } from '../../styles/common/CommonStyles'
import ManagerForm from './ManagerForm'
import SchoolForm from './SchoolForm'

enum Step {
  Manager = 'Manager',
  School = 'School'
}

const NewGameScreen: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Manager)
  const [managerData, setManagerData] = useState({
    name: '',
    shortName: '',
    gender: '',
    profileImage: null as File | null,
    forehandRubber: '',
    backhandRubber: '',
    grip: '',
    favors: '',
    playStyle: '',
    handedness: ''
  })
  const [schoolData, setSchoolData] = useState({
    name: '',
    crest: null as File | null,
    colors: ''
  })

  const handleManagerDataChange = (key: string, value: string | File | null) => {
    setManagerData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSchoolDataChange = (key: string, value: string) => {
    setSchoolData((prev) => ({ ...prev, [key]: value }))
  }

  const handleStartGame = () => {
    // put data in context
  }

  const isManagerDataValid = (): boolean => {
    return Object.values(managerData).every((value) => value !== null && value !== '')
  }

  const handleNextStep = () => {
    if (isManagerDataValid()) {
      setStep(Step.School)
    } else {
      alert('Please fill in all fields.')
    }
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
        <h1 className="text-center">{`Create your ${step}`}</h1>
        {step === Step.Manager ? (
          <ManagerForm
            data={managerData}
            onChange={handleManagerDataChange}
            onNext={handleNextStep}
          />
        ) : (
          <SchoolForm
            data={schoolData}
            onChange={handleSchoolDataChange}
            onStartGame={handleStartGame}
            onBack={() => setStep(Step.Manager)}
          />
        )}
      </div>
    </div>
  )
}

export default NewGameScreen
