import { maxLessons, weekdays } from '@/schedule'
import { Prisma } from '@prisma/client'
import { proxy } from 'valtio'

export type ScheduleToCreate = {
  name: string
  days: (Pick<Prisma.DayCreateArgs['data'], 'holiday' | 'independentWorkDay'> & {
    lessons: Pick<Prisma.LessonCreateArgs['data'], 'place' | 'type' | 'subjectId'>[]
  })[]
}

export const scheduleStore = proxy<ScheduleToCreate>({
  name: '',
  days: weekdays.map(() => ({
    lessons: Array.from({ length: maxLessons }).map(() => ({})),
  })),
})
