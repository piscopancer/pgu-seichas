import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { colors } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { LucideSearch } from 'lucide-react-native'
import { forwardRef, useContext, useState } from 'react'
import { Pressable, View } from 'react-native'
import { BottomSheet } from '../bottom-sheet'
import SheetTextInput from '../sheet-text-input'
import Text from '../text'
import { scheduleContext } from './shared'

const SubjectSheet = forwardRef<BottomSheetMethods>(({}, ref) => {
  const [search, setSearch] = useState('')
  const { sheetOpenFor, scheduleStore } = useContext(scheduleContext)
  const tutorsQuery = useTutorsQuery()
  const subjectsQuery = useSubjectsQuery({
    select: (s) => {
      if (!tutorsQuery.data || !search.trim()) return s
      else {
        return s.filter((s) => {
          // TODO: add fzf
          const tutor = tutorsQuery.data.find((t) => t.id === s.tutorId)
          if (tutor && [tutor.name, tutor.surname, tutor.middlename].some((i) => i.toLowerCase().includes(search.toLowerCase().trim()))) {
            return s
          }
          if (s.name.toLowerCase().includes(search.toLowerCase().trim())) return s
        })
      }
    },
  })

  if (!sheetOpenFor) return null

  return (
    <BottomSheet android_keyboardInputMode='adjustResize' ref={ref} onClose={() => (sheetOpenFor.current = undefined)}>
      <View className='flex-row items-center mx-6 my-4'>
        <SheetTextInput defaultValue={search} onChangeText={setSearch} className='flex-1' />
        <LucideSearch strokeWidth={1} className='absolute right-5 color-neutral-500' />
      </View>
      <Pressable
        android_ripple={{ color: colors.neutral[700] }}
        onPress={() => {
          if (typeof sheetOpenFor.current?.day === 'number' && typeof sheetOpenFor.current?.lesson === 'number') {
            scheduleStore!.updateLesson(
              sheetOpenFor.current.day,
              sheetOpenFor.current.lesson
            )({
              subjectId: null,
            })
            // schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = null
            if (typeof ref === 'object') {
              ref?.current?.close()
            }
            sheetOpenFor.current = undefined
          }
        }}
        className='px-6 py-4'
      >
        <Text className='text-lg'>Предмет не указан</Text>
      </Pressable>
      <View className='border-b border-neutral-800 mx-6' />
      <BottomSheetFlatList
        scrollEnabled
        data={subjectsQuery.data ?? []}
        renderItem={({ item: subject }) => {
          const tutor = tutorsQuery.data?.find((t) => t.id === subject.tutorId)

          return (
            <Pressable
              className='px-6 py-4'
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                if (typeof sheetOpenFor.current?.day === 'number' && typeof sheetOpenFor.current?.lesson === 'number') {
                  scheduleStore!.updateLesson(
                    sheetOpenFor.current.day,
                    sheetOpenFor.current.lesson
                  )({
                    subjectId: subject.id,
                  })
                  // schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = subject.item.id
                  sheetOpenFor.current = undefined
                  if (typeof ref === 'object') {
                    ref?.current?.close()
                  }
                }
              }}
            >
              <Text className='mb-1'>{subject.name}</Text>
              <Text className='dark:text-neutral-500'>{tutor ? `${tutor.surname} ${tutor.name} ${tutor.middlename}` : 'Преп. не указан'}</Text>
            </Pressable>
          )
        }}
      />
    </BottomSheet>
  )
})

export default SubjectSheet
