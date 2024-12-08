import { db } from '@/db'
import { useDeviceStore } from '@/device-store'
import { qc, queryKeys } from '@/query'
import { Schedule, updateSchedule } from '@/schedule'
import { createScheduleStore, ScheduleStore, ScheduleStoreApi, updateScheduleStore } from '@/store/schedule'
import { cn, colors } from '@/utils'
import { Portal, PortalHost } from '@gorhom/portal'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideCalendarCheck2, LucideCalendarPlus } from 'lucide-react-native'
import { useContext, useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSheetRef } from '../bottom-sheet'
import Text from '../text'
import TextInput from '../text-input'
import DeleteSheet from './delete-sheet'
import LessonTypeSheet from './lesson-type-sheet'
import { scheduleContext, SheetOpenFor } from './shared'
import SubjectSheet from './subject-sheet'
import WeekdaysList from './weekdays-list'
import WeekdaysTabs from './weekdays-tabs'

export function ScheduleViewEdit({ scheduleStore }: { scheduleStore: ScheduleStoreApi }) {
  const subjectSheet = useSheetRef()
  const lessonTypeSheet = useSheetRef()
  const sheetOpenFor = useRef<SheetOpenFor>()
  const scheduleIdSnap = scheduleStore.schedule.id.use()
  const scheduleNameSnap = scheduleStore.schedule.name.use()

  return (
    <scheduleContext.Provider
      value={{
        mode: 'edit',
        sheetOpenFor,
        lessonTypeSheet,
        subjectSheet,
        scheduleStore,
      }}
    >
      <ScheduleView mode='edit' scheduleName={scheduleNameSnap} scheduleId={scheduleIdSnap} />
      <SubjectSheet ref={subjectSheet} />
      <LessonTypeSheet ref={lessonTypeSheet} />
    </scheduleContext.Provider>
  )
}

export function ScheduleViewView({ schedule }: { schedule: Schedule }) {
  return (
    <scheduleContext.Provider
      value={{
        mode: 'view',
        sheetOpenFor: null,
        lessonTypeSheet: null,
        subjectSheet: null,
        scheduleStore: null,
      }}
    >
      <ScheduleView mode='view' schedule={schedule} />
    </scheduleContext.Provider>
  )
}

type S =
  | {
      mode: 'edit'
      scheduleId: number | null
      scheduleName: string
    }
  | {
      mode: 'view'
      schedule: Schedule
    }

function ScheduleView(props: S) {
  const { scheduleStore } = useContext(scheduleContext)
  const [selectedScheduleId, setSelectedScheduleId] = useDeviceStore('selectedScheduleId')
  const [scheduleView] = useDeviceStore('scheduleViewMode')
  const router = useRouter()
  const deleteSheetRef = useSheetRef()

  function onSelectPress(id: number) {
    setSelectedScheduleId(id)
    router.replace('/(tabs)')
  }

  return (
    <>
      <PortalHost name='weekdays-tabs' />
      <PortalHost name='select-schedule' />
      <ScrollView>
        {props.mode === 'edit' ? (
          <>
            <Text className='dark:text-zinc-500 mx-4 mb-2 mt-12'>Название расписания</Text>
            <TextInput
              editable={props.mode === 'edit'}
              defaultValue={props.scheduleName}
              onChangeText={(text) => {
                scheduleStore!.schedule.name.set(text.trim())
              }}
              placeholder='ПИП:...'
              className='mb-8 mx-4'
            />
          </>
        ) : (
          <Text className={cn('text-center', scheduleView === 'list' ? 'text-2xl mt-12 mb-4 font-sans-bold' : 'my-4 dark:text-neutral-500')}>{props.schedule.name}</Text>
        )}
        <View className='mb-40'>
          <View className='mb-6'>
            {scheduleView === 'list' ? (
              //
              <WeekdaysList {...(props as any)} />
            ) : (
              <WeekdaysTabs {...(props as any)} />
            )}
          </View>
          {props.mode === 'edit' && props.scheduleId !== null && (
            <>
              <View className='border-b border-dashed border-neutral-800 mx-6 mb-6' />
              <Pressable android_ripple={{ color: colors.neutral[800] }} onPress={() => deleteSheetRef.current?.snapToIndex(0)} className='mx-6 py-4 mb-12 px-6 rounded-md border border-neutral-800'>
                <Text className='text-center text-lg'>Удалить</Text>
              </Pressable>
              <DeleteSheet ref={deleteSheetRef} scheduleName={props.scheduleName} scheduleId={props.scheduleId} />
            </>
          )}
        </View>
      </ScrollView>
      {props.mode === 'edit' && (props.scheduleId === null ? <CreateSchedulePressable /> : <UpdateSchedulePressable scheduleId={props.scheduleId} />)}
      {props.mode === 'view' && props.schedule.id !== selectedScheduleId && (
        <Portal hostName='select-schedule'>
          <View className='absolute bottom-28 right-0 w-full z-[1]'>
            <Pressable android_ripple={{ color: colors.indigo[300] }} onPress={() => onSelectPress(props.schedule.id)} className='w-1/2 mx-auto bg-indigo-500 rounded-md py-3'>
              <Text className='text-lg font-sans-bold text-center'>Выбрать</Text>
            </Pressable>
          </View>
        </Portal>
      )}
    </>
  )
}

async function createSchedule(schedule: ScheduleStore['schedule']) {
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

function CreateSchedulePressable() {
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
        createScheduleMutation.mutate(createScheduleStore.get().schedule)
      }}
      disabled={createScheduleMutation.isPending}
      android_ripple={{ color: colors.indigo[400], radius: 32 }}
      className='rounded-full bg-indigo-500 p-5 absolute right-4 bottom-4 disabled:bg-neutral-800'
    >
      <LucideCalendarPlus strokeWidth={1} className='color-neutral-200 size-8' />
    </Pressable>
  )
}

function UpdateSchedulePressable({ scheduleId }: { scheduleId: number }) {
  const router = useRouter()
  const updateScheduleMutation = useMutation({
    mutationFn: () => updateSchedule(scheduleId, updateScheduleStore.get().schedule),
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
