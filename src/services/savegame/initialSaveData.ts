import { initializeSeasonData } from '../../utils/gamePhases'
import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  PlayStyle,
  RubberType,
  SaveData
} from './types'

export const initialSaveData: SaveData = {
  manager: {
    fullName: '',
    shortName: '',
    gender: Gender.MALE,
    imagePath: '',
    handedness: Handedness.RIGHT,
    forehandRubber: RubberType.SPIN_RUBBER,
    backhandRubber: RubberType.SPIN_RUBBER,
    gripStyle: GripStyle.SHAKE_HAND,
    forehandBackhandTendency: FavourStyle.BALANCED,
    playStyle: PlayStyle.ALL_ROUNDER,
    stats: {
      reputation: 15, // Starting reputation (low, new manager)
      coachingEffectiveness: 15 // Starting coaching effectiveness (low, new manager)
    }
  },
  school: {
    name: '',
    crestPath: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    accentColor: '#FFD23F',
    reputation: 100, // Starting reputation rank (100th place, trash school)
    funding: 100, // Starting funding rank (100th place, trash school)
    reputationHistory: [], // Will be populated as seasons progress
    fundingHistory: [], // Will be populated as seasons progress
    teamType: 'both' // Will be determined when game is created based on ranking
  },
  players: [], // All available players
  teamRoster: [], // Player IDs on the team
  season: initializeSeasonData(),
  draftCompleted: false,
  emails: [], // Emails will be generated when game is created with actual names
  trainingPlan: null, // Training plan will be set during training phase
  skillSnapshots: [], // Skill snapshots for progress tracking
  trainingGoals: [], // Training goals will be set by player
  aiSchools: [] // AI schools will be initialized when game starts
}
