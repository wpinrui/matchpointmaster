export enum Screens {
  LOAD = 'LOAD',
  NEW_GAME = 'NEW_GAME'
}

export type ScreenProps = {
  changeScreen: (screen: Screens) => void
}
