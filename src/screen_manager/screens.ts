export enum Screens {
  LOAD = 'LOAD',
  NEW_GAME = 'NEW_GAME',
  HOME = 'HOME',
  PLAYERS = 'PLAYERS'
}

export type ScreenProps = {
  changeScreen: (screen: Screens) => void
}
