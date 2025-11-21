import React, { useState } from 'react'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { initialSaveData } from '../../services/savegame/initialSaveData'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { SaveData } from '../../services/savegame/types'
import { CommonStyles } from '../../styles/common/CommonStyles'
import { theme } from '../../theme/theme'
import { validateManagerData, validateSchoolData } from '../../utils/validation'
import ManagerForm from './ManagerForm'
import SchoolForm from './SchoolForm'

enum Step {
  Manager = 'Manager',
  School = 'School'
}

const NewGameScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const [step, setStep] = useState<Step>(Step.Manager)
  const [managerData, setManagerData] = useState<SaveData['manager']>(
    initialSaveData.manager
  )
  const [schoolData, setSchoolData] = useState<SaveData['school']>(
    initialSaveData.school
  )
  const { updateManager, updateSchool } = useSaveDataContext()

  const saveManagerStateToContext = () => {
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

  const saveSchoolStateToContext = () => {
    updateSchool.name(schoolData.name)
    updateSchool.crestPath(schoolData.crestPath)
    updateSchool.schoolColor(schoolData.color)
  }

  const handleManagerDataChange = (
    key: keyof SaveData['manager'],
    value: string | File | null
  ) => {
    setManagerData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSchoolDataChange = (key: keyof SaveData['school'], value: string) => {
    setSchoolData((prev) => ({ ...prev, [key]: value }))
  }

  const handleStartGame = () => {
    if (validateSchoolData(schoolData)) {
      saveSchoolStateToContext()
      changeScreen(Screens.HOME)
    } else {
      alert('Please fill in all fields.')
    }
  }

  const handleNextStep = () => {
    if (validateManagerData(managerData)) {
      saveManagerStateToContext()
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
        <h1
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.extrabold,
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
            textShadow: 'none'
          }}
        >
          {`Create your ${step}`}
        </h1>
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
