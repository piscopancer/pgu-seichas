import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { createContext, MutableRefObject } from 'react'

export type SheetOpenFor = { day: number; lesson: number }

export const scheduleContext = createContext<{
  mode: 'edit' | 'view'
  sheetOpenFor: MutableRefObject<SheetOpenFor | undefined> | null
  lessonTypeSheet: MutableRefObject<BottomSheetMethods | null> | null
  subjectSheet: MutableRefObject<BottomSheetMethods | null> | null
}>(null!)
