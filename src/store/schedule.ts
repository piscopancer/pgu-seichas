import { maxLessons, weekdays } from '@/schedule'
import { fillArray } from '@/utils'
import { Prisma } from '@prisma/client'
import { proxy } from 'valtio'
import { deepClone } from 'valtio/utils'

/** Update if `id` is present, create otherwise */
export type ScheduleStore = {
  id?: number
  name: string
  days: (Pick<Prisma.DayCreateArgs['data'], 'id' | 'holiday' | 'independentWorkDay'> & {
    lessons: Pick<Prisma.LessonCreateArgs['data'], 'id' | 'place' | 'type' | 'subjectId'>[]
  })[]
}

export const defaultCommonSchedule: ScheduleStore = {
  name: '',
  days: fillArray([], weekdays.length, {
    lessons: fillArray([], maxLessons, {}),
  }),
}

export const defaultCommonScheduleStore = proxy<ScheduleStore>(deepClone(defaultCommonSchedule))

export const createScheduleStore = proxy<ScheduleStore>(deepClone(defaultCommonSchedule))

export const updateScheduleStore = proxy<ScheduleStore>(deepClone(defaultCommonSchedule))
