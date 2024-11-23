import { Prisma } from '@prisma/client/react-native'
import { differenceInMinutes, isAfter, startOfToday } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'
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

function getLessonsTimestamps(timezone: string): LessonsTimestamps {
  const hOffset = getTimezoneOffset(timezone) / (1000 * 60 * 60)

  return [
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
}

type NextLesson = {
  lesson: Lesson
  minutesRemaining: number
}

export function nextLessonIndex() {
  const now = new Date()
  const lessonsTimestamps = getLessonsTimestamps(timezone)
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

// change to weekday to display if holiday
export function nextLesson(lessons: Lesson[]): NextLesson | null {
  const now = new Date()
  // now.setHours(15 - 3)
  // now.setMinutes(30)
  const lessonsTimestamps = getLessonsTimestamps(timezone)
  const lessonsStartDates = lessonsTimestamps.map((ts) => {
    const start = startOfToday()
    start.setHours(ts.from.h)
    start.setMinutes(ts.from.m)
    return start
  })
  let nextLessonStartDateIndex: number | null = null
  for (let i = 0; i < lessonsStartDates.length; i++) {
    const lessonStartDate = lessonsStartDates[i]
    if (isAfter(lessonStartDate, now)) {
      nextLessonStartDateIndex = i
      break
    }
  }
  if (nextLessonStartDateIndex === null) {
    return null
  }
  const lesson = lessons[nextLessonStartDateIndex]
  if (!lesson) {
    return null
  }
  const minutesRemaining = differenceInMinutes(lessonsStartDates[nextLessonStartDateIndex], now)
  return {
    lesson,
    minutesRemaining,
  }
}
