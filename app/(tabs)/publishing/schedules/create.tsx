import { BottomSheet, useBottomSheetRef } from '@/components/bottom-sheet'
import Switch from '@/components/switch'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { lessonFromTo, maxLessons, nextLessonIndex, weekdays } from '@/schedule'
import { scheduleStore, ScheduleToCreate } from '@/store/schedule'
import { cn, colors, zonedDate } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideBed, LucideCake, LucideCalendarPlus, LucideIcon, LucideUtensils } from 'lucide-react-native'
import { Fragment, MutableRefObject, RefObject, useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSnapshot } from 'valtio'

function getOverlay(holiday: boolean, independentWorkDay: boolean): { icon: LucideIcon; text: string } | undefined {
  if (holiday) return { icon: LucideCake, text: 'Праздничный день' }
  if (independentWorkDay) return { icon: LucideBed, text: 'День самостоятельной работы' }
}

async function createSchedule(schedule: ScheduleToCreate) {
  return db.schedule.create({
    data: {
      name: schedule.name,
      days: {
        create: schedule.days.map((day) => ({
          holiday: day.holiday ?? null,
          independentWorkDay: day.independentWorkDay ?? null,
          lessons: {
            create: day.lessons.map(
              (lesson) =>
                ({
                  place: lesson.place ?? null,
                  type: lesson.type ?? null,
                  ...(lesson.subjectId
                    ? {
                        subject: {
                          connect: {
                            id: lesson.subjectId,
                          },
                        },
                      }
                    : {}),
                  // subject: {
                  //   connect: {
                  //     id: lesson.subjectId ?? Prisma.skip,
                  //   },
                  // },
                } satisfies Prisma.LessonCreateWithoutInDayInput)
            ),
          },
        })),
      },
    },
  })
}

type SheetOpenFor = { day: number; lesson: number }

export default function CreateScheduleScreen() {
  const subjectSheetRef = useBottomSheetRef()
  const sheetOpenFor = useRef<SheetOpenFor>()
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()
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
    <>
      <ScrollView>
        <Text className='dark:text-zinc-500 mx-4 mb-2'>Название расписания</Text>
        <TextInput onChange={(e) => (scheduleStore.name = e.nativeEvent.text.trim())} placeholder='ПИП:...' className='mb-8 mx-4' />
        {weekdays.map((weekday, i) => (
          <Weekday key={i} weekday={weekday} dayI={i} subjectSheetRef={subjectSheetRef} sheetOpenFor={sheetOpenFor} />
        ))}
      </ScrollView>
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
      {/*  */}
      <BottomSheet
        ref={subjectSheetRef}
        onClose={() => {
          sheetOpenFor.current = undefined
        }}
      >
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            if (typeof sheetOpenFor.current?.day === 'number' && typeof sheetOpenFor.current?.lesson === 'number') {
              scheduleStore.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = null
              subjectSheetRef.current?.close()
              sheetOpenFor.current = undefined
            }
          }}
          className='px-6 py-4 border-b border-neutral-800'
        >
          <Text className='dark:text-neutral-500 text-lg'>Убрать предмет</Text>
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
                    scheduleStore.days[sheetOpenFor.current.day].lessons[sheetOpenFor.current.lesson].subjectId = subject.item.id
                    subjectSheetRef.current?.close()
                    sheetOpenFor.current = undefined
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
    </>
  )
}

type WeekdayProps = {
  weekday: string
  dayI: number
  subjectSheetRef: RefObject<BottomSheetMethods>
  sheetOpenFor: MutableRefObject<SheetOpenFor | undefined>
}

function Weekday({ weekday, dayI, subjectSheetRef, sheetOpenFor }: WeekdayProps) {
  const today = zonedDate().getDay() - 1 === dayI
  const overlay = getOverlay(!!scheduleStore.days[dayI].holiday, !!scheduleStore.days[dayI].independentWorkDay)
  const daySnap = useSnapshot(scheduleStore.days[dayI] ?? {})

  return (
    <View key={dayI}>
      <Text className='px-4 text-2xl text-center my-8 uppercase'>{weekday}</Text>
      <View className='flex-row items-center px-4 mb-4'>
        <Text className='mr-auto text-lg'>Праздничный день</Text>
        <Switch
          action={(current) => {
            scheduleStore.days[dayI].holiday = !current
            return !current
          }}
          enabled={daySnap.holiday === true}
        />
      </View>
      <View className='flex-row items-center px-4 mb-6'>
        <Text className='mr-auto text-lg'>День самостоятельной работы</Text>
        <Switch
          action={(current) => {
            scheduleStore.days[dayI].independentWorkDay = !current
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
            const next = today && nextLessonIndex() === lessonI
            return (
              <Fragment key={lessonI}>
                <Lesson next={next} dayIndex={dayI} lessonIndex={lessonI} sheetOpenForRef={sheetOpenFor} sheetRef={subjectSheetRef} key={lessonI} />
                {lessonI === 1 && <LucideUtensils strokeWidth={1} className='color-neutral-500 self-center' />}
              </Fragment>
            )
          })}
        </View>
      </View>
    </View>
  )
}

type LessonProps = {
  dayIndex: number
  lessonIndex: number
  next: boolean
  sheetRef: ReturnType<typeof useBottomSheetRef>
  sheetOpenForRef: MutableRefObject<SheetOpenFor | undefined>
}

function Lesson({ next, sheetRef, sheetOpenForRef, dayIndex, lessonIndex }: LessonProps) {
  const lessonSnap = useSnapshot(scheduleStore.days[dayIndex].lessons[lessonIndex])
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()
  const subject = typeof lessonSnap.subjectId === 'number' ? subjectById(lessonSnap.subjectId) : undefined
  const tutor = tutorsQuery.data?.find((t) => t.id === subject?.tutorId)

  function subjectById(id: number) {
    if (!subjectsQuery.data) return undefined
    return subjectsQuery.data.find((s) => s.id === id)
  }

  if (!tutorsQuery.data || !subjectsQuery.data) return null

  return (
    <View className='flex-row relative border-y border-neutral-800'>
      <Text className={cn('absolute -top-2 text-sm dark:text-neutral-400 z-[1]', next ? 'dark:text-indigo-400 bg-indigo-500/20 rounded-md px-2 left-2' : 'left-4')}>{lessonFromTo(lessonIndex)}</Text>
      <Pressable
        android_ripple={{ color: colors.neutral[700] }}
        onPress={() => {
          sheetOpenForRef.current = {
            day: dayIndex,
            lesson: lessonIndex,
          }
          sheetRef.current?.expand()
        }}
        className='flex-1 px-4 justify-center border-r border-neutral-800'
      >
        {subject ? (
          <View>
            <Text className='line-clamp-1 mb-0.5'>{subject.name}</Text>
            <Text className=' dark:text-neutral-500'>{tutor ? `${tutor.surname} ${tutor.name[0]}. ${tutor.middlename[0]}.` : 'Преподаватель не указан'}</Text>
          </View>
        ) : (
          <Text className='dark:text-neutral-500 text-lg'>Предмет не указан</Text>
        )}
      </Pressable>
      <TextInput placeholder='Место' onChange={(e) => (scheduleStore.days[dayIndex].lessons[lessonIndex].place = e.nativeEvent.text.trim())} className='max-w-[50%] rounded-none border-0 py-6 min-w-36' />
    </View>
  )
}
