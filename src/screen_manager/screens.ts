export enum Screens {
  LOAD = 'LOAD',
  NEW_GAME = 'NEW_GAME',
  HOME = 'HOME',
  PLAYERS = 'PLAYERS',
  SAVE_MANAGER = 'SAVE_MANAGER'
}

export type ScreenProps = {
  changeScreen: (screen: Screens) => void
}
