import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { createContext, MutableRefObject } from 'react'

export type SheetOpenFor = { day: number; lesson: number }

export const scheduleContext = createContext<{
  sheetOpenFor: MutableRefObject<SheetOpenFor | undefined>
  lessonTypeSheet: MutableRefObject<BottomSheetMethods | null>
  subjectSheet: MutableRefObject<BottomSheetMethods | null>
}>(null!)
