import { useDeviceStore } from '@/device-store'
import useSubjectsQuery, { querySubjects } from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { LessonType, lessonTypesInfo } from '@/lesson'
import { getNextLessonIndexFromNow, lessonFromTo, Schedule } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { capitalizeFirstLetter, cn, colors, getDayOfWeekIndex } from '@/utils'
import { LucideDot, LucideIcon, LucideRotateCcw } from 'lucide-react-native'
import { useContext, useMemo } from 'react'
import { Pressable, ToastAndroid, View } from 'react-native'
import Text from '../text'
import TextInput from '../text-input'
import { scheduleContext } from './shared'

type Shared = {
  dayIndex: number
  lessonIndex: number
}

export function LessonEdit({ dayIndex, lessonIndex }: Shared) {
  const { subjectSheet, sheetOpenFor, lessonTypeSheet, scheduleStore } = useContext(scheduleContext)
  const lessonSnap = scheduleStore!.useLesson(dayIndex, lessonIndex)()
  const subjectsQuery = useSubjectsQuery()

  if (!subjectsQuery.data) return null

  const subject = useMemo(() => (typeof lessonSnap.subjectId === 'number' ? subjectsQuery.data.find((s) => s.id === lessonSnap.subjectId) : undefined), [lessonSnap.subjectId, subjectsQuery.dataUpdatedAt])
  const TypeIcon = useMemo(() => (lessonSnap.type ? lessonTypesInfo[lessonSnap.type as LessonType].icon : null), [lessonSnap.type])

  return (
    <Lesson
      mode='edit'
      lesson={lessonSnap}
      dayIndex={dayIndex}
      lessonIndex={lessonIndex}
      subject={subject}
      onPlaceChange={(place) => {
        scheduleStore!.updateLesson(
          dayIndex,
          lessonIndex
        )({
          place,
        })
      }}
      onRestorePress={() => {
        scheduleStore!.updateLesson(
          dayIndex,
          lessonIndex
        )({
          subjectId: null,
          type: null,
          place: null,
        })
      }}
      onSubjectSheetOpen={() => {
        if (sheetOpenFor) {
          sheetOpenFor.current = {
            day: dayIndex,
            lesson: lessonIndex,
          }
        }
        if (subjectSheet) {
          subjectSheet.current?.expand()
        }
      }}
      onTypeSheetOpen={() => {
        if (sheetOpenFor) {
          sheetOpenFor.current = {
            day: dayIndex,
            lesson: lessonIndex,
          }
        }
        if (lessonTypeSheet) {
          lessonTypeSheet.current?.expand()
        }
      }}
      TypeIcon={TypeIcon}
    />
  )
}

export function LessonView({ lesson, dayIndex, lessonIndex }: Shared & { lesson: Schedule['days'][number]['lessons'][number] }) {
  const TypeIcon = lesson.type ? lessonTypesInfo[lesson.type as LessonType].icon : null
  const subjectsQuery = useSubjectsQuery()
  const subject = typeof lesson.subjectId === 'number' ? subjectsQuery.data?.find((s) => s.id === lesson.subjectId) : undefined

  return <Lesson mode='view' lesson={lesson} dayIndex={dayIndex} lessonIndex={lessonIndex} TypeIcon={TypeIcon} subject={subject} />
}

type LessonAdditionalProps = {
  subject: Awaited<ReturnType<typeof querySubjects>>[number] | undefined
  TypeIcon: LucideIcon | null
}

type LessonProps = (
  | {
      mode: 'edit'
      lesson: ScheduleStore['schedule']['days'][number]['lessons'][number]
      onPlaceChange: (place: string | null) => void
      onSubjectSheetOpen: () => void
      onTypeSheetOpen: () => void
      onRestorePress: () => void
    }
  | {
      mode: 'view'
      lesson: Schedule['days'][number]['lessons'][number]
    }
) &
  Shared

function Lesson(props: LessonProps & LessonAdditionalProps) {
  const [viewMode] = useDeviceStore('lessonViewMode')
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()

  if (!tutorsQuery.data || !subjectsQuery.data) return null

  const today = getDayOfWeekIndex()
  const next = today && getNextLessonIndexFromNow() === props.lessonIndex
  const typeColor = props.lesson.type ? lessonTypesInfo[props.lesson.type as LessonType].color : null
  const tutor = useMemo(() => tutorsQuery.data.find((t) => t.id === props.subject?.tutorId), [tutorsQuery.dataUpdatedAt, props.subject?.tutorId])

  return (
    <View className='flex-row border-y border-neutral-800'>
      <Text className={cn('absolute -top-2 text-sm dark:text-neutral-400 z-[1]', next ? 'dark:text-indigo-400 bg-indigo-500/20 rounded-md px-2 left-4' : 'left-6')}>
        {viewMode === 'position' && props.lessonIndex + 1}
        {viewMode === 'time' && lessonFromTo(props.lessonIndex)}
      </Text>
      {props.mode === 'view' && !props.subject ? (
        <LucideDot style={{ marginVertical: 22 }} className='color-neutral-700 mx-auto size-6' />
      ) : (
        <>
          <Pressable
            android_ripple={{ color: colors.neutral[700] }}
            onPress={() => {
              if (props.mode === 'edit') {
                props.onSubjectSheetOpen()
              } else {
                if (props.subject) {
                  ToastAndroid.show(props.subject.name + '\n' + (tutor ? `${tutor.surname} ${tutor.name} ${tutor.middlename}` : 'Преподаватель не указан'), ToastAndroid.SHORT)
                }
              }
            }}
            className='flex-1 px-6 justify-center border-r border-neutral-800 pt-1 pb-2'
          >
            {props.subject ? (
              <View>
                <Text className='line-clamp-1 text-lg'>{props.subject.name}</Text>
                <Text className=' dark:text-neutral-500'>{tutor ? `${tutor.surname} ${tutor.name[0]}. ${tutor.middlename[0]}.` : 'Преподаватель не указан'}</Text>
              </View>
            ) : (
              <Text className='dark:text-neutral-500 text-lg'>Предмет</Text>
            )}
          </Pressable>
          <View className={cn('w-32', props.mode === 'edit' && 'border-r border-neutral-800')}>
            {props.mode === 'edit' ? (
              <TextInput
                defaultValue={props.lesson.place ?? ''}
                placeholder='Место'
                onChange={({ nativeEvent: { text } }) => {
                  if (props.mode === 'edit') {
                    props.onPlaceChange(text.trim() || null)
                  }
                }}
                className='text-center text-base rounded-none border-0 py-0.5 flex-1'
              />
            ) : (
              <Text className={cn('text-center p-2 px-3 line-clamp-1', props.lesson.place ? '' : 'dark:text-neutral-500')}>{props.lesson.place ?? '?'}</Text>
            )}
            <Pressable
              disabled={props.mode !== 'edit'}
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                if (props.mode === 'edit') {
                  props.onTypeSheetOpen()
                }
              }}
              className='border-t border-neutral-800 py-2 flex-1'
            >
              <View className='relative'>
                {props.TypeIcon && <props.TypeIcon strokeWidth={1.5} color={typeColor ?? undefined} className='absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 size-5' />}
                <Text className={cn('text-center px-5 line-clamp-1', props.lesson.type ? '' : 'dark:text-neutral-500')}>{props.lesson.type ? capitalizeFirstLetter(lessonTypesInfo[props.lesson.type as LessonType].title) : props.mode === 'view' ? '?' : 'Тип'}</Text>
              </View>
            </Pressable>
          </View>
        </>
      )}
      {props.mode === 'edit' && (
        <View>
          <Pressable
            android_ripple={{ color: colors.neutral[700] }}
            onPress={() => {
              props.onRestorePress()
            }}
            className='flex-1 justify-center items-center px-2'
          >
            <LucideRotateCcw strokeWidth={1.5} className='color-neutral-200 size-5' />
          </Pressable>
        </View>
      )}
    </View>
  )
}
