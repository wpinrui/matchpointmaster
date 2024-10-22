export enum Screens {
  LOAD = 'LOAD'
}

export type ScreenProps = {
  changeScreen: (screen: Screens) => void
}
