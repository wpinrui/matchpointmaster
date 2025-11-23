import React, { useState } from 'react'
import BackgroundImage from '../../assets/tabletennisphoto.jpg'
import GameButton from '../../components/buttons/GameButton'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { initialSaveData } from '../../services/savegame/initialSaveData'
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
import { theme } from '../../theme/theme'
import { generateCrestSvg } from '../../utils/crestGenerator'
import { generateInitialEmails } from '../../utils/emailGenerator'
import { generateRandomFace } from '../../utils/faceGeneration'
import { initializeSeasonData } from '../../utils/gamePhases'
import { loadSchoolsData } from '../../utils/loadSchoolsData'
import {
  initializeAISchools,
  generateInitialAISchoolPlayers
} from '../../utils/aiSchools'
import { determineSchoolTeamType } from '../../utils/schoolTeamType'
import {
  ManagerValidationErrors,
  SchoolValidationErrors,
  validateManagerData,
  validateSchoolData
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
  const [schoolData, setSchoolData] = useState<SaveData['school']>(initialSaveData.school)
  const [managerErrors, setManagerErrors] = useState<ManagerValidationErrors>({})
  const [schoolErrors, setSchoolErrors] = useState<SchoolValidationErrors>({})
  const { updateManager, updateSchool, createNewSave } = useSaveDataContext()

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
    // Stats are initialized from initialSaveData, ensure they're saved
    if (managerData.stats) {
      updateManager.stats(managerData.stats)
    }
  }

  const saveSchoolStateToContext = () => {
    updateSchool.name(schoolData.name)
    updateSchool.crestPath(schoolData.crestPath)
    updateSchool.primaryColor(schoolData.primaryColor)
    updateSchool.secondaryColor(schoolData.secondaryColor)
    updateSchool.accentColor(schoolData.accentColor)
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

  const handleStartGame = async () => {
    const validation = validateSchoolData(schoolData)
    if (validation.isValid) {
      saveManagerStateToContext()
      saveSchoolStateToContext()
      // Create a new save slot with the school name or a default name
      const saveName = schoolData.name || `${managerData.fullName || 'New Game'}'s Save`

      // Determine team type based on school ranking
      // Don't use seed for new games - let it be truly random
      const teamType = determineSchoolTeamType(
        schoolData.reputation,
        schoolData.funding
        // No seed - use true randomization for new games
      )

      // Create save with combined data
      const combinedData: SaveData = {
        manager: managerData,
        school: {
          ...schoolData,
          teamType
        },
        players: [], // Initialize with empty players array
        teamRoster: [], // Initialize with empty team roster
        season: initializeSeasonData(),
        draftCompleted: false,
        emails: [], // Will be populated below
        trainingPlan: null,
        skillSnapshots: [],
        trainingGoals: [],
        aiSchools: [], // Will be initialized below
        roundRobinData: null
      }

      // Generate initial emails with actual names and in-game dates
      combinedData.emails = generateInitialEmails(combinedData)

      // Initialize AI schools
      const schoolsData = loadSchoolsData()
      const aiSchools = initializeAISchools(schoolsData)

      // Generate initial players for each AI school (Sec 2, 3, 4)
      aiSchools.forEach((school) => {
        const players = generateInitialAISchoolPlayers(school, schoolsData)
        school.players = players
        school.teamRoster = players.map((p) => p.id)
      })

      combinedData.aiSchools = aiSchools

      await createNewSave(saveName, combinedData)
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

  const handleDebugFill = async () => {
    // Generate default images
    const defaultManagerImage = generateRandomFace('debug-manager-default', Gender.MALE)
    const defaultSchoolCrest = generateCrestSvg(
      '#FF6B35', // primaryColor
      '#004E89', // secondaryColor
      '#FFD23F', // accentColor
      'shield', // outsideShape
      'star' // insideShape
    )

    // Fill manager with default debug values
    const debugManagerData: SaveData['manager'] = {
      fullName: 'John Smith',
      shortName: 'John',
      gender: Gender.MALE,
      imagePath: defaultManagerImage,
      handedness: Handedness.RIGHT,
      forehandRubber: RubberType.SPIN_RUBBER,
      backhandRubber: RubberType.SPIN_RUBBER,
      gripStyle: GripStyle.SHAKE_HAND,
      forehandBackhandTendency: FavourStyle.BALANCED,
      playStyle: PlayStyle.ALL_ROUNDER,
      stats: {
        reputation: 15,
        coachingEffectiveness: 15
      }
    }
    setManagerData(debugManagerData)

    // Fill school with default debug values
    // For debug, use trash school ranking to get single-gender team
    const debugReputation = 100 // Trash school
    const debugFunding = 100 // Trash school
    const debugTeamType = determineSchoolTeamType(
      debugReputation,
      debugFunding,
      'Test High School'
    )

    const debugSchoolData: SaveData['school'] = {
      name: 'Test High School',
      crestPath: defaultSchoolCrest,
      primaryColor: '#FF6B35',
      secondaryColor: '#004E89',
      accentColor: '#FFD23F',
      reputation: debugReputation,
      funding: debugFunding,
      reputationHistory: [],
      fundingHistory: [],
      teamType: debugTeamType
    }
    setSchoolData(debugSchoolData)

    // Clear any errors
    setManagerErrors({})
    setSchoolErrors({})

    // Save manager data to context
    updateManager.fullName(debugManagerData.fullName)
    updateManager.shortName(debugManagerData.shortName)
    updateManager.gender(debugManagerData.gender)
    updateManager.imagePath(debugManagerData.imagePath)
    updateManager.handedness(debugManagerData.handedness)
    updateManager.forehandRubber(debugManagerData.forehandRubber)
    updateManager.backhandRubber(debugManagerData.backhandRubber)
    updateManager.gripStyle(debugManagerData.gripStyle)
    updateManager.forehandBackhandTendency(debugManagerData.forehandBackhandTendency)
    updateManager.playStyle(debugManagerData.playStyle)
    updateManager.stats(debugManagerData.stats)

    // Save school data to context
    updateSchool.name(debugSchoolData.name)
    updateSchool.crestPath(debugSchoolData.crestPath)
    updateSchool.primaryColor(debugSchoolData.primaryColor)
    updateSchool.secondaryColor(debugSchoolData.secondaryColor)
    updateSchool.accentColor(debugSchoolData.accentColor)

    // Automatically start the game with the filled data
    const saveName = debugSchoolData.name || `${debugManagerData.fullName}'s Save`
    const combinedData: SaveData = {
      manager: debugManagerData,
      school: debugSchoolData,
      players: [],
      teamRoster: [],
      season: initializeSeasonData(),
      draftCompleted: false,
      emails: [],
      trainingPlan: null,
      skillSnapshots: [],
      trainingGoals: [],
      aiSchools: [], // Will be initialized below
      roundRobinData: null
    }

    // Generate initial emails with actual names and in-game dates
    combinedData.emails = generateInitialEmails(combinedData)

    // Initialize AI schools
    const schoolsData = loadSchoolsData()
    const aiSchools = initializeAISchools(schoolsData)

    // Generate initial players for each AI school (Sec 2, 3, 4)
    aiSchools.forEach((school) => {
      const players = generateInitialAISchoolPlayers(school, schoolsData)
      school.players = players
      school.teamRoster = players.map((p) => p.id)
    })

    combinedData.aiSchools = aiSchools

    await createNewSave(saveName, combinedData)
    changeScreen(Screens.HOME)
  }

  return (
    <div
      style={{
        ...CommonStyles.containerStyle,
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        padding: theme.spacing.lg
      }}
      className="d-flex justify-content-center align-items-center"
    >
      <img
        src={BackgroundImage}
        alt="Background image"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      />
      <div style={CommonStyles.blurStyle} />
      <div
        style={{
          ...CommonStyles.dialogStyle,
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
            flexShrink: 0
          }}
        >
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
              margin: 0,
              flex: 1,
              textShadow: 'none'
            }}
          >
            {`Create your ${step}`}
          </h1>
          <GameButton
            variant="secondary"
            size="sm"
            onClick={handleDebugFill}
            type="button"
            style={{
              marginLeft: theme.spacing.md,
              fontSize: theme.typography.fontSize.sm,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              flexShrink: 0
            }}
          >
            🐛 Debug Fill
          </GameButton>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {step === Step.Manager ? (
            <ManagerForm
              data={managerData}
              onChange={handleManagerDataChange}
              onNext={handleNextStep}
              onCancel={() => changeScreen(Screens.SAVE_MANAGER)}
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
    </div>
  )
}

export default NewGameScreen
