import { Prisma } from '@prisma/client/react-native'
import { addDays, differenceInMinutes, isAfter, startOfToday } from 'date-fns'
import { db } from './db'
import { ScheduleStore } from './store/schedule'
import { getDayOfWeekIndex } from './utils'

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

const hOffset = 3

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

export function getNextLessonIndexFromNow() {
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

export function getNextLessonDate(nextLessonPosition: LessonPosition) {
  const todayIndex = getDayOfWeekIndex()
  let lessonDate = new Date()
  const lessonDayOffset = nextLessonPosition.dayIndex - todayIndex
  lessonDate = addDays(lessonDate, lessonDayOffset > 0 ? lessonDayOffset : 7 + lessonDayOffset)
  const lessonTimestamp = lessonsTimestamps[nextLessonPosition.index]
  lessonDate.setHours(lessonTimestamp.from.h)
  lessonDate.setMinutes(lessonTimestamp.from.m)
  return lessonDate
}

export function getMinsToNextLesson(nextLessonIndex: number): number {
  const now = new Date()
  const lessonsStartDates = lessonsTimestamps.map((ts) => {
    const start = startOfToday()
    start.setHours(ts.from.h)
    start.setMinutes(ts.from.m)
    return start
  })
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
            holiday: day.holiday,
            independentWorkDay: day.independentWorkDay,
            lessons: {
              update: day.lessons.map(
                (lesson) =>
                  ({
                    data: {
                      subjectId: lesson.subjectId !== undefined ? lesson.subjectId : undefined,
                      place: lesson.place,
                      type: lesson.type,
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

type LessonPosition = {
  dayIndex: number
  index: number
  isToday: boolean
}

export function determineNextLesson(schedule: Schedule): LessonPosition | null {
  // determine index of next lesson, check if this lesson is existent
  // if there's no lesson today or indep work day or holiday, check next day, next, next, next until hit
  // if it's 3d day of week and there are only lessons on this day, I need to check today (3d) and if it's empty, apply same checking to the next index (4d) and when index hits 6 i need to make next index 0
  let nextLesson: LessonPosition | null = null
  for (let i = getDayOfWeekIndex(); i < i + 7; i++) {
    let dayOfWeekIndex = i
    // skip monday
    if (dayOfWeekIndex === 6) {
      continue
    }
    // transit to next week
    if (dayOfWeekIndex > 6) {
      dayOfWeekIndex = dayOfWeekIndex - 7
    }
    const day = schedule.days[dayOfWeekIndex]
    // starting from today, if no studies, will continue for the rest of 6 days until hits one with studies
    const studyDay = !day.holiday && !day.independentWorkDay && day.lessons.filter((l) => l.subjectId).length > 0
    if (!studyDay) continue
    const isToday = dayOfWeekIndex === getDayOfWeekIndex()
    const nextLessonIndexFromDay = getNextLessonIndexFromDay(day, isToday)
    if (nextLessonIndexFromDay !== null) {
      nextLesson = {
        dayIndex: dayOfWeekIndex,
        index: nextLessonIndexFromDay,
        isToday,
      }
      break
    }
  }
  return nextLesson
}

function getNextLessonIndexFromDay(day: Schedule['days'][number], isToday: boolean): number | null {
  // if not today, start from the start of the day, checking for the first collision with lesson
  // if today, determine current lesson index and
  const lessonIndexToStartFrom = isToday ? getNextLessonIndexFromNow() : 0
  if (lessonIndexToStartFrom === null) {
    return null
  }
  const lessonIndexesToCheck: number[] = []
  for (let i = lessonIndexToStartFrom; i < 5; i++) {
    lessonIndexesToCheck.push(i)
  }
  for (const i of lessonIndexesToCheck) {
    if (day.lessons[i].subjectId) {
      return i
    }
  }
  return null
}
