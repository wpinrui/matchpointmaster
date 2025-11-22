/**
 * Random player generation utilities
 */
import {
  Player,
  PlayerSkills,
  Gender,
  Handedness,
  GripStyle,
  RubberType,
  FavourStyle,
  PlayStyle
} from '../services/savegame/types'
import { generateRandomFace } from './faceGeneration'

/**
 * Get the full display name for a player
 * Chinese names: lastName (surname) comes first
 * Other names: firstName comes first
 */
export function getPlayerFullName(player: Player): string {
  // Handle backward compatibility: if isChinese is undefined, assume false
  const isChinese = player.isChinese ?? false
  return isChinese
    ? `${player.lastName} ${player.firstName}`
    : `${player.firstName} ${player.lastName}`
}

/**
 * Intake quality affects the skill level of generated players
 */
export enum IntakeQuality {
  POOR = 'poor', // Brand new players, very low skills
  BELOW_AVERAGE = 'below_average', // Below average skills
  AVERAGE = 'average', // Average school-level players
  ABOVE_AVERAGE = 'above_average', // Above average players
  EXCELLENT = 'excellent' // High-quality players
}

/**
 * Generate a random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random number between min and max (inclusive, can be decimal)
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generate a random value from an array
 */
function randomFromArray<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)]
}

/**
 * Generate random player skills based on intake quality and gender
 */
function generateSkills(quality: IntakeQuality, gender: Gender): PlayerSkills {
  // Base skill ranges by quality
  // Bad schools should have attributes close to 0
  const qualityRanges: Record<IntakeQuality, { min: number; max: number }> = {
    [IntakeQuality.POOR]: { min: 0, max: 25 }, // Very low for bad schools
    [IntakeQuality.BELOW_AVERAGE]: { min: 15, max: 45 },
    [IntakeQuality.AVERAGE]: { min: 35, max: 65 },
    [IntakeQuality.ABOVE_AVERAGE]: { min: 55, max: 80 },
    [IntakeQuality.EXCELLENT]: { min: 70, max: 95 }
  }

  const range = qualityRanges[quality]

  // Generate base skills
  const baseForehand = randomFloat(range.min, range.max)
  const baseBackhand = randomFloat(range.min, range.max)
  const baseFootwork = randomFloat(range.min, range.max)

  // Gender adjustments: males have higher median footwork
  const footworkAdjustment =
    gender === Gender.MALE ? randomFloat(0, 10) : randomFloat(-5, 5)
  const footwork = Math.min(100, Math.max(0, baseFootwork + footworkAdjustment))

  // Some skills correlate with others (e.g., good forehand players might have better spin)
  const spin = randomFloat(range.min, range.max) + (baseForehand - 50) * 0.2
  const placement = randomFloat(range.min, range.max) + (baseForehand - 50) * 0.15

  return {
    forehand: Math.min(100, Math.max(0, Math.round(baseForehand))),
    backhand: Math.min(100, Math.max(0, Math.round(baseBackhand))),
    footwork: Math.min(100, Math.max(0, Math.round(footwork))),
    serve: Math.min(100, Math.max(0, Math.round(randomFloat(range.min, range.max)))),
    receive: Math.min(100, Math.max(0, Math.round(randomFloat(range.min, range.max)))),
    spin: Math.min(100, Math.max(0, Math.round(spin))),
    placement: Math.min(100, Math.max(0, Math.round(placement))),
    consistency: Math.min(100, Math.max(0, Math.round(randomFloat(range.min, range.max))))
  }
}

/**
 * Calculate ELO - all new players start at 1500
 * (ELO will change as they play matches)
 */
function calculateElo(_skills: PlayerSkills): number {
  // All new players start at 1500 ELO
  // This will be adjusted as they play matches
  return 1500
}

/**
 * Racial distribution for Singapore
 */
const RACIAL_DISTRIBUTION = {
  'Singapore (Chinese)': 0.759,
  'Singapore (Malay)': 0.15,
  'Singapore (Indian)': 0.075,
  Other: 0.016
} as const

type RacialCategory = keyof typeof RACIAL_DISTRIBUTION

/**
 * Select a racial category based on distribution
 */
function selectRacialCategory(): RacialCategory {
  const rand = Math.random()
  let cumulative = 0

  for (const [category, probability] of Object.entries(RACIAL_DISTRIBUTION)) {
    cumulative += probability
    if (rand <= cumulative) {
      return category as RacialCategory
    }
  }

  return 'Other' // Fallback
}

/**
 * Chinese name lists
 */
const CHINESE_LAST_NAMES = [
  'Ang',
  'Chan',
  'Chee',
  'Chew',
  'Chin',
  'Chong',
  'Chua',
  'Deng',
  'Fang',
  'Fong',
  'Foo',
  'Fu',
  'Gan',
  'Goh',
  'Guan',
  'Gwee',
  'Heng',
  'Ho',
  'Koh',
  'Lam',
  'Lau',
  'Lee',
  'Leow',
  'Li',
  'Liao',
  'Lim',
  'Lin',
  'Liu',
  'Loh',
  'Lo',
  'Low',
  'Neo',
  'Ng',
  'Ong',
  'Pang',
  'Peh',
  'Quek',
  'Seah',
  'Sim',
  'Soh',
  'Soo',
  'Soon',
  'Tan',
  'Tay',
  'Teo',
  'Tham',
  'Teng',
  'Tin',
  'Wang',
  'Wong',
  'Yap',
  'Yeo',
  'Yong',
  'Zhang',
  'Zheng',
  'Zhou'
]

const CHINESE_BOYS_NAMES = [
  'An Chen',
  'An Hao',
  'An Liang',
  'An Ming',
  'An Wei',
  'An Yu',
  'Bo An',
  'Bo Chen',
  'Bo Hao',
  'Bo Qiang',
  'Bo Sheng',
  'Bo Xuan',
  'Bo Yu',
  'Bo Yun',
  'Chen An',
  'Chen Da',
  'Chen Dong',
  'Chen Fei',
  'Chen Hao',
  'Chen Jun',
  'Chen Lin',
  'Chen Long',
  'Chen Wei',
  'Chen Yong',
  'Chen Zhong',
  'De Hao',
  'De Liang',
  'De Ming',
  'De Sheng',
  'De Wei',
  'De Yang',
  'Dong An',
  'Dong Jian',
  'Dong Jin',
  'Dong Jun',
  'Dong Lin',
  'Dong Ping',
  'Dong Sheng',
  'Dong Wen',
  'Dong Yang',
  'Hao Chen',
  'Hao Jin',
  'Hao Jun',
  'Hao Lei',
  'Hao Liang',
  'Hao Lin',
  'Hao Long',
  'Hao Ming',
  'Hao Rong',
  'Hao Sheng',
  'Hao Wei',
  'Hao Wen',
  'Hao Xuan',
  'Hao Yang',
  'Hao Yong',
  'Hao Zhe',
  'Jian An',
  'Jian Chen',
  'Jian Da',
  'Jian Kai',
  'Jian Liang',
  'Jian Long',
  'Jian Ming',
  'Jian Rong',
  'Jian Tao',
  'Jian Wen',
  'Jian Yong',
  'Jian Zhe',
  'Jian Zhong',
  'Jin An',
  'Jin Kai',
  'Jin Liang',
  'Jin Long',
  'Jin Rong',
  'Jin Tao',
  'Jin Wen',
  'Jin Yong',
  'Jin Zhe',
  'Jun An',
  'Jun Chen',
  'Jun Da',
  'Jun Dong',
  'Jun Hao',
  'Jun Kai',
  'Jun Liang',
  'Jun Long',
  'Jun Ming',
  'Jun Peng',
  'Jun Rong',
  'Jun Wei',
  'Jun Wen',
  'Jun Yang',
  'Jun Yi',
  'Jun Yong',
  'Jun Yu',
  'Jun Zhe',
  'Jun Zhong',
  'Liang Hao',
  'Liang Kai',
  'Liang Tao',
  'Liang Yu',
  'Lin An',
  'Lin Bo',
  'Lin Da',
  'Lin Dong',
  'Lin Hao',
  'Lin Long',
  'Lin Rong',
  'Lin Sheng',
  'Lin Wei',
  'Lin Yang',
  'Lin Yong',
  'Long Hao',
  'Long Jun',
  'Long Kai',
  'Long Liang',
  'Long Sheng',
  'Long Wei',
  'Long Yi',
  'Ming An',
  'Ming Da',
  'Ming Hao',
  'Ming Jun',
  'Ming Liang',
  'Ming Long',
  'Ming Sheng',
  'Ming Wei',
  'Ming Yang',
  'Ming Yong',
  'Wei An',
  'Wei Chen',
  'Wei Da',
  'Wei De',
  'Wei Hao',
  'Wei Jun',
  'Wei Liang',
  'Wei Lin',
  'Wei Long',
  'Wei Ming',
  'Wei Sheng',
  'Wei Wen',
  'Wei Yang',
  'Wei Yong',
  'Wei Zhe',
  'Wei Zhong',
  'Wen An',
  'Wen Da',
  'Wen Dong',
  'Wen Hao',
  'Wen Jin',
  'Wen Kai',
  'Wen Liang',
  'Wen Lin',
  'Wen Ming',
  'Wen Sheng',
  'Wen Shi',
  'Wen Tao',
  'Wen Wei',
  'Wen Yi',
  'Wen Yong',
  'Wen Yu',
  'Wen Zhong',
  'Xi Hao',
  'Yang Kai',
  'Yi An',
  'Yi Jun',
  'Yi Liang',
  'Yi Long',
  'Yi Ming',
  'Yi Wen',
  'Yi Zhe',
  'Yi Zhong',
  'Yong De',
  'Yong Hao',
  'Yong Jun',
  'Yong Liang',
  'Yong Ming',
  'Yong Sheng',
  'Yong Yang',
  'Yu An',
  'Yu Bo',
  'Yu Chen',
  'Yu De',
  'Yu Hao',
  'Yu Liang',
  'Yu Long',
  'Yu Ming',
  'Yu Wei',
  'Yu Xin',
  'Yu Zhe',
  'Zhe Hao',
  'Zhe Kai',
  'Zhi Chen',
  'Zhi Hao',
  'Zhi Liang',
  'Zhi Lin',
  'Zhi Long',
  'Zhi Wen',
  'Zhi Yong',
  'Zhi Zhong',
  'Zi Chen',
  'Zi Hao',
  'Zi Long',
  'Zi Wen'
]

const CHINESE_GIRLS_NAMES = [
  'An Ning',
  'An Ping',
  'An Qi',
  'An Ting',
  'An Tong',
  'An Yi',
  'An Ying',
  'An Yun',
  'Chun En',
  'Chun Hui',
  'Chun Ling',
  'Chun Mei',
  'Chun Min',
  'Chun Ning',
  'Chun Ping',
  'Chun Qing',
  'Chun Rong',
  'Chun Rou',
  'Chun Ting',
  'Chun Tong',
  'Chun Xiao',
  'Chun Yan',
  'Chun Ye',
  'Chun Yi',
  'Chun Yin',
  'Chun Ying',
  'Chun Yun',
  'Dan Ni',
  'Dan Ning',
  'Dan Qi',
  'Dan Yi',
  'En Hui',
  'En Ling',
  'En Min',
  'En Ning',
  'En Ping',
  'En Qi',
  'En Qing',
  'En Rou',
  'En Ting',
  'En Xuan',
  'En Yi',
  'Hui En',
  'Hui Hui',
  'Hui Jun',
  'Hui Ling',
  'Hui Min',
  'Hui Ning',
  'Hui Ping',
  'Hui Qi',
  'Hui Qing',
  'Hui Ru',
  'Hui Ting',
  'Hui Tong',
  'Hui Xin',
  'Hui Xuan',
  'Hui Yi',
  'Hui Ying',
  'Hui Yun',
  'Hui Zhen',
  'Jia Qi',
  'Jia Ying',
  'Jia Ting',
  'Jia Xuan',
  'Jia Rou',
  'Jia Hui',
  'Jia En',
  'Jia Jun',
  'Jia Min',
  'Jia Ning',
  'Jia Rong',
  'Jia Yi',
  'Jia Xin',
  'Jia Tong',
  'Jie Qi',
  'Jie Xi',
  'Jie Hui',
  'Jie Yi',
  'Jing Ting',
  'Jing Xuan',
  'Jing En',
  'Jing Ning',
  'Jing Yi',
  'Lan Yi',
  'Li Ling',
  'Li Mei',
  'Li Ning',
  'Li Ping',
  'Li Rong',
  'Li Ting',
  'Li Tong',
  'Li Xuan',
  'Mei Jun',
  'Mei Ling',
  'Mei Qi',
  'Mei Ting',
  'Mei Yi',
  'Mei Ying',
  'Mei Zhen',
  'Min En',
  'Min Hui',
  'Min Min',
  'Min Rou',
  'Min Yan',
  'Min Yi',
  'Min Ying',
  'Min Zhen',
  'Pei En',
  'Pei Jun',
  'Pei Ling',
  'Pei Min',
  'Pei Ning',
  'Pei Pei',
  'Pei Qi',
  'Pei Qing',
  'Pei Rong',
  'Pei Rou',
  'Pei Ting',
  'Pei Tong',
  'Pei Xin',
  'Pei Xuan',
  'Pei Yi',
  'Pei Ying',
  'Pei Zhen',
  'Qian Hui',
  'Qian Pei',
  'Qian Qing',
  'Qian Ting',
  'Qian Yi',
  'Qian Yin',
  'Qian Ying',
  'Qiu En',
  'Qiu Hui',
  'Chu Ling',
  'Qiu Ning',
  'Qiu Ping',
  'Qiu Qing',
  'Qiu Ting',
  'Qiu Yi',
  'Qiu Yin',
  'Qiu Ying',
  'Rui En',
  'Rui Ling',
  'Rui Min',
  'Rui Ning',
  'Rui Ping',
  'Rui Qi',
  'Rui Rou',
  'Rui Ting',
  'Rui Tong',
  'Rui Xin',
  'Rui Xuan',
  'Rui Yi',
  'Rui Yin',
  'Rui Ying',
  'Rui Yun',
  'Rui Zhen',
  'Ruo En',
  'Ruo Jun',
  'Ruo Ling',
  'Ruo Min',
  'Ruo Ning',
  'Ruo Ping',
  'Ruo Qing',
  'Ruo Ting',
  'Ruo Tong',
  'Ruo Xin',
  'Ruo Xuan',
  'Ruo Yan',
  'Ruo Yi',
  'Ruo Yin',
  'Ruo Ying',
  'Ruo Yun',
  'Shan Hui',
  'Shan Ling',
  'Shan Mei',
  'Shan Min',
  'Shan Ni',
  'Shan Ning',
  'Shan Ping',
  'Shan Qi',
  'Shan Qing',
  'Shan Rong',
  'Shan Rou',
  'Shan Ting',
  'Shan Tong',
  'Shan Yan',
  'Shan Yi',
  'Shan Yin',
  'Shan Ying',
  'Shan Yun',
  'Si En',
  'Si Hui',
  'Si Ling',
  'Si Min',
  'Si Ning',
  'Si Ping',
  'Si Qi',
  'Si Qing',
  'Si Rou',
  'Si Ting',
  'Si Tong',
  'Si Yan',
  'Si Yi',
  'Si Ying',
  'Si Yun',
  'Wan En',
  'Wan Hui',
  'Wan Jun',
  'Wan Ling',
  'Wan Ni',
  'Wan Qi',
  'Wan Qing',
  'Wan Rong',
  'Wan Rou',
  'Wan Ting',
  'Wan Tong',
  'Wan Yi',
  'Wan Yin',
  'Wan Ying',
  'Wan Zhen',
  'Wei Qi',
  'Wei Qian',
  'Wei Ting',
  'Wei Yi',
  'Wen En',
  'Wen Hui',
  'Wen Jun',
  'Wen Min',
  'Wen Qi',
  'Wen Qing',
  'Wen Ting',
  'Wen Xing',
  'Wen Xin',
  'Wen Xuan',
  'Xiao Ping',
  'Xiao Rong',
  'Xiao Rou',
  'Xiao Ting',
  'Xiao Tong',
  'Xiao Yi',
  'Xin Hui',
  'Xin Qi',
  'Xin Rong',
  'Xin Rou',
  'Xin Tong',
  'Xin Yan',
  'Xin Ye',
  'Xin Yi',
  'Xin Yin',
  'Xin Ying',
  'Xin Yun',
  'Xing Hui',
  'Xing Qi',
  'Xing Rong',
  'Xing Rou',
  'Xing Tong',
  'Xing Yan',
  'Xing Yi',
  'Xing Yin',
  'Xing Ying',
  'Xing Yun',
  'Xue Ling',
  'Xue Ning',
  'Xue Ping',
  'Xue Qi',
  'Xue Ting',
  'Xue Xin',
  'Xue Yi',
  'Xue Ying',
  'Yan Jun',
  'Yan Ling',
  'Yan Ning',
  'Yan Ping',
  'Yan Qing',
  'Yan Ting',
  'Yan Tong',
  'Yan Yi',
  'Yan Ying',
  'Yan Yun',
  'Yao Xing',
  'Yao Xin',
  'Yao Xuan',
  'Yao Yan',
  'Yao Yi',
  'Yao Yin',
  'Yao Ying',
  'Yao Yun',
  'Ying Hui',
  'Ying Ping',
  'Ying Ting',
  'Ying Xuan',
  'Yong Hui',
  'Yong Xin',
  'Yong Xuan',
  'Yong Yin',
  'Yong Ying',
  'Yong Yun',
  'Yu En',
  'Yu Hui',
  'Yu Ling',
  'Yu Ning',
  'Yu Ping',
  'Yu Qi',
  'Yu Qian',
  'Yu Qing',
  'Yu Rong',
  'Yu Rou',
  'Yu Ting',
  'Yu Tong',
  'Yu Xin',
  'Yu Xuan',
  'Yu Yan',
  'Yu Yi',
  'Yu Yin',
  'Yu Ying',
  'Yu Yun',
  'Yue Ling',
  'Yue Ning',
  'Yue Ping',
  'Yue Ting',
  'Yue Xin',
  'Yue Xuan',
  'Zhi Jun',
  'Zhi Qi',
  'Zhi Ting',
  'Zhi Xin',
  'Zhi Xuan',
  'Zhi Yi',
  'Zhi Yin',
  'Zhi Ying',
  'Zhi Yun',
  'Zi Jun',
  'Zi Qi',
  'Zi Ting',
  'Zi Xin',
  'Zi Xuan',
  'Zi Yi',
  'Zi Yin',
  'Zi Ying',
  'Zi Yun'
]

const CHINESE_CHRISTIAN_BOYS_NAMES = [
  'Aaron',
  'Adam',
  'Adrian',
  'Alan',
  'Albert',
  'Alex',
  'Alexander',
  'Alfred',
  'Andrew',
  'Anthony',
  'Arthur',
  'Austin',
  'Benjamin',
  'Blake',
  'Brandon',
  'Brian',
  'Caleb',
  'Calvin',
  'Charles',
  'Christian',
  'Christopher',
  'Colin',
  'Connor',
  'Daniel',
  'David',
  'Dennis',
  'Derek',
  'Dominic',
  'Donald',
  'Douglas',
  'Dylan',
  'Edward',
  'Elijah',
  'Elliot',
  'Eric',
  'Ethan',
  'Felix',
  'Francis',
  'Frank',
  'Gabriel',
  'Gavin',
  'George',
  'Gregory',
  'Harvey',
  'Henry',
  'Hugh',
  'Isaac',
  'Ian',
  'Isaiah',
  'Jack',
  'Jacob',
  'James',
  'Jason',
  'Jeremy',
  'John',
  'Jonathan',
  'Jordan',
  'Joseph',
  'Joshua',
  'Julian',
  'Justin',
  'Keith',
  'Kevin',
  'Kyle',
  'Leo',
  'Leonard',
  'Liam',
  'Louis',
  'Lucas',
  'Luke',
  'Marcus',
  'Mark',
  'Matthew',
  'Michael',
  'Nathan',
  'Nicholas',
  'Noah',
  'Oliver',
  'Oscar',
  'Patrick',
  'Paul',
  'Peter',
  'Philip',
  'Raymond',
  'Richard',
  'Robert',
  'Ryan',
  'Samuel',
  'Scott',
  'Sean',
  'Simon',
  'Stephen',
  'Steven',
  'Theodore',
  'Thomas',
  'Timothy',
  'Victor',
  'Vincent',
  'William',
  'Wesley',
  'Xavier',
  'Zachary',
  'Zane'
]

const CHINESE_CHRISTIAN_GIRLS_NAMES = [
  'Adeline',
  'Aisyah',
  'Alicia',
  'Alissa',
  'Amanda',
  'Amy',
  'Anna',
  'Anya',
  'Aria',
  'Ashley',
  'Belinda',
  'Bernice',
  'Caitlyn',
  'Candice',
  'Cassandra',
  'Celeste',
  'Charmaine',
  'Cheryl',
  'Chloe',
  'Claire',
  'Clara',
  'Cindy',
  'Cynthia',
  'Danielle',
  'Dawn',
  'Diana',
  'Eileen',
  'Elena',
  'Ella',
  'Elyse',
  'Elizabeth',
  'Emily',
  'Emmalina',
  'Erica',
  'Evelyn',
  'Faith',
  'Felicia',
  'Fiona',
  'Genevieve',
  'Gillian',
  'Glenda',
  'Grace',
  'Gwen',
  'Gwendolyn',
  'Hannah',
  'Hazel',
  'Isabel',
  'Isabella',
  'Isabelle',
  'Irene',
  'Jacqueline',
  'Jamie',
  'Jane',
  'Janice',
  'Jean',
  'Jennie',
  'Jenny',
  'Jessica',
  'Jessie',
  'Joanne',
  'Jocelyn',
  'Joey',
  'Jasmine',
  'Julia',
  'Kaitlyn',
  'Karen',
  'Katherine',
  'Kaylah',
  'Kaylyn',
  'Kelly',
  'Kimberly',
  'Lauren',
  'Leia',
  'Lexi',
  'Lexie',
  'Lily',
  'Linda',
  'Luna',
  'Lynn',
  'Madeline',
  'Madelyn',
  'Mandy',
  'Meghan',
  'Megan',
  'Melissa',
  'Michelle',
  'Mia',
  'Mirah',
  'Natalie',
  'Natasha',
  'Nicole',
  'Noelle',
  'Olivia',
  'Phoebe',
  'Priscilla',
  'Rachel',
  'Rebecca',
  'Regina',
  'Renee',
  'Samantha',
  'Sarah',
  'Serene',
  'Shanon',
  'Sharon',
  'Sherlyn',
  'Shelia',
  'Sheila',
  'Shermaine',
  'Skye',
  'Sophie',
  'Sophia',
  'Stephanie',
  'Tania',
  'Tiffany',
  'Tricia',
  'Trina',
  'Valarie',
  'Valerie',
  'Vanessa',
  'Vera',
  'Veronica',
  'Victoria',
  'Vicky',
  'Vikki',
  'Vivian',
  'Wendy',
  'Whitney',
  'Yvonne',
  'Zara',
  'Zoe'
]

/**
 * Malay name lists
 */
const MALAY_BOYS_NAMES = [
  'Adam',
  'Ahmad',
  'Aiman',
  'Ammar',
  'Amir',
  'Arif',
  'Azlan',
  'Badrul',
  'Daniel',
  'Danish',
  'Farhan',
  'Faiz',
  'Faris',
  'Firdaus',
  'Hafiz',
  'Hakim',
  'Haris',
  'Harith',
  'Haziq',
  'Irfan',
  'Iskandar',
  'Jamal',
  'Khalid',
  'Luqman',
  'Muhammad',
  'Nashit',
  'Nazim',
  'Naufal',
  'Qayyum',
  'Rafiq',
  'Rashid',
  'Rayyan',
  'Saif',
  'Syafiq',
  'Syahir',
  'Taufiq',
  'Usman',
  'Yahya',
  'Yasir',
  'Zaki',
  'Zulfiqar',
  'Aiman Hakim',
  'Amirul Hakim',
  'Muhammad Amir',
  'Ahmad Faris',
  'Syafiq Harith',
  'Daniel Amir',
  'Faris Azlan',
  'Rafiq Hakim',
  'Azlan Syahir',
  'Irfan Amir',
  'Taufiq Haziq',
  'Rayyan Firdaus'
]

const MALAY_GIRLS_NAMES = [
  'Adilah',
  'Aisyah',
  'Amira',
  'Atiqah',
  'Diyanah',
  'Ellysha',
  'Fazilah',
  'Hannah',
  'Nadia',
  'Diyana',
  'Ellya',
  'Erin',
  'Farah',
  'Fatin',
  'Fazira',
  'Hanis',
  'Hidayah',
  'Humaira',
  'Insyirah',
  'Jasmin',
  'Julia',
  'Khalisah',
  'Khairunnisa',
  'Liyana',
  'Maisarah',
  'Mariam',
  'Nadira',
  'Nur Aisyah',
  'Nur Amira',
  'Nur Hidayah',
  'Nur Imani',
  'Nur Syafiqah',
  'Nur Syahirah',
  'Qistina',
  'Raihan',
  'Rania',
  'Sakinah',
  'Siti Aisyah',
  'Siti Fatimah',
  'Siti Nurbaya',
  'Sofia',
  'Sofiya',
  'Syafiqah',
  'Syahirah',
  'Tasya',
  'Wani',
  'Yasmin',
  'Zabrina',
  'Zarina',
  'Umairah',
  'Shareefah',
  'Nur Umairah',
  'Afiqah',
  'Nur Afiqah',
  'Nurul Afiqah',
  'Siti Umairah',
  'Hazirah'
]

const MALAY_BOYS_LAST_NAMES = [
  'Bin Abdullah',
  'Bin Ali',
  'Bin Omar',
  'Bin Ismail',
  'Bin Salleh',
  'Bin Hassan',
  'Bin Ahmad',
  'Bin Mohamed',
  'Bin Yusuf',
  'Bin Ramli',
  'Bin Zainal',
  'Bin Khalid',
  'Bin Razak',
  'Bin Latif',
  'Bin Saad',
  'Bin Hashim',
  'Bin Mahmud',
  'Bin Halim',
  'Bin Nasir'
]

const MALAY_GIRLS_LAST_NAMES = [
  'Binte Abdullah',
  'Binte Ali',
  'Binte Omar',
  'Binte Ismail',
  'Binte Salleh',
  'Binte Hassan',
  'Binte Ahmad',
  'Binte Mohamed',
  'Binte Yusuf',
  'Binte Ramli',
  'Binte Zainal',
  'Binte Khalid',
  'Binte Razak',
  'Binte Latif',
  'Binte Saad',
  'Binte Hashim',
  'Binte Mahmud',
  'Binte Halim',
  'Binte Nasir'
]

/**
 * Indian name lists
 */
const INDIAN_BOYS_NAMES = [
  'Aarav',
  'Abhinav',
  'Aditya',
  'Ajay',
  'Akash',
  'Arjun',
  'Arvind',
  'Ashwin',
  'Bhaskar',
  'Chaitanya',
  'Dinesh',
  'Ganesh',
  'Girish',
  'Harish',
  'Ishaan',
  'Karthik',
  'Krishna',
  'Lakshman',
  'Manish',
  'Nikhil',
  'Pranav',
  'Rajesh',
  'Rajan',
  'Ravi',
  'Sandeep',
  'Sanjay',
  'Sathish',
  'Shankar',
  'Siddharth',
  'Srinivas',
  'Surya',
  'Tarun',
  'Vikram',
  'Vishal',
  'Yash',
  'Rahul',
  'Rohit',
  'Anand',
  'Aravind',
  'Raghav',
  'Kiran',
  'Deepak',
  'Manoj',
  'Vivek',
  'Ramesh',
  'Hari',
  'Suresh',
  'Pradeep',
  'Naveen',
  'Mahesh'
]

const INDIAN_GIRLS_NAMES = [
  'Aarthi',
  'Aishwarya',
  'Anjali',
  'Anitha',
  'Bhavani',
  'Chandrika',
  'Deepa',
  'Divya',
  'DivyaLakshmi',
  'Eshwari',
  'Gayathri',
  'Geetha',
  'Hema',
  'Indira',
  'Kavitha',
  'Lakshmi',
  'Lavanya',
  'Ritika',
  'Ashari',
  'Meena',
  'Nalini',
  'Nithya',
  'Pavithra',
  'Pooja',
  'Priya',
  'Rajeswari',
  'Renuka',
  'Revathi',
  'Rupa',
  'Sangeetha',
  'Shanthi',
  'Sharvani',
  'Preethi',
  'Suhana',
  'Sushmita',
  'Uma',
  'Vaishnavi',
  'Vani',
  'Vidhya',
  'Yamini',
  'Rathika',
  'Sandhya'
]

const INDIAN_BOYS_LAST_NAMES = [
  's/o Rajan',
  's/o Muthiah',
  's/o Krishnan',
  's/o Arumugam',
  's/o Subramaniam',
  's/o Ramasamy',
  's/o Gopal',
  's/o Venkatesh',
  's/o Narayanasamy',
  's/o Ravi',
  'Sharma',
  'Kaur',
  'Rani',
  'Devi',
  'Patel',
  'Joshi',
  'Verma',
  'Malhotra',
  'Chopra',
  'Bhatia',
  'Ravi',
  'Menon',
  'Nair',
  'Pillai',
  'Naidu',
  'Iyer',
  'Iyengar',
  'Reddy',
  'Desai'
]

const INDIAN_GIRLS_LAST_NAMES = [
  'd/o Rajan',
  'd/o Muthiah',
  'd/o Krishnan',
  'd/o Arumugam',
  'd/o Subramaniam',
  'd/o Ramasamy',
  'd/o Gopal',
  'd/o Venkatesh',
  'd/o Narayanasamy',
  'd/o Ravi',
  'Sharma',
  'Kaur',
  'Rani',
  'Devi',
  'Patel',
  'Joshi',
  'Verma',
  'Malhotra',
  'Chopra',
  'Bhatia',
  'Ravi',
  'Menon',
  'Nair',
  'Pillai',
  'Naidu',
  'Iyer',
  'Iyengar',
  'Reddy',
  'Desai'
]

/**
 * Other (European-origin) name lists
 */
const OTHER_LAST_NAMES = [
  'Smith',
  'Brown',
  'Jones',
  'Taylor',
  'Wilson',
  'Moore',
  'Clark',
  'Walker',
  'Hill',
  'Scott',
  'Green',
  'Adams',
  'Baker',
  'Campbell',
  'Carter',
  'Collins',
  'Evans',
  'Foster',
  'Gray',
  'Hall',
  'Harris',
  'James',
  'Kelly',
  'Lee',
  'Martin',
  'Morris',
  'Murphy',
  'Parker',
  'Phillips',
  'Powell'
]

/**
 * Generate a random player name based on Singapore racial distribution
 */
function generateName(gender: Gender): {
  firstName: string
  lastName: string
  shortName: string
  isChinese: boolean
} {
  const category = selectRacialCategory()

  let firstName: string
  let lastName: string
  let isChinese = false

  if (category === 'Singapore (Chinese)') {
    const chineseNames = gender === Gender.MALE ? CHINESE_BOYS_NAMES : CHINESE_GIRLS_NAMES
    const christianNames =
      gender === Gender.MALE
        ? CHINESE_CHRISTIAN_BOYS_NAMES
        : CHINESE_CHRISTIAN_GIRLS_NAMES
    const surname = randomFromArray(CHINESE_LAST_NAMES)

    // Randomly choose between traditional Chinese name or Christian name
    const useTraditionalChinese = Math.random() < 0.5

    if (useTraditionalChinese) {
      // Traditional Chinese names: lastName (surname) comes first
      const givenName = randomFromArray(chineseNames)
      lastName = surname
      firstName = givenName
      isChinese = true
    } else {
      // Chinese Christian names: firstName comes first (Western order)
      const givenName = randomFromArray(christianNames)
      firstName = givenName
      lastName = surname
      isChinese = false
    }
  } else if (category === 'Singapore (Malay)') {
    const malayNames = gender === Gender.MALE ? MALAY_BOYS_NAMES : MALAY_GIRLS_NAMES
    const malayLastNames =
      gender === Gender.MALE ? MALAY_BOYS_LAST_NAMES : MALAY_GIRLS_LAST_NAMES
    firstName = randomFromArray(malayNames)
    lastName = randomFromArray(malayLastNames)
  } else if (category === 'Singapore (Indian)') {
    const indianNames = gender === Gender.MALE ? INDIAN_BOYS_NAMES : INDIAN_GIRLS_NAMES
    const indianLastNames =
      gender === Gender.MALE ? INDIAN_BOYS_LAST_NAMES : INDIAN_GIRLS_LAST_NAMES
    firstName = randomFromArray(indianNames)
    lastName = randomFromArray(indianLastNames)
  } else {
    // Other category
    const christianNames =
      gender === Gender.MALE
        ? CHINESE_CHRISTIAN_BOYS_NAMES
        : CHINESE_CHRISTIAN_GIRLS_NAMES
    firstName = randomFromArray(christianNames)
    lastName = randomFromArray(OTHER_LAST_NAMES)
  }

  // shortName is always the first name (given name)
  const shortName = firstName

  return { firstName, lastName, shortName, isChinese }
}

/**
 * Generate a random player
 */
/**
 * Calculate intake quality based on manager and school reputation
 */
export function calculateIntakeQuality(
  managerReputation: number,
  schoolReputation: number
): IntakeQuality {
  // Average the two reputations
  const avgReputation = (managerReputation + schoolReputation) / 2

  if (avgReputation >= 80) return IntakeQuality.EXCELLENT
  if (avgReputation >= 60) return IntakeQuality.ABOVE_AVERAGE
  if (avgReputation >= 40) return IntakeQuality.AVERAGE
  if (avgReputation >= 20) return IntakeQuality.BELOW_AVERAGE
  return IntakeQuality.POOR
}

export function generatePlayer(
  quality: IntakeQuality = IntakeQuality.AVERAGE,
  year: number = 1,
  genderOverride?: Gender
): Player {
  const gender = genderOverride || randomFromArray([Gender.MALE, Gender.FEMALE])
  const { firstName, lastName, shortName, isChinese } = generateName(gender)
  const skills = generateSkills(quality, gender)
  const elo = calculateElo(skills)

  // Generate avatar
  const imagePath = generateRandomFace(`${firstName}-${lastName}-${Date.now()}`, gender)

  // Determine play style based on skills
  const playStyle = determinePlayStyle(skills)

  // Determine forehand/backhand tendency
  const forehandBackhandTendency = determineForehandBackhandTendency(skills)

  return {
    id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    lastName,
    shortName,
    isChinese,
    gender,
    age: 13, // All new players are Sec 1 (age 13)
    year,
    elo: 1500, // All new players start at 1500 ELO
    skills,
    handedness: randomFromArray([Handedness.RIGHT, Handedness.LEFT]),
    gripStyle: randomFromArray([
      GripStyle.SHAKE_HAND,
      GripStyle.PENHOLD,
      GripStyle.UNCONVENTIONAL
    ]),
    forehandRubber: randomFromArray([
      RubberType.SPIN_RUBBER,
      RubberType.ANTISPIN_RUBBER,
      RubberType.SHORT_PIMPLE
    ]),
    backhandRubber: randomFromArray([
      RubberType.SPIN_RUBBER,
      RubberType.ANTISPIN_RUBBER,
      RubberType.SHORT_PIMPLE
    ]),
    forehandBackhandTendency,
    playStyle,
    imagePath,
    traits: [] // Players start with no traits, can earn them over time
  }
}

/**
 * Determine play style based on skill distribution
 */
function determinePlayStyle(skills: PlayerSkills): PlayStyle {
  const forehandDiff = skills.forehand - skills.backhand
  const attackScore = (skills.forehand + skills.backhand + skills.spin) / 3
  const defenseScore = (skills.consistency + skills.receive) / 2
  const placementScore = skills.placement

  if (forehandDiff > 20) {
    return PlayStyle.FOREHAND_ATTACKER
  }
  if (forehandDiff < -20) {
    return PlayStyle.BACKHAND_SMASHER
  }
  if (defenseScore > 75 && skills.spin < 50) {
    return PlayStyle.CHOPPER
  }
  if (placementScore > 75) {
    return PlayStyle.PLACEMENT_STRATEGIST
  }
  if (attackScore > 70 && defenseScore > 70) {
    return PlayStyle.ALL_ROUNDER
  }
  if (skills.spin > 75) {
    return PlayStyle.SPIN_MANIPULATOR
  }

  return PlayStyle.VARIED_PLAYER
}

/**
 * Determine forehand/backhand tendency based on skills
 */
function determineForehandBackhandTendency(skills: PlayerSkills): FavourStyle {
  const diff = skills.forehand - skills.backhand

  if (diff > 25) {
    return FavourStyle.HEAVILY_FOREHAND
  }
  if (diff > 10) {
    return FavourStyle.SLIGHTLY_FOREHAND
  }
  if (diff < -25) {
    return FavourStyle.HEAVILY_BACKHAND
  }
  if (diff < -10) {
    return FavourStyle.SLIGHTLY_BACKHAND
  }

  return FavourStyle.BALANCED
}

/**
 * Generate multiple players based on manager and school reputation
 */
export function generatePlayersByReputation(
  count: number,
  managerReputation: number,
  schoolReputation: number,
  startYear: number = 1
): Player[] {
  const quality = calculateIntakeQuality(managerReputation, schoolReputation)
  return Array.from({ length: count }, () => generatePlayer(quality, startYear))
}

/**
 * Generate worst possible player (for when draft pool runs out)
 */
export function generateWorstPlayer(year: number = 1, genderOverride?: Gender): Player {
  return generatePlayer(IntakeQuality.POOR, year, genderOverride)
}

/**
 * Generate multiple players (legacy function for backward compatibility)
 */
export function generatePlayers(
  count: number,
  quality: IntakeQuality = IntakeQuality.AVERAGE,
  year: number = 1
): Player[] {
  return Array.from({ length: count }, () => generatePlayer(quality, year))
}
