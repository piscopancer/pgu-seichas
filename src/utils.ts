import twConfig from '#/tailwind.config'
import { addMilliseconds } from 'date-fns'
import { getTimezoneOffset } from 'date-fns-tz'
import { getCalendars } from 'expo-localization'
import { useColorScheme } from 'react-native'
import { ClassNameValue, twMerge } from 'tailwind-merge'
import resolveConfig from 'tailwindcss/resolveConfig'
import { DefaultColors } from 'tailwindcss/types/generated/colors'
import { useSnapshot } from 'valtio'
import { z } from 'zod'

const calendar = getCalendars()[0]
export const timezone = calendar.timeZone ?? 'Europe/Moscow'

export function cn(...classLists: ClassNameValue[]): string {
  return twMerge(classLists)
}

export function objectEntries<O extends object>(obj?: O) {
  return Object.entries(obj ?? {}) as [keyof O, O[keyof O]][]
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function useTheme() {
  return useColorScheme() ?? 'light'
}

export function zonedToGmtTime(timeZone: string, date: Date): Date {
  const offset = getTimezoneOffset(timeZone, date)
  const utcDate = addMilliseconds(date, offset)
  return utcDate
}

export function zonedDate(date: Date = new Date()): Date {
  const offset = getTimezoneOffset(timezone, date)
  const zonedTime = addMilliseconds(date, offset)
  return zonedTime
}

export const { theme: tw } = resolveConfig(twConfig)
export const colors = tw.colors as DefaultColors & {
  neutral: Record<850 | 925, string>
}

export type ObjectSchema<O extends object> = z.ZodObject<{
  [K in keyof O]: z.ZodTypeAny
}>

export type Error<R extends { success: boolean }> = R & { success: false }

export type Success<R extends { success: boolean }> = R & { success: true }

export type Result<Success extends object, Errors extends [string, object?][], Error extends Errors[number] = Errors[number]> =
  | ({ success: true } & Success)
  | {
      success: false
      error: {
        code: Error[0]
      } & Error[1]
    }

export type Snapshot<T extends object> = ReturnType<typeof useSnapshot<T>>
