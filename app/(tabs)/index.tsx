import Text from '@/components/text'
import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { queryKeys } from '@/query'
import { getMinsToNextLesson, lessonFromTo, querySchedule } from '@/schedule'
import { cn, colors } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { LucideCalendar, LucideCalendarCheck2, LucideCalendarOff, LucideDoorOpen, LucideDot, LucideEllipsisVertical, LucideHourglass } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Pressable, View, ViewProps } from 'react-native'

const activeScheduleId: number | null = 1

export default function HomeScreen() {
  const scheduleQuery = useQuery({
    queryKey: queryKeys.schedule(activeScheduleId ?? -1),
    queryFn: () => querySchedule(activeScheduleId ?? -1),
    enabled: typeof activeScheduleId === 'number',
  })
  const [active, setActive] = useState(false)
  const StateIcon = active ? LucideCalendarCheck2 : LucideCalendarOff

  return (
    <View className='flex-1'>
      <Text className='text-center dark:text-neutral-500 mt-6 mb-24'>ПГУ Сейчас • Расписание</Text>
      <Pressable onPress={() => setActive((prev) => !prev)} className={cn('border-8 p-1 rounded-full w-56 mx-auto', active ? 'bg-indigo-500 border-indigo-500/30' : 'bg-neutral-850 border-neutral-800')}>
        <View className={cn('border h-24 rounded-full items-center flex-row px-6', active ? 'justify-end border-indigo-200' : 'justify-start border-neutral-950')}>
          <StateIcon strokeWidth={1} className={cn('size-12', active ? 'color-indigo-100' : 'color-neutral-500')} />
        </View>
      </Pressable>
      <LucideEllipsisVertical className={cn('self-center mt-4 mb-10 size-12', active ? 'color-indigo-500' : 'color-neutral-800 ')} />
      {scheduleQuery.data ? (
        <SelectedSchedule schedule={scheduleQuery.data} />
      ) : (
        <View>
          <Link href={'/(tabs)/schedules'}>Выбрать расписание</Link>
        </View>
      )}
    </View>
  )
}

type Schedule = NonNullable<Awaited<ReturnType<typeof querySchedule>>>

type SelectedScheduleProps = {
  schedule: Schedule
} & ViewProps

function SelectedSchedule({ schedule, ...props }: SelectedScheduleProps) {
  const subjectsQuery = useSubjectsQuery()
  const tutorsQuery = useTutorsQuery()

  if (!subjectsQuery.data || !tutorsQuery.data) {
    return <ActivityIndicator size={'large'} color={colors.indigo[500]} />
  }

  // const todayIndex = new Date().getDay()
  const todayIndex = 0

  const today = schedule.days[todayIndex]

  // const nextLessonIndex = getNextLessonIndex()
  const nextLessonIndex = 1

  const nextLesson = nextLessonIndex ? (today as typeof today | null)?.lessons[nextLessonIndex] : null
  const minsToNextLesson = getMinsToNextLesson()
  const nextSubject = subjectsQuery.data.find((s) => s.id === nextLesson?.subjectId)
  const nextTutor = tutorsQuery.data.find((t) => t.id === nextSubject?.tutorId)

  return (
    <View {...props} className={cn(props.className)}>
      <View className='bg-neutral-850 px-4 rounded-t-3xl pb-4'>
        <View className='flex-row items-center gap-2 mx-auto -translate-y-5 rounded-full bg-neutral-950 max-w-[75%] py-2 px-4'>
          <LucideCalendar className='size-4 color-neutral-500' />
          <Text className='line-clamp-1 max-w-64 align-middle'>{schedule.name}</Text>
          {/* <Text className='text-lg dark:text-neutral-500'>{capitalizeFirstLetter(format(new Date(), 'EEEE', { locale: ru }))}</Text> */}
        </View>
        {nextLesson ? (
          <>
            <View className='mb-6'>
              {nextSubject ? (
                <>
                  <Text className='text-xl text-center'>{nextSubject.name}</Text>
                  <Text className='dark:text-neutral-400 text-center'>{nextTutor ? `${nextTutor.surname} ${nextTutor.name} ${nextTutor.middlename}` : 'Преподаватель не указан'}</Text>
                </>
              ) : (
                <>
                  <Text className='text-center'>Окно</Text>
                </>
              )}
            </View>
            <View className='flex-row mb-6'>
              <View className='flex-1 flex-row items-center justify-center gap-3 border-r border-neutral-700 px-2'>
                <LucideDoorOpen className='color-neutral-500 size-6' />
                <Text className='text-xl line-clamp-1'>{nextLesson.place ?? '?'}</Text>
              </View>
              <View className='flex-1 flex-row px-2 items-center justify-center gap-3'>
                <LucideHourglass className='color-neutral-500 size-6' />
                <Text className='text-xl line-clamp-1'>{minsToNextLesson ?? '?'} мин.</Text>
              </View>
            </View>
          </>
        ) : (
          <View></View>
        )}
      </View>
      <View className='bg-neutral-900 py-4 -translate-y-4 rounded-3xl px-4'>
        {today.lessons.map((lesson, i) => {
          const subject = subjectsQuery.data.find((s) => s.id === lesson.subjectId)
          const next = i === nextLessonIndex

          return (
            <View key={lesson.id} className='flex-row items-center'>
              {next ? <LucideHourglass className='size-4 mr-2 color-indigo-500' /> : <LucideDot className='size-4 mr-2 color-neutral-500' />}
              <Text className={cn('mr-auto', next ? 'dark:text-indigo-500' : subject ? 'dark:text-neutral-500' : 'dark:text-neutral-600')}>{subject ? subject.name : 'Окно'}</Text>
              <Text className={cn('font-mono', next ? 'dark:text-indigo-500' : 'dark:text-neutral-500 ')}>{lessonFromTo(i)}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
