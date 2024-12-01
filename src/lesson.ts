import { LucideDumbbell, LucideEar, LucideIcon, LucideMicVocal } from 'lucide-react-native'
import { colors } from './utils'

export const lessonTypes = ['lecture', 'practical', 'seminar'] as const

export type LessonType = (typeof lessonTypes)[number]

export const lessonTypesInfo: Record<LessonType, { long: string; short: string; icon: LucideIcon; color: string }> = {
  practical: {
    long: 'практическое занятие',
    short: 'практ.',
    icon: LucideDumbbell,
    color: colors.neutral[500],
  },
  lecture: {
    long: 'лекция',
    short: 'лекция',
    icon: LucideEar,
    color: colors.yellow[400],
  },
  seminar: {
    long: 'семинар',
    short: 'сем.',
    icon: LucideMicVocal,
    color: colors.rose[500],
  },
}
