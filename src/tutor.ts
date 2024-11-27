import { z } from 'zod'

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

export const tutorSchema = z.object({
  name: z.string().min(1, { message: 'Имя обязательно' }),
  surname: z.string().min(1, { message: 'Фамилия обязательна' }),
  middlename: z.string().min(1, { message: 'Отчество обязательно' }),
  rank: z.enum(ranks).or(z.null()),
})
