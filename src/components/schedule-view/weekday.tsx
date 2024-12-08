import { useDeviceStore } from '@/device-store'
import { maxLessons, Schedule } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { cn } from '@/utils'
import { LucideBed, LucideCake, LucideChevronDown, LucideChevronUp, LucideIcon } from 'lucide-react-native'
import { Fragment, useContext, useState } from 'react'
import { Pressable, View } from 'react-native'
import Switch from '../switch'
import Text from '../text'
import { LessonEdit, LessonView } from './lesson'
import { scheduleContext } from './shared'

function getOverlay(holiday: boolean, independentWorkDay: boolean): { icon: LucideIcon; text: string } | undefined {
  if (holiday) return { icon: LucideCake, text: 'Праздничный день' }
  if (independentWorkDay) return { icon: LucideBed, text: 'День самостоятельной работы' }
}

type Shared = {
  weekday: string
  dayIndex: number
}

export function WeekdayEdit({ dayIndex, weekday }: Shared) {
  const { scheduleStore } = useContext(scheduleContext)
  const getDay = () => scheduleStore!.useDay(dayIndex)

  return (
    <Weekday
      mode='edit'
      getDay={getDay}
      dayIndex={dayIndex}
      weekday={weekday}
      onHolidayChanged={(current) => {
        scheduleStore!.updateDay(dayIndex)({
          holiday: !current,
        })
        return !current
      }}
      onIndependentWorkDayChanged={(current) => {
        scheduleStore!.updateDay(dayIndex)({
          independentWorkDay: !current,
        })
        return !current
      }}
    />
  )
}

export function WeekdayView({ getDay, dayIndex, weekday }: Shared & { getDay: () => Schedule['days'][number] }) {
  return <Weekday mode='view' getDay={() => getDay} dayIndex={dayIndex} weekday={weekday} />
}

type WeekdayProps = (
  | {
      mode: 'edit'
      getDay: () => () => ScheduleStore['schedule']['days'][number]
      onHolidayChanged: (current: boolean) => boolean
      onIndependentWorkDayChanged: (current: boolean) => boolean
    }
  | {
      mode: 'view'
      getDay: () => () => Schedule['days'][number]
    }
) &
  Shared

function Weekday(props: Shared & WeekdayProps) {
  const day = props.getDay()()
  const overlay = getOverlay(!!day.holiday, !!day.independentWorkDay)
  const [collapsed, setCollapsed] = useState(false)
  const CollapsedIcon = collapsed ? LucideChevronDown : LucideChevronUp
  const [scheduleView] = useDeviceStore('scheduleViewMode')

  return (
    <View>
      {scheduleView === 'list' && (
        <Pressable onPress={() => setCollapsed((prev) => !prev)}>
          <CollapsedIcon className='absolute top-1/2 -translate-y-1/2 left-8 size-6 color-neutral-500' />
          <Text className='px-4 text-2xl text-center my-8 uppercase'>{props.weekday}</Text>
        </Pressable>
      )}
      <View className={cn(collapsed ? 'hidden' : '')}>
        {props.mode === 'edit' && (
          <>
            <View className='flex-row items-center px-4 mb-4'>
              <Text className='mr-auto text-lg'>Праздничный день</Text>
              <Switch action={props.onHolidayChanged} enabled={day.holiday === true} />
            </View>
            <View className='flex-row items-center px-4 mb-6'>
              <Text className='mr-auto text-lg'>День самостоятельной работы</Text>
              <Switch action={props.onIndependentWorkDayChanged} enabled={day.independentWorkDay === true} />
            </View>
          </>
        )}
        <View>
          {overlay && (
            <View className='top-0 right-0 bottom-0 left-0 absolute justify-center items-center'>
              <overlay.icon strokeWidth={1} className='mb-4 size-20 color-indigo-500' />
              <Text className='text-lg'>{overlay.text}</Text>
            </View>
          )}
          <View className={cn('gap-3', overlay && 'opacity-50 pointer-events-none')}>
            {Array.from({ length: maxLessons }).map((_, lessonI) => {
              return (
                <Fragment key={lessonI}>
                  {props.mode === 'edit' && <LessonEdit dayIndex={props.dayIndex} lessonIndex={lessonI} />}
                  {props.mode === 'view' && <LessonView lesson={day.lessons[lessonI] as Schedule['days'][number]['lessons'][number]} dayIndex={props.dayIndex} lessonIndex={lessonI} />}
                  {lessonI === 1 && <View className='rounded-full bg-neutral-800 w-20 self-center h-1 my-1' />}
                </Fragment>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}
