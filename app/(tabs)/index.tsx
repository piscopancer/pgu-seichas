import Text from '@/components/text'
import { useDeviceStore } from '@/device-store'
import useSubjectsQuery from '@/hooks/query/use-subjects'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { queryKeys } from '@/query'
import { determineNextLesson, getNextLessonDate, querySchedule } from '@/schedule'
import { cn, colors } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceStrict } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { Link } from 'expo-router'
import { LucideDoorOpen, LucideHourglass } from 'lucide-react-native'
import { ActivityIndicator, Pressable, View, ViewProps } from 'react-native'

export default function HomeScreen() {
  const [selectedScheduleId] = useDeviceStore('selectedScheduleId')
  const scheduleQuery = useQuery({
    queryKey: queryKeys.schedule(selectedScheduleId!),
    queryFn: () => querySchedule(selectedScheduleId!),
    enabled: typeof selectedScheduleId === 'number',
  })
  // const [active, setActive] = useState(false)
  // const StateIcon = active ? LucideCalendarCheck2 : LucideCalendarOff

  return (
    <View className='flex-1'>
      <Text className='text-center dark:text-neutral-500 mt-6 mb-24'>ПГУ Сейчас • Расписание</Text>
      {/* <Pressable onPress={() => setActive((prev) => !prev)} className={cn('border-8 p-1 rounded-full w-56 mx-auto', active ? 'bg-indigo-500 border-indigo-500/30' : 'bg-neutral-850 border-neutral-800')}>
        <View className={cn('border h-24 rounded-full items-center flex-row px-6', active ? 'justify-end border-indigo-200' : 'justify-start border-neutral-950')}>
          <StateIcon strokeWidth={1} className={cn('size-12', active ? 'color-indigo-100' : 'color-neutral-500')} />
        </View>
      </Pressable>
      <LucideEllipsisVertical className={cn('self-center my-6 size-12', active ? 'color-indigo-500' : 'color-neutral-800')} /> */}
      {scheduleQuery.data ? (
        <SelectedSchedule schedule={scheduleQuery.data} className='mt-3' />
      ) : (
        <Link href={'/(tabs)/schedules'} asChild>
          <Pressable android_ripple={{ color: colors.neutral[700] }} className='mx-6 py-3 rounded-md bg-neutral-900'>
            <Text className='text-center text-lg'>Выбрать расписание</Text>
          </Pressable>
        </Link>
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

  const nextLessonPosition = determineNextLesson(schedule)
  const nextLesson = nextLessonPosition ? schedule.days[nextLessonPosition.dayIndex].lessons[nextLessonPosition.index] : null

  let timeToNextLesson: string | null = null
  if (nextLessonPosition) {
    const nextLessonDate = getNextLessonDate(nextLessonPosition)
    timeToNextLesson = formatDistanceStrict(nextLessonDate, new Date(), {
      locale: ru,
      roundingMethod: 'floor',
    })
  }

  const nextSubject = nextLesson ? subjectsQuery.data.find((s) => s.id === nextLesson.subjectId) : null
  const nextSubjectTutor = tutorsQuery.data.find((t) => t.id === nextSubject?.tutorId)

  return (
    <View {...props} className={cn(props.className)}>
      <Link asChild href={`/(tabs)/schedules/${schedule.id}`}>
        <Pressable>
          <View className='bg-neutral-900 px-4 rounded-3xl pt-7'>
            <View className='self-center -translate-y-4 rounded-full bg-neutral-900 max-w-[75%] py-2 px-4 absolute'>
              <Text className='dark:text-neutral-500 line-clamp-1 max-w-64 align-middle'>{schedule.name}</Text>
            </View>
            {nextLesson ? (
              <>
                <View className='mb-6'>
                  {nextSubject ? (
                    <>
                      <Text className='text-xl text-center'>{nextSubject.name}</Text>
                      <Text className='dark:text-neutral-500 text-center'>{nextSubjectTutor ? `${nextSubjectTutor.surname} ${nextSubjectTutor.name} ${nextSubjectTutor.middlename}` : 'Преподаватель не указан'}</Text>
                    </>
                  ) : (
                    <>
                      <Text className='text-center'>Предмет не указан</Text>
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
                    <Text className='text-xl line-clamp-1'>{timeToNextLesson ?? '?'}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View>
                <Text className='text-center'> </Text>
              </View>
            )}
          </View>
          <View className='border-b border-x border-neutral-900 pt-10 pb-4 -mt-6 rounded-b-3xl px-4'>
            {nextLessonPosition ? (
              schedule.days[nextLessonPosition.dayIndex].lessons.map((lesson, i) => {
                const subject = subjectsQuery.data.find((s) => s.id === lesson.subjectId)
                const next = i === nextLessonPosition.index

                return (
                  <View key={lesson.id} className='flex-row items-center'>
                    <Text className={cn('flex-1 line-clamp-1', next ? 'dark:text-indigo-500' : subject ? 'dark:text-neutral-200' : 'dark:text-neutral-500')}>{subject ? subject.name : ' '}</Text>
                    {lesson.place && <Text className={cn('font-mono flex-1 text-right', next ? 'dark:text-indigo-500' : 'dark:text-neutral-500 ')}>{lesson.place}</Text>}
                  </View>
                )
              })
            ) : (
              <View>
                <Text> </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Link>
    </View>
  )
}
