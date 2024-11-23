export const ranks = ['assistantTutor', 'tutor', 'seniorTutor', 'assistantProfessor', 'professor'] as const

export const ranksInfo = {
  assistantTutor: {
    long: 'ассистент',
    short: 'асс.',
  },
  tutor: {
    long: 'преподаватель',
    short: 'преп.',
  },
  seniorTutor: {
    long: 'старший преподаватель',
    short: 'ст. преп.',
  },
  assistantProfessor: {
    long: 'доцент',
    short: 'доц.',
  },
  professor: {
    long: 'профессор',
    short: 'проф.',
  },
} as const satisfies Record<Rank, { long: string; short: string }>

export type Rank = (typeof ranks)[number]
