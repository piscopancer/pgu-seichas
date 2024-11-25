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

export type StrictOmit<T extends { [K in keyof object]: unknown }, K extends keyof T> = Omit<T, K>

export async function wait(seconds: number) {
  return new Promise((res) => setTimeout(res, seconds * 1000))
}

export function randomFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export function assignObject<T extends {} | undefined>(obj: T, newObj: T) {
  obj ? Object.assign(obj, newObj) : () => (obj = newObj)
}

const calendar = getCalendars()[0]
export const timezone = calendar.timeZone!

export function cn(...classLists: ClassNameValue[]): string {
  return twMerge(classLists)
}

export function objectEntries<O extends object>(obj?: O) {
  return Object.entries(obj ?? {}) as [keyof O, O[keyof O]][]
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function fillArray<I, F>(items: I[], to: number, filler: F): (I | F)[] {
  const filledArray = Array.from({ length: to }, () => filler) as (I | F)[]
  for (let i = 0; i < items.length; i++) {
    filledArray[i] = items[i]
  }
  return filledArray
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
  // console.log(`date [${date.toISOString()}], offset [${offset / 1000}s], tz [${timezone}]`)
  const zonedTime = addMilliseconds(date, offset)
  // console.log(`zoned: ${zonedTime.toISOString()}`)
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
