import { db } from '@/db'
import { useDeviceStore } from '@/device-store'
import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { lessonTypes, lessonTypesInfo } from '@/lesson'
import { qc, queryKeys } from '@/query'
import { Schedule, updateSchedule, weekdays } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { capitalizeFirstLetter, colors } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Portal } from '@gorhom/portal'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideCalendarCheck2, LucideCalendarPlus } from 'lucide-react-native'
import { useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { BottomSheet, useSheetRef } from '../bottom-sheet'
import Text from '../text'
import TextInput from '../text-input'
import { scheduleContext, SheetOpenFor } from './shared'
import { WeekdayEdit, WeekdayView } from './weekday'

type ScheduleViewProps =
  | {
      mode: 'edit'
      schedule: ScheduleStore
    }
  | {
      mode: 'view'
      schedule: Schedule
    }

export function ScheduleViewEdit({ schedule }: ScheduleViewProps & { mode: 'edit' }) {
  const subjectSheet = useSheetRef()
  const lessonTypeSheet = useSheetRef()
  const sheetOpenFor = useRef<SheetOpenFor>()
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()

  return (
    <scheduleContext.Provider
      value={{
        sheetOpenFor,
        lessonTypeSheet,
        subjectSheet,
        mode: 'edit',
      }}
    >
      <ScheduleView mode='edit' schedule={schedule} />
      {/* subject sheet */}
      <BottomSheet ref={subjectSheet} onClose={() => (sheetOpenFor.current = undefined)}>
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            if (typeof sheetOpenFor.current?.day === 'number' && typeof sheetOpenFor.current?.lesson === 'number') {
              schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = null
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
                    schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = subject.item.id
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
              schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].type = null
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
                    schedule.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].type = lessonType
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

export function ScheduleViewView({ schedule }: ScheduleViewProps & { mode: 'view' }) {
  return (
    <scheduleContext.Provider
      value={{
        sheetOpenFor: null,
        lessonTypeSheet: null,
        subjectSheet: null,
        mode: 'view',
      }}
    >
      <ScheduleView mode='view' schedule={schedule} />
    </scheduleContext.Provider>
  )
}

function ScheduleView(props: ScheduleViewProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useDeviceStore('selectedScheduleId')
  const router = useRouter()

  function onSelectPress(id: number) {
    setSelectedScheduleId(id)
    router.replace('/(tabs)')
  }

  return (
    <>
      <ScrollView>
        {props.mode === 'edit' ? (
          <>
            <Text className='dark:text-zinc-500 mx-4 mb-2 mt-12'>Название расписания</Text>
            <TextInput editable={props.mode === 'edit'} defaultValue={props.schedule.name} onChange={(e) => (props.schedule.name = e.nativeEvent.text.trim())} placeholder='ПИП:...' className='mb-8 mx-4' />
          </>
        ) : (
          <Text className='text-2xl text-center mt-12 mb-4 font-sans-bold'>{props.schedule.name}</Text>
        )}
        <View className='mb-40'>
          {props.mode === 'edit' && weekdays.map((weekday, i) => <WeekdayEdit mode={props.mode} day={props.schedule.days[i]} key={i} weekday={weekday} dayIndex={i} />)}
          {/*  */}
          {props.mode === 'view' && weekdays.map((weekday, i) => <WeekdayView mode={props.mode} day={props.schedule.days[i]} key={i} weekday={weekday} dayIndex={i} />)}
        </View>
      </ScrollView>
      {props.mode === 'edit' && (props.schedule.id === undefined ? <CreateSchedulePressable scheduleStore={props.schedule} /> : <UpdateSchedulePressable id={props.schedule.id} scheduleStore={props.schedule} />)}
      {props.mode === 'view' && props.schedule.id !== selectedScheduleId && (
        <Portal>
          <View className='absolute bottom-24 w-full'>
            <Pressable android_ripple={{ color: colors.indigo[300] }} onPress={() => onSelectPress(props.schedule.id)} className='w-1/2 mx-auto bg-indigo-500 rounded-md py-3'>
              <Text className='text-lg font-sans-bold text-center'>Выбрать</Text>
            </Pressable>
          </View>
        </Portal>
      )}
    </>
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
                            id: lesson.subjectId,
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
    onSuccess() {
      qc.invalidateQueries({ queryKey: queryKeys.schedules() })
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
