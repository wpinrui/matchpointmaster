export type McqQuestion = {
  question: string
  options: McqOption[]
  imageUrl?: string
  correctAnswerId: number
}

export type McqOption = {
  id: number
  text: string
  selected: boolean
}

export type OpenEndedQuestion = {
  question: string
  imageUrl?: string
}
