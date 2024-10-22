const playStyleDescriptions: Record<string, string> = {
  'Forehand Attacker':
    'Focuses on using forehand attacks whenever possible to dominate rallies.',
  Chopper: 'Chops almost every ball, aiming to induce mistakes from opponents.',
  'Placement Strategist':
    'Utilizes precise ball placement to control the game and exploit weaknesses.',
  'Varied Player':
    'Mixes up shots and tactics to keep opponents off balance and guessing.',
  'Backhand Smasher':
    'Specializes in powerful backhand shots, often finishing points quickly.',
  'All-Rounder':
    'Adapts to various situations, balancing offense and defense effectively.',
  'Counter-Driver':
    'Counters opponents’ shots with aggressive drives, taking advantage of openings.',
  'Defensive Specialist':
    'Focuses on strong defensive play, wearing down opponents with consistency.',
  'Spin Manipulator':
    'Generates a high level of spin to control the pace and direction of the ball.',
  'Aggressive Pusher':
    'Uses pushes to control the game while waiting for opportunities to attack.',
  Lobber:
    'Employs high lobs to push opponents back, setting up for aggressive follow-up shots.',
  'Net Player':
    'Maintains a position close to the net, relying on quick reflexes and volleys.'
}

const rubberDescriptions: Record<string, string> = {
  'Spin Rubber': 'A rubber designed to generate a high amount of spin on the ball.',
  'Antispin Rubber':
    'Reduces spin on the ball, making it harder for opponents to control.',
  'Short Pimple': 'Provides a balance between spin and control, effective for attacking.',
  'Medium Pimple': 'Offers moderate spin and control, suitable for varied styles.',
  'Long Pimple': "Disrupts the opponent's rhythm with unpredictable returns.",
  Wood: 'Traditional wood blades, offering a classic feel and control.'
}

const favoursDescriptions: Record<string, string> = {
  'Heavily Forehand': 'Emphasizes strong forehand shots over backhand.',
  'Slightly Forehand': 'A balance leaning slightly towards forehand shots.',
  Balanced: 'Equal emphasis on forehand and backhand shots.',
  'Slightly Backhand': 'A balance leaning slightly towards backhand shots.',
  'Heavily Backhand': 'Focuses on strong backhand shots over forehand.'
}

const gripDescriptions: Record<string, string> = {
  'Shake Hand': 'The most common grip, allowing for versatile play.',
  Penhold: 'A grip that allows for quick wrist movements and spin.',
  Unconventional: 'Non-traditional grips that can confuse opponents.'
}

const handednessDescriptions: Record<string, string> = {
  Right: 'Being right-handed is generally better for coaching.',
  Left: 'Left-handed players have an advantage in singles and pair well with right-handed players in doubles.'
}

export const newGameTextRecords = {
  playStyleDescriptions,
  rubberDescriptions,
  favoursDescriptions,
  gripDescriptions,
  handednessDescriptions
}
