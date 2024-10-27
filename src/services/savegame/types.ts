export type SaveData = {
  manager: {
    fullName: string
    shortName: string
    gender: Gender
    imagePath: string
    handedness: Handedness
    forehandRubber: RubberType
    backhandRubber: RubberType
    gripStyle: GripStyle
    forehandBackhandTendency: FavourStyle
    playStyle: PlayStyle
  }
  school: {
    name: string
    crestPath: string
    colors: string
  }
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum PlayStyle {
  FOREHAND_ATTACKER = 'Forehand Attacker',
  CHOPPER = 'Chopper',
  PLACEMENT_STRATEGIST = 'Placement Strategist',
  VARIED_PLAYER = 'Varied Player',
  BACKHAND_SMASHER = 'Backhand Smasher',
  ALL_ROUNDER = 'All-Rounder',
  COUNTER_DRIVER = 'Counter-Driver',
  DEFENSIVE_SPECIALIST = 'Defensive Specialist',
  SPIN_MANIPULATOR = 'Spin Manipulator',
  AGGRESSIVE_PUSHER = 'Aggressive Pusher',
  LOBBER = 'Lobber',
  NET_PLAYER = 'Net Player'
}

export enum RubberType {
  SPIN_RUBBER = 'Spin Rubber',
  ANTISPIN_RUBBER = 'Antispin Rubber',
  SHORT_PIMPLE = 'Short Pimple',
  MEDIUM_PIMPLE = 'Medium Pimple',
  LONG_PIMPLE = 'Long Pimple',
  WOOD = 'Wood'
}

export enum FavourStyle {
  HEAVILY_FOREHAND = 'Heavily Forehand',
  SLIGHTLY_FOREHAND = 'Slightly Forehand',
  BALANCED = 'Balanced',
  SLIGHTLY_BACKHAND = 'Slightly Backhand',
  HEAVILY_BACKHAND = 'Heavily Backhand'
}

export enum GripStyle {
  SHAKE_HAND = 'Shake Hand',
  PENHOLD = 'Penhold',
  UNCONVENTIONAL = 'Unconventional'
}

export enum Handedness {
  RIGHT = 'Right',
  LEFT = 'Left'
}
