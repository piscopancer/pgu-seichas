import { LucideDumbbell, LucideEar, LucideIcon, LucideMicVocal } from 'lucide-react-native'

export const lessonTypes = ['lecture', 'practical', 'seminar'] as const

export type LessonType = (typeof lessonTypes)[number]

export const lessonTypesInfo: Record<LessonType, { long: string; short: string; icon: LucideIcon }> = {
  practical: {
    long: 'практическое занятие',
    short: 'практ.',
    icon: LucideDumbbell,
  },
  lecture: {
    long: 'лекция',
    short: 'лекция',
    icon: LucideEar,
  },
  seminar: {
    long: 'семинар',
    short: 'сем.',
    icon: LucideMicVocal,
  },
}
