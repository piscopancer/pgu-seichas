import { LucideDumbbell, LucideIcon, LucideLectern, LucideMessageCircleQuestion, LucideMicVocal, LucideNotebookPen } from 'lucide-react-native'
import { colors } from './utils'

export const lessonTypes = ['practical', 'lecture', 'seminar', 'consultation', 'test', 'exam'] as const

export type LessonType = (typeof lessonTypes)[number]

export const lessonTypesInfo: Record<LessonType, { title: string; icon: LucideIcon; color: string }> = {
  practical: {
    title: 'практическое занятие',
    icon: LucideDumbbell,
    color: colors.neutral[500],
  },
  lecture: {
    title: 'лекция',
    icon: LucideLectern,
    color: colors.green[400],
  },
  seminar: {
    title: 'семинар',
    icon: LucideMicVocal,
    color: colors.yellow[500],
  },
  consultation: {
    title: 'консультация',
    icon: LucideMessageCircleQuestion,
    color: colors.yellow[500],
  },
  test: {
    title: 'зачет',
    icon: LucideNotebookPen,
    color: colors.rose[500],
  },
  exam: {
    title: 'экзамен',
    icon: LucideNotebookPen,
    color: colors.rose[500],
  },
}
