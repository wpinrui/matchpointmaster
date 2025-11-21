export enum Screens {
  LOAD = 'LOAD',
  NEW_GAME = 'NEW_GAME',
  HOME = 'HOME',
  PLAYERS = 'PLAYERS',
  SAVE_MANAGER = 'SAVE_MANAGER',
  DRAFT = 'DRAFT',
  TEAM_OVERVIEW = 'TEAM_OVERVIEW',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  EMAIL = 'EMAIL'
}

export type ScreenProps = {
  changeScreen: (screen: Screens) => void
}
