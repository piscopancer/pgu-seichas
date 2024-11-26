import { db } from '@/db'
import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { LessonType, lessonTypes, lessonTypesInfo } from '@/lesson'
import { getNextLessonIndex, lessonFromTo, maxLessons, updateSchedule, weekdays } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { capitalizeFirstLetter, cn, colors, zonedDate } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideBed, LucideCake, LucideCalendarCheck2, LucideCalendarPlus, LucideChevronDown, LucideChevronUp, LucideIcon, LucideRotateCcw, LucideUtensils } from 'lucide-react-native'
import { createContext, Fragment, MutableRefObject, useContext, useRef, useState } from 'react'
import { Pressable, TextInput as RnTextInput, ScrollView, View } from 'react-native'
import { useSnapshot } from 'valtio'
import { BottomSheet, useBottomSheetRef } from './bottom-sheet'
import Switch from './switch'
import Text from './text'
import TextInput from './text-input'

type ScheduleViewProps = {
  scheduleStore: ScheduleStore
}

type SheetOpenFor = { day: number; lesson: number }

const scheduleContext = createContext<{
  sheetOpenFor: MutableRefObject<SheetOpenFor | undefined>
  lessonTypeSheet: MutableRefObject<BottomSheetMethods | null>
  subjectSheet: MutableRefObject<BottomSheetMethods | null>
}>(null!)

function getOverlay(holiday: boolean, independentWorkDay: boolean): { icon: LucideIcon; text: string } | undefined {
  if (holiday) return { icon: LucideCake, text: 'Праздничный день' }
  if (independentWorkDay) return { icon: LucideBed, text: 'День самостоятельной работы' }
}

export default function ScheduleView(props: ScheduleViewProps) {
  const subjectSheet = useBottomSheetRef()
  const lessonTypeSheet = useBottomSheetRef()
  const sheetOpenFor = useRef<SheetOpenFor>()
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()

  return (
    <scheduleContext.Provider
      value={{
        sheetOpenFor,
        lessonTypeSheet,
        subjectSheet,
      }}
    >
      <ScrollView>
        {/* <Text className='dark:text-neutral-500 text-xs'>{JSON.stringify(, null, 2)}</Text> */}
        <Text className='dark:text-zinc-500 mx-4 mb-2 mt-12'>Название расписания</Text>
        <TextInput defaultValue={props.scheduleStore.name} onChange={(e) => (props.scheduleStore.name = e.nativeEvent.text.trim())} placeholder='ПИП:...' className='mb-8 mx-4' />
        <View className='mb-40'>
          {weekdays.map((weekday, i) => (
            <Weekday day={props.scheduleStore.days[i]} key={i} weekday={weekday} dayI={i} />
          ))}
        </View>
      </ScrollView>
      {props.scheduleStore.id === undefined ? <CreateSchedulePressable scheduleStore={props.scheduleStore} /> : <UpdateSchedulePressable id={props.scheduleStore.id} scheduleStore={props.scheduleStore} />}
      {/* subject sheet */}
      <BottomSheet ref={subjectSheet} onClose={() => (sheetOpenFor.current = undefined)}>
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            if (typeof sheetOpenFor.current?.day === 'number' && typeof sheetOpenFor.current?.lesson === 'number') {
              props.scheduleStore.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = null
              subjectSheet.current?.close()
              sheetOpenFor.current = undefined
            }
          }}
          className='px-6 py-4 border-b border-neutral-800'
        >
          <Text className='dark:text-neutral-500 text-lg'>Предмет не указан</Text>
        </Pressable>
        <BottomSheetFlatList
          scrollEnabled
          data={subjectsQuery.data ?? []}
          renderItem={(subject) => {
            const tutor = tutorsQuery.data?.find((t) => t.id === subject.item.tutorId)

            return (
              <Pressable
                className='px-6 py-4'
                android_ripple={{ color: colors.neutral[700] }}
                onPress={() => {
                  if (typeof sheetOpenFor.current?.day === 'number' && typeof sheetOpenFor.current?.lesson === 'number') {
                    props.scheduleStore.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = subject.item.id
                    sheetOpenFor.current = undefined
                    subjectSheet.current?.close()
                  }
                }}
              >
                <Text className='mb-1'>{subject.item.name}</Text>
                <Text className='dark:text-neutral-500'>{tutor ? `${tutor.surname} ${tutor.name} ${tutor.middlename}` : 'Преп. не указан'}</Text>
              </Pressable>
            )
          }}
        />
      </BottomSheet>
      {/* lesson type sheet */}
      <BottomSheet ref={lessonTypeSheet} onClose={() => (sheetOpenFor.current = undefined)}>
        <Pressable
          onPress={() => {
            if (sheetOpenFor.current) {
              props.scheduleStore.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].type = null
              sheetOpenFor.current = undefined
              lessonTypeSheet.current?.close()
            }
          }}
          className='px-4 py-4 border-b border-neutral-800'
          android_ripple={{ color: colors.neutral[700] }}
        >
          <Text className='text-lg dark:text-neutral-500'>Тип не указан</Text>
        </Pressable>
        <BottomSheetFlatList
          data={lessonTypes}
          renderItem={({ item: lessonType }) => {
            return (
              <Pressable
                onPress={() => {
                  if (sheetOpenFor.current) {
                    props.scheduleStore.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].type = lessonType
                    sheetOpenFor.current = undefined
                    lessonTypeSheet.current?.close()
                  }
                }}
                className='px-4 py-4'
                android_ripple={{ color: colors.neutral[700] }}
              >
                <Text className='text-lg'>{capitalizeFirstLetter(lessonTypesInfo[lessonType].long)}</Text>
              </Pressable>
            )
          }}
        />
      </BottomSheet>
    </scheduleContext.Provider>
  )
}
type WeekdayProps = {
  day: ScheduleStore['days'][number]
  weekday: string
  dayI: number
}

function Weekday({ day, weekday, dayI }: WeekdayProps) {
  const daySnap = useSnapshot(day)
  const today = zonedDate().getDay() - 1 === dayI
  const overlay = getOverlay(!!day.holiday, !!day.independentWorkDay)
  const [collapsed, setCollapsed] = useState(false)
  const CollapsedIcon = collapsed ? LucideChevronDown : LucideChevronUp

  return (
    <View>
      <Pressable onPress={() => setCollapsed((prev) => !prev)}>
        <CollapsedIcon className='absolute top-1/2 -translate-y-1/2 left-8 size-6 color-neutral-500' />
        <Text className='px-4 text-2xl text-center my-8 uppercase'>{weekday}</Text>
      </Pressable>
      <View className={cn(collapsed ? 'hidden' : '')}>
        <View className='flex-row items-center px-4 mb-4'>
          <Text className='mr-auto text-lg'>Праздничный день</Text>
          <Switch
            action={(current) => {
              day.holiday = !current
              return !current
            }}
            enabled={daySnap.holiday === true}
          />
        </View>
        <View className='flex-row items-center px-4 mb-6'>
          <Text className='mr-auto text-lg'>День самостоятельной работы</Text>
          <Switch
            action={(current) => {
              day.independentWorkDay = !current
              return !current
            }}
            enabled={daySnap.independentWorkDay === true}
          />
        </View>
        <View className='relative'>
          {overlay && (
            <View className='top-0 right-0 bottom-0 left-0 absolute justify-center items-center z-[1]'>
              <overlay.icon strokeWidth={1} className='mb-4 size-20 color-indigo-500' />
              <Text className='text-lg'>{overlay.text}</Text>
            </View>
          )}
          <View className={cn('gap-3', overlay && 'opacity-50 pointer-events-none')}>
            {Array.from({ length: maxLessons }).map((_, lessonI) => {
              const next = today && getNextLessonIndex() === lessonI
              return (
                <Fragment key={lessonI}>
                  <Lesson lesson={day.lessons[lessonI]} next={next} dayIndex={dayI} lessonIndex={lessonI} key={lessonI} />
                  {lessonI === 1 && <LucideUtensils strokeWidth={1} className='color-neutral-500 self-center' />}
                </Fragment>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}

type LessonProps = {
  lesson: ScheduleStore['days'][number]['lessons'][number]
  dayIndex: number
  lessonIndex: number
  next: boolean
}

function Lesson({ lesson, next, dayIndex, lessonIndex }: LessonProps) {
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

async function createSchedule(schedule: ScheduleStore) {
  return db.schedule.create({
    data: {
      name: schedule.name,
      days: {
        create: schedule.days.map((day) => ({
          holiday: day.holiday,
          independentWorkDay: day.independentWorkDay,
          lessons: {
            create: day.lessons.map(
              (lesson) =>
                ({
                  place: lesson.place,
                  type: lesson.type,
                  ...(lesson.subjectId
                    ? {
                        subject: {
                          connect: {
                            id: lesson.subjectId ?? undefined,
                          },
                        },
                      }
                    : {}),
                } satisfies Prisma.LessonCreateWithoutInDayInput)
            ),
          },
        })),
      },
    },
  })
}

function CreateSchedulePressable({ scheduleStore }: { scheduleStore: ScheduleStore }) {
  const router = useRouter()
  const createScheduleMutation = useMutation({
    mutationFn: createSchedule,
    onError(e) {
      console.error(e)
    },
    onSuccess(data) {
      console.log('schedule created', data)
      router.replace('/(tabs)/publishing/schedules')
    },
  })

  return (
    <Pressable
      onPress={() => {
        createScheduleMutation.mutate({ ...scheduleStore })
      }}
      disabled={createScheduleMutation.isPending}
      android_ripple={{ color: colors.indigo[400], radius: 32 }}
      className='rounded-full bg-indigo-500 p-5 absolute right-4 bottom-4 disabled:bg-neutral-800'
    >
      <LucideCalendarPlus strokeWidth={1} className='color-neutral-200 size-8' />
    </Pressable>
  )
}

function UpdateSchedulePressable({ id, scheduleStore }: { id: number; scheduleStore: ScheduleStore }) {
  const router = useRouter()
  const updateScheduleMutation = useMutation({
    mutationFn: () => updateSchedule(id, scheduleStore),
    onError(e) {
      console.error(e)
    },
    onSuccess(data) {
      console.log('schedule updated', data)
      router.replace('/(tabs)/publishing/schedules')
    },
  })

  return (
    <Pressable
      onPress={() => {
        updateScheduleMutation.mutate()
      }}
      disabled={updateScheduleMutation.isPending}
      android_ripple={{ color: colors.indigo[400], radius: 32 }}
      className='rounded-full bg-indigo-500 p-5 absolute right-4 bottom-4 disabled:bg-neutral-800'
    >
      <LucideCalendarCheck2 strokeWidth={1} className='color-neutral-200 size-8' />
    </Pressable>
  )
}
