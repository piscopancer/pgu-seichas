import { db } from '@/db'
import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { lessonTypes, lessonTypesInfo } from '@/lesson'
import { qc, queryKeys } from '@/query'
import { updateSchedule, weekdays } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { capitalizeFirstLetter, colors } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideCalendarCheck2, LucideCalendarPlus } from 'lucide-react-native'
import { useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { BottomSheet, useBottomSheetRef } from '../bottom-sheet'
import Text from '../text'
import TextInput from '../text-input'
import { scheduleContext, SheetOpenFor } from './shared'
import Weekday from './weekday'

type ScheduleViewProps = {
  scheduleStore: ScheduleStore
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
