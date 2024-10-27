import {
  FavourStyle,
  GripStyle,
  Handedness,
  PlayStyle,
  RubberType
} from '../../services/savegame/types'

const playStyleDescriptions: Record<PlayStyle, string> = {
  [PlayStyle.FOREHAND_ATTACKER]:
    'Focuses on using forehand attacks whenever possible to dominate rallies.',
  [PlayStyle.CHOPPER]:
    'Chops almost every ball, aiming to induce mistakes from opponents.',
  [PlayStyle.PLACEMENT_STRATEGIST]:
    'Utilizes precise ball placement to control the game and exploit weaknesses.',
  [PlayStyle.VARIED_PLAYER]:
    'Mixes up shots and tactics to keep opponents off balance and guessing.',
  [PlayStyle.BACKHAND_SMASHER]:
    'Specializes in powerful backhand shots, often finishing points quickly.',
  [PlayStyle.ALL_ROUNDER]:
    'Adapts to various situations, balancing offense and defense effectively.',
  [PlayStyle.COUNTER_DRIVER]:
    "Counters opponents' shots with aggressive drives, taking advantage of openings.",
  [PlayStyle.DEFENSIVE_SPECIALIST]:
    'Focuses on strong defensive play, wearing down opponents with consistency.',
  [PlayStyle.SPIN_MANIPULATOR]:
    'Generates a high level of spin to control the pace and direction of the ball.',
  [PlayStyle.AGGRESSIVE_PUSHER]:
    'Uses pushes to control the game while waiting for opportunities to attack.',
  [PlayStyle.LOBBER]:
    'Employs high lobs to push opponents back, setting up for aggressive follow-up shots.',
  [PlayStyle.NET_PLAYER]:
    'Maintains a position close to the net, relying on quick reflexes and volleys.'
}

const rubberDescriptions: Record<RubberType, string> = {
  [RubberType.SPIN_RUBBER]:
    'A rubber designed to generate a high amount of spin on the ball.',
  [RubberType.ANTISPIN_RUBBER]:
    'Reduces spin on the ball, making it harder for opponents to control.',
  [RubberType.SHORT_PIMPLE]:
    'Provides a balance between spin and control, effective for attacking.',
  [RubberType.MEDIUM_PIMPLE]:
    'Offers moderate spin and control, suitable for varied styles.',
  [RubberType.LONG_PIMPLE]: "Disrupts the opponent's rhythm with unpredictable returns.",
  [RubberType.WOOD]: 'Traditional wood blades, offering a classic feel and control.'
}

const favoursDescriptions: Record<FavourStyle, string> = {
  [FavourStyle.HEAVILY_FOREHAND]: 'Emphasizes strong forehand shots over backhand.',
  [FavourStyle.SLIGHTLY_FOREHAND]: 'A balance leaning slightly towards forehand shots.',
  [FavourStyle.BALANCED]: 'Equal emphasis on forehand and backhand shots.',
  [FavourStyle.SLIGHTLY_BACKHAND]: 'A balance leaning slightly towards backhand shots.',
  [FavourStyle.HEAVILY_BACKHAND]: 'Focuses on strong backhand shots over forehand.'
}

const gripDescriptions: Record<GripStyle, string> = {
  [GripStyle.SHAKE_HAND]: 'The most common grip, allowing for versatile play.',
  [GripStyle.PENHOLD]: 'A grip that allows for quick wrist movements and spin.',
  [GripStyle.UNCONVENTIONAL]: 'Non-traditional grips that can confuse opponents.'
}

const handednessDescriptions: Record<Handedness, string> = {
  [Handedness.RIGHT]: 'Being right-handed is generally better for coaching.',
  [Handedness.LEFT]:
    'Left-handed players have an advantage in singles and pair well with right-handed players in doubles.'
}

export const newGameTextRecords = {
  playStyleDescriptions,
  rubberDescriptions,
  favoursDescriptions,
  gripDescriptions,
  handednessDescriptions
}
