export enum Screens {
  LOAD = 'LOAD',
  NEW_GAME = 'NEW_GAME',
  HOME = 'HOME'
}

export type ScreenProps = {
  changeScreen: (screen: Screens) => void
}
