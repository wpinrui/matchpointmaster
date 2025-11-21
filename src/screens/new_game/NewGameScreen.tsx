import React, { useState } from 'react'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  PlayStyle,
  RubberType,
  SaveData
} from '../../services/savegame/types'
import { CommonStyles } from '../../styles/common/CommonStyles'
import ManagerForm from './ManagerForm'
import SchoolForm from './SchoolForm'

enum Step {
  Manager = 'Manager',
  School = 'School'
}

const NewGameScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const [step, setStep] = useState<Step>(Step.Manager)
  const [managerData, setManagerData] = useState<SaveData['manager']>({
    fullName: '',
    shortName: '',
    gender: Gender.MALE,
    imagePath: '',
    handedness: Handedness.RIGHT,
    forehandRubber: RubberType.SPIN_RUBBER,
    backhandRubber: RubberType.SPIN_RUBBER,
    gripStyle: GripStyle.SHAKE_HAND,
    forehandBackhandTendency: FavourStyle.BALANCED,
    playStyle: PlayStyle.ALL_ROUNDER
  })
  const [schoolData, setSchoolData] = useState<SaveData['school']>({
    name: '',
    crestPath: '',
    color: ''
  })
  const { updateManager, updateSchool } = useSaveDataContext()

  const saveManagerStateToLocalStorage = () => {
    updateManager.fullName(managerData.fullName)
    updateManager.shortName(managerData.shortName)
    updateManager.gender(managerData.gender)
    updateManager.imagePath(managerData.imagePath)
    updateManager.handedness(managerData.handedness)
    updateManager.forehandRubber(managerData.forehandRubber)
    updateManager.backhandRubber(managerData.backhandRubber)
    updateManager.gripStyle(managerData.gripStyle)
    updateManager.forehandBackhandTendency(managerData.forehandBackhandTendency)
    updateManager.playStyle(managerData.playStyle)
  }

  const saveSchoolStateToLocalStorage = () => {
    updateSchool.name(schoolData.name)
    updateSchool.crestPath(schoolData.crestPath)
    updateSchool.schoolColor(schoolData.color)
  }

  const handleManagerDataChange = (key: string, value: string | File | null) => {
    setManagerData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSchoolDataChange = (key: string, value: string) => {
    setSchoolData((prev) => ({ ...prev, [key]: value }))
  }

  const isSchoolDataValid = (): boolean => {
    return (
      schoolData.name.trim() !== '' &&
      schoolData.crestPath !== '' &&
      schoolData.color.trim() !== ''
    )
  }

  const handleStartGame = () => {
    if (isSchoolDataValid()) {
      saveSchoolStateToLocalStorage()
      changeScreen(Screens.HOME)
    } else {
      alert('Please fill in all fields.')
    }
  }

  const isManagerDataValid = (): boolean => {
    return (
      managerData.fullName.trim() !== '' &&
      managerData.shortName.trim() !== '' &&
      managerData.imagePath !== ''
    )
  }

  const handleNextStep = () => {
    if (isManagerDataValid()) {
      saveManagerStateToLocalStorage()
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
