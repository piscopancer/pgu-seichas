import useSubjectsQuery, { querySubjects } from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { LessonType, lessonTypesInfo } from '@/lesson'
import { Schedule } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { capitalizeFirstLetter, cn, colors } from '@/utils'
import { LucideDot, LucideIcon, LucideRotateCcw } from 'lucide-react-native'
import { useContext } from 'react'
import { Pressable, View } from 'react-native'
import { useSnapshot } from 'valtio'
import Text from '../text'
import TextInput from '../text-input'
import { scheduleContext } from './shared'

type LessonProps = (
  | {
      mode: 'edit'
      onPlaceChange: (place: string | null) => void
      onSubjectSheetOpen: () => void
      onTypeSheetOpen: () => void
      onRestorePress: () => void
    }
  | {
      mode: 'view'
    }
) &
  Lesson1

type Lesson1 = (
  | {
      mode: 'edit'
      lesson: ScheduleStore['days'][number]['lessons'][number]
    }
  | {
      mode: 'view'
      lesson: Schedule['days'][number]['lessons'][number]
    }
) & {
  dayIndex: number
  lessonIndex: number
  next: boolean
}

export function LessonEdit({ lesson, next, dayIndex, lessonIndex }: Lesson1 & { mode: 'edit' }) {
  const { subjectSheet, sheetOpenFor, lessonTypeSheet } = useContext(scheduleContext)
  const lessonSnap = useSnapshot(lesson)
  const subjectsQuery = useSubjectsQuery()
  const subject = typeof lessonSnap.subjectId === 'number' ? subjectsQuery.data?.find((s) => s.id === lessonSnap.subjectId) : undefined
  const TypeIcon = lessonSnap.type ? lessonTypesInfo[lessonSnap.type as LessonType].icon : null

  return (
    <Lesson
      mode='edit'
      lesson={lessonSnap}
      dayIndex={dayIndex}
      lessonIndex={lessonIndex}
      next={next}
      subject={subject}
      onPlaceChange={(place) => {
        lesson.place = place
      }}
      onRestorePress={() => {
        lesson.subjectId = null
        lesson.type = null
        lesson.place = null
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

export function LessonView({ lesson, next, dayIndex, lessonIndex }: Lesson1 & { mode: 'view' }) {
  const TypeIcon = lesson.type ? lessonTypesInfo[lesson.type as LessonType].icon : null
  const subjectsQuery = useSubjectsQuery()
  const subject = typeof lesson.subjectId === 'number' ? subjectsQuery.data?.find((s) => s.id === lesson.subjectId) : undefined

  return <Lesson mode='view' lesson={lesson} dayIndex={dayIndex} lessonIndex={lessonIndex} next={next} TypeIcon={TypeIcon} subject={subject} />
}

type LessonAdditionalProps = {
  subject: Awaited<ReturnType<typeof querySubjects>>[number] | undefined
  TypeIcon: LucideIcon | null
}

function Lesson(props: LessonProps & LessonAdditionalProps) {
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()
  const tutor = tutorsQuery.data?.find((t) => t.id === props.subject?.tutorId)

  if (!tutorsQuery.data || !subjectsQuery.data) return null

  return (
    <View className='flex-row relative border-y border-neutral-800'>
      <Text className={cn('absolute -top-2 text-sm dark:text-neutral-400 z-[1]', props.next ? 'dark:text-indigo-400 bg-indigo-500/20 rounded-md px-2 left-4' : 'left-6')}>
        {/* {lessonFromTo(props.lessonIndex)} */}
        {props.lessonIndex + 1}
      </Text>
      {/* <Text className='absolute left-0 top-1/2 -translate-y-1/2 px-1 bg-neutral-900 rounded-r-md'>{props.lessonIndex + 1}</Text> */}
      {props.mode === 'view' && !props.subject ? (
        <LucideDot className='color-neutral-800 my-8 mx-auto' />
      ) : (
        <>
          <Pressable
            android_ripple={{ color: colors.neutral[700] }}
            disabled={props.mode !== 'edit'}
            onPress={() => {
              if (props.mode === 'edit') {
                props.onSubjectSheetOpen()
              }
            }}
            className='flex-1 px-6 justify-center border-r border-neutral-800'
          >
            {props.subject ? (
              <View>
                <Text className='line-clamp-1 mb-0.5 text-xl'>{props.subject.name}</Text>
                <Text className=' dark:text-neutral-500'>{tutor ? `${tutor.surname} ${tutor.name[0]}. ${tutor.middlename[0]}.` : 'Преподаватель не указан'}</Text>
              </View>
            ) : (
              <Text className='dark:text-neutral-500 text-lg'>Предмет</Text>
            )}
          </Pressable>
          <View className={cn('w-36', props.mode === 'edit' && 'border-r border-neutral-800')}>
            {props.mode === 'edit' ? (
              <TextInput
                defaultValue={props.lesson.place ?? ''}
                placeholder='Место'
                onChange={({ nativeEvent: { text } }) => {
                  if (props.mode === 'edit') {
                    props.onPlaceChange(text.trim() || null)
                  }
                }}
                className='text-center rounded-none border-0 py-2'
              />
            ) : (
              <Text className={cn('text-center text-lg py-2 px-3 line-clamp-1', props.lesson.place ? '' : 'dark:text-neutral-500')}>{props.lesson.place ?? '?'}</Text>
            )}
            <Pressable
              disabled={props.mode !== 'edit'}
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                if (props.mode === 'edit') {
                  props.onTypeSheetOpen()
                }
              }}
              className='border-t border-neutral-800'
            >
              <View className='relative'>
                {props.TypeIcon && <props.TypeIcon strokeWidth={1.5} className='color-indigo-500 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 size-5' />}
                <Text className={cn('text-center text-lg py-2 px-5 line-clamp-1', props.lesson.type ? '' : 'dark:text-neutral-500')}>{props.lesson.type ? capitalizeFirstLetter(lessonTypesInfo[props.lesson.type as LessonType].long) : props.mode === 'view' ? '?' : 'Тип'}</Text>
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
            className='flex-1 justify-center items-center px-3'
          >
            <LucideRotateCcw strokeWidth={1.5} className='color-neutral-200 size-5' />
          </Pressable>
        </View>
      )}
    </View>
  )
}
