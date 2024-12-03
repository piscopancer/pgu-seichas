import { Schedule, ScheduleViewMode } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { createContext, MutableRefObject } from 'react'

export type SheetOpenFor = { day: number; lesson: number }

export const scheduleContext = createContext<{
  mode: ScheduleViewMode
  sheetOpenFor: MutableRefObject<SheetOpenFor | undefined> | null
  lessonTypeSheet: MutableRefObject<BottomSheetMethods | null> | null
  subjectSheet: MutableRefObject<BottomSheetMethods | null> | null
}>(null!)

export type ScheduleViewProps =
  | {
      mode: 'edit'
      schedule: ScheduleStore
    }
  | {
      mode: 'view'
      schedule: Schedule
    }
