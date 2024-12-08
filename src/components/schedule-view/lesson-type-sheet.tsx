import { lessonTypes, lessonTypesInfo } from '@/lesson'
import { capitalizeFirstLetter, colors } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { forwardRef, useContext } from 'react'
import { Pressable, View } from 'react-native'
import { BottomSheet } from '../bottom-sheet'
import Text from '../text'
import { scheduleContext } from './shared'

const LessonTypeSheet = forwardRef<BottomSheetMethods, {}>(({}, ref) => {
  const { sheetOpenFor, scheduleStore } = useContext(scheduleContext)

  if (!sheetOpenFor) return null

  return (
    <BottomSheet ref={ref} onClose={() => (sheetOpenFor.current = undefined)}>
      <Pressable
        onPress={() => {
          if (sheetOpenFor.current) {
            scheduleStore!.updateLesson(
              sheetOpenFor.current.day,
              sheetOpenFor.current.lesson
            )({
              type: null,
            })
            // schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].type = null
            sheetOpenFor.current = undefined
            if (typeof ref === 'object') {
              ref?.current?.close()
            }
          }
        }}
        className='px-6 py-4'
        android_ripple={{ color: colors.neutral[700] }}
      >
        <Text className='text-lg'>Тип не указан</Text>
      </Pressable>
      <View className='border-b border-neutral-800 mx-6' />
      <BottomSheetFlatList
        data={lessonTypes}
        renderItem={({ item: lessonType }) => {
          return (
            <Pressable
              onPress={() => {
                if (sheetOpenFor.current) {
                  scheduleStore!.updateLesson(
                    sheetOpenFor.current.day,
                    sheetOpenFor.current.lesson
                  )({
                    type: lessonType,
                  })
                  // schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].type = lessonType
                  sheetOpenFor.current = undefined
                  if (typeof ref === 'object') {
                    ref?.current?.close()
                  }
                }
              }}
              className='px-6 py-4'
              android_ripple={{ color: colors.neutral[700] }}
            >
              <Text className='text-lg'>{capitalizeFirstLetter(lessonTypesInfo[lessonType].title)}</Text>
            </Pressable>
          )
        }}
      />
    </BottomSheet>
  )
})

export default LessonTypeSheet
