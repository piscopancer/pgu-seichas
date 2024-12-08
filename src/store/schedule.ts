import { maxLessons, weekdays } from '@/schedule'
import { fillArray } from '@/utils'
import { store } from '@davstack/store'
import { Prisma } from '@prisma/client'

/** Update if `id` is present, create otherwise */
export type ScheduleStore = {
  schedule: {
    id: number | null
    name: string
    days: (Pick<Prisma.DayCreateArgs['data'], 'id' | 'holiday' | 'independentWorkDay'> & {
      lessons: Pick<Prisma.LessonCreateArgs['data'], 'id' | 'place' | 'type' | 'subjectId'>[]
    })[]
  }
}

const defaultScheduleStore: ScheduleStore = {
  schedule: {
    id: null,
    name: '',
    days: fillArray([], weekdays.length, {
      lessons: fillArray([], maxLessons, {}),
    }),
  },
}

function assignScheduleStore() {
  return store(defaultScheduleStore)
    .actions((s) => ({
      reset: () => s.schedule.set(defaultScheduleStore.schedule),
      updateDay: (index: number) => s.schedule.days[index].assign,
      updateLesson: (dayIndex: number, lessonIndex: number) => s.schedule.days[dayIndex].lessons[lessonIndex].assign,
    }))
    .extend((s) => ({
      useDay: (index: number) => s.schedule.days[index].use,
      useLesson: (dayIndex: number, lessonIndex: number) => s.schedule.days[dayIndex].lessons[lessonIndex].use,
    }))
}

export type ScheduleStoreApi = ReturnType<typeof assignScheduleStore>

export const createScheduleStore = assignScheduleStore()
export const updateScheduleStore = assignScheduleStore()
