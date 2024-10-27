import { Gender } from '../../services/savegame/types'

export type ManagerProfile = {
  name: string
  shortName: string
  gender: Gender
  profileImagePath: string | undefined
  forehandRubber: string
  backhandRubber: string
  grip: string
  favors: string
  playStyle: string
  handedness: string
}

export type SchoolProfile = {
  name: string
  crestImagePath: string
  colors: string
}
