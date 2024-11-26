import { getNextLessonIndex, maxLessons } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { cn, zonedDate } from '@/utils'
import { LucideBed, LucideCake, LucideChevronDown, LucideChevronUp, LucideIcon, LucideUtensils } from 'lucide-react-native'
import { Fragment, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSnapshot } from 'valtio'
import Switch from '../switch'
import Text from '../text'
import Lesson from './lesson'

function getOverlay(holiday: boolean, independentWorkDay: boolean): { icon: LucideIcon; text: string } | undefined {
  if (holiday) return { icon: LucideCake, text: 'Праздничный день' }
  if (independentWorkDay) return { icon: LucideBed, text: 'День самостоятельной работы' }
}

type WeekdayProps = {
  day: ScheduleStore['days'][number]
  weekday: string
  dayI: number
}

export default function Weekday({ day, weekday, dayI }: WeekdayProps) {
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
