import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { LessonType, lessonTypesInfo } from '@/lesson'
import { lessonFromTo } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { capitalizeFirstLetter, cn, colors } from '@/utils'
import { LucideRotateCcw } from 'lucide-react-native'
import { useContext, useRef } from 'react'
import { Pressable, TextInput as RnTextInput, View } from 'react-native'
import { useSnapshot } from 'valtio'
import Text from '../text'
import TextInput from '../text-input'
import { scheduleContext } from './shared'

type LessonProps = {
  lesson: ScheduleStore['days'][number]['lessons'][number]
  dayIndex: number
  lessonIndex: number
  next: boolean
}

export default function Lesson({ lesson, next, dayIndex, lessonIndex }: LessonProps) {
  const { subjectSheet, sheetOpenFor, lessonTypeSheet } = useContext(scheduleContext)
  const lessonSnap = useSnapshot(lesson)
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()
  const placeInput = useRef<RnTextInput>(null)

  if (!tutorsQuery.data || !subjectsQuery.data) return null

  const subject = typeof lessonSnap.subjectId === 'number' ? subjectById(lessonSnap.subjectId) : undefined
  const tutor = tutorsQuery.data?.find((t) => t.id === subject?.tutorId)
  function subjectById(id: number) {
    if (!subjectsQuery.data) return undefined
    return subjectsQuery.data.find((s) => s.id === id)
  }
  const TypeIcon = lessonSnap.type ? lessonTypesInfo[lessonSnap.type as LessonType].icon : null

  return (
    <View className='flex-row relative border-y border-neutral-800'>
      <Text className={cn('absolute -top-2 text-sm dark:text-neutral-400 z-[1]', next ? 'dark:text-indigo-400 bg-indigo-500/20 rounded-md px-2 left-2' : 'left-4')}>{lessonFromTo(lessonIndex)}</Text>
      <Pressable
        android_ripple={{ color: colors.neutral[700] }}
        onPress={() => {
          sheetOpenFor.current = {
            day: dayIndex,
            lesson: lessonIndex,
          }
          subjectSheet.current?.expand()
        }}
        className='flex-1 px-4 justify-center border-r border-neutral-800'
      >
        {subject ? (
          <View>
            <Text className='line-clamp-1 mb-0.5'>{subject.name}</Text>
            <Text className=' dark:text-neutral-500'>{tutor ? `${tutor.surname} ${tutor.name[0]}. ${tutor.middlename[0]}.` : 'Преподаватель не указан'}</Text>
          </View>
        ) : (
          <Text className='dark:text-neutral-500 text-lg'>Предмет</Text>
        )}
      </Pressable>
      <View className='w-36 border-r border-neutral-800'>
        <TextInput ref={placeInput} defaultValue={lesson.place ?? undefined} placeholder='Место' onChange={(e) => (lesson.place = e.nativeEvent.text.trim())} className='text-center rounded-none border-0 py-2' />
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            sheetOpenFor.current = {
              day: dayIndex,
              lesson: lessonIndex,
            }
            lessonTypeSheet.current?.expand()
          }}
          className='border-t border-neutral-800'
        >
          <View className='relative'>
            {TypeIcon && <TypeIcon strokeWidth={1.5} className='color-indigo-500 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 size-5' />}
            <Text className={cn('text-center text-lg py-2 px-5 line-clamp-1', lessonSnap.type ? '' : 'dark:text-neutral-500')}>{lessonSnap.type ? capitalizeFirstLetter(lessonTypesInfo[lessonSnap.type as LessonType].long) : 'Тип'}</Text>
          </View>
        </Pressable>
      </View>
      <View>
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            lesson.place = null
            placeInput.current?.clear()
            lesson.subjectId = null
            lesson.type = null
          }}
          className='flex-1 justify-center items-center px-3'
        >
          <LucideRotateCcw strokeWidth={1.5} className='color-neutral-200 size-5' />
        </Pressable>
      </View>
    </View>
  )
}
