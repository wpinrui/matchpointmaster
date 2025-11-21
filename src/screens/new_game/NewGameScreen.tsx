import React, { useState } from 'react'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { initialSaveData } from '../../services/savegame/initialSaveData'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { SaveData } from '../../services/savegame/types'
import { CommonStyles } from '../../styles/common/CommonStyles'
import { theme } from '../../theme/theme'
import {
  validateManagerData,
  validateSchoolData,
  ManagerValidationErrors,
  SchoolValidationErrors
} from '../../utils/validation'
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
  const [managerErrors, setManagerErrors] = useState<ManagerValidationErrors>({})
  const [schoolErrors, setSchoolErrors] = useState<SchoolValidationErrors>({})
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
    // Clear error for this field when user starts typing
    if (managerErrors[key as keyof ManagerValidationErrors]) {
      setManagerErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key as keyof ManagerValidationErrors]
        return newErrors
      })
    }
  }

  const handleSchoolDataChange = (key: keyof SaveData['school'], value: string) => {
    setSchoolData((prev) => ({ ...prev, [key]: value }))
    // Clear error for this field when user starts typing
    if (schoolErrors[key as keyof SchoolValidationErrors]) {
      setSchoolErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key as keyof SchoolValidationErrors]
        return newErrors
      })
    }
  }

  const handleStartGame = () => {
    const validation = validateSchoolData(schoolData)
    if (validation.isValid) {
      saveSchoolStateToContext()
      changeScreen(Screens.HOME)
    } else {
      setSchoolErrors(validation.errors)
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.validation-error')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }

  const handleNextStep = () => {
    const validation = validateManagerData(managerData)
    if (validation.isValid) {
      saveManagerStateToContext()
      setManagerErrors({}) // Clear errors when moving to next step
      setStep(Step.School)
    } else {
      setManagerErrors(validation.errors)
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.validation-error')
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
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
            errors={managerErrors}
          />
        ) : (
          <SchoolForm
            data={schoolData}
            onChange={handleSchoolDataChange}
            onStartGame={handleStartGame}
            onBack={() => {
              setStep(Step.Manager)
              setSchoolErrors({}) // Clear errors when going back
            }}
            errors={schoolErrors}
          />
        )}
      </div>
    </div>
  )
}

export default NewGameScreen
