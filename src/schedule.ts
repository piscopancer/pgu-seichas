import { Prisma } from '@prisma/client/react-native'
import { differenceInMinutes, isAfter, startOfToday } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'
import { db } from './db'
import { ScheduleStore } from './store/schedule'
import { timezone } from './utils'

export const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'] as const
export const maxLessons = 5

export function lessonFromTo(index: number): string {
  return ['8:30 - 10:00', '10:10 - 11:40', '12:20 - 13:50', '14:00 - 15:30', '15:40 - 17:10'][index]
}

type Lesson = Prisma.LessonSelect

type LessonsTimestamps = {
  from: { h: number; m: number }
  to: { h: number; m: number }
}[]

const hOffset = getTimezoneOffset(timezone) / (1000 * 60 * 60)

const lessonsTimestamps: LessonsTimestamps = [
  {
    from: { h: 8 - hOffset, m: 30 },
    to: { h: 10 - hOffset, m: 0 },
  },
  {
    from: { h: 10 - hOffset, m: 10 },
    to: { h: 11 - hOffset, m: 40 },
  },
  {
    from: { h: 12 - hOffset, m: 20 },
    to: { h: 13 - hOffset, m: 50 },
  },
  {
    from: { h: 14 - hOffset, m: 0 },
    to: { h: 15 - hOffset, m: 30 },
  },
  {
    from: { h: 15 - hOffset, m: 40 },
    to: { h: 17 - hOffset, m: 10 },
  },
]

type NextLesson = {
  lesson: Lesson
  minutesRemaining: number
}

export function getNextLessonIndex() {
  const now = new Date()
  const lessonsStartDates = lessonsTimestamps.map((ts) => {
    const start = startOfToday()
    start.setHours(ts.from.h)
    start.setMinutes(ts.from.m)
    return start
  })
  let nextLessonIndex: number | null = null
  for (let i = 0; i < lessonsStartDates.length; i++) {
    const lessonStartDate = lessonsStartDates[i]
    if (isAfter(lessonStartDate, now)) {
      nextLessonIndex = i
      break
    }
  }
  return nextLessonIndex
}

export function getMinsToNextLesson(): number | null {
  // const now = new Date()
  const now = new Date('2024-11-26 08:29:00')
  const lessonsStartDates = lessonsTimestamps.map((ts) => {
    const start = startOfToday()
    start.setHours(ts.from.h)
    start.setMinutes(ts.from.m)
    return start
  })
  let nextLessonIndex: number | null = null
  for (let i = 0; i < lessonsStartDates.length; i++) {
    const lessonStartDate = lessonsStartDates[i]
    if (isAfter(lessonStartDate, now)) {
      nextLessonIndex = i
      break
    }
  }
  if (nextLessonIndex === null) {
    return null
  }
  const minutesRemaining = differenceInMinutes(lessonsStartDates[nextLessonIndex], now)
  return minutesRemaining
}

export async function querySchedules(filters?: { search?: string }) {
  return db.schedule.findMany({
    ...(filters && filters.search
      ? {
          where: {
            OR: [
              {
                name: {
                  contains: filters.search,
                },
              },
              {
                days: {
                  some: {
                    lessons: {
                      some: {
                        OR: [
                          {
                            place: {
                              contains: filters.search,
                            },
                          },
                          {
                            subject: {
                              OR: [
                                {
                                  name: {
                                    contains: filters.search,
                                  },
                                },
                                {
                                  tutor: {
                                    OR: [
                                      {
                                        name: {
                                          contains: filters.search,
                                        },
                                      },
                                      {
                                        surname: {
                                          contains: filters.search,
                                        },
                                      },
                                      {
                                        middlename: {
                                          contains: filters.search,
                                        },
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      : {}),
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: {
        select: {
          days: {
            where: {
              lessons: {
                some: {
                  subject: {
                    isNot: null,
                  },
                },
              },
            },
          },
        },
      },
      days: {
        select: {
          _count: {
            select: {
              lessons: {
                where: {
                  subject: { isNot: null },
                },
              },
            },
          },
        },
      },
    },
  })
}

export type ScheduleForCard = NonNullable<Awaited<ReturnType<typeof querySchedules>>>[number]

export async function querySchedule(id: number) {
  return db.schedule.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      days: {
        select: {
          id: true,
          holiday: true,
          independentWorkDay: true,
          lessons: {
            select: {
              id: true,
              place: true,
              subjectId: true,
              type: true,
            },
          },
        },
      },
    },
  })
}

export type Schedule = NonNullable<Awaited<ReturnType<typeof querySchedule>>>

export async function updateSchedule(id: number, updatedSchedule: ScheduleStore) {
  return db.schedule.update({
    where: {
      id,
    },
    data: {
      name: updatedSchedule.name,
      updatedAt: new Date(),
      days: {
        update: updatedSchedule.days.map((day) => ({
          where: {
            id: day.id,
          },
          data: {
            holiday: day.holiday ?? undefined,
            independentWorkDay: day.independentWorkDay ?? undefined,
            lessons: {
              update: day.lessons.map(
                (lesson) =>
                  ({
                    data: {
                      subjectId: lesson.subjectId !== undefined ? lesson.subjectId : undefined,
                      place: lesson.place ?? undefined,
                      type: lesson.type ?? undefined,
                    },
                    where: {
                      id: lesson.id,
                    },
                  } satisfies Prisma.LessonUpdateWithWhereUniqueWithoutInDayInput | Prisma.LessonUpdateWithWhereUniqueWithoutInDayInput)
              ),
            },
          },
        })),
      },
    },
  })
}
