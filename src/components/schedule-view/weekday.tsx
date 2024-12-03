import { useDeviceStore } from '@/device-store'
import { getNextLessonIndexFromNow, maxLessons, Schedule } from '@/schedule'
import { ScheduleStore } from '@/store/schedule'
import { cn, zonedDate } from '@/utils'
import { LucideBed, LucideCake, LucideChevronDown, LucideChevronUp, LucideIcon, LucideSoup } from 'lucide-react-native'
import { Fragment, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSnapshot } from 'valtio'
import Switch from '../switch'
import Text from '../text'
import { LessonEdit, LessonView } from './lesson'

function getOverlay(holiday: boolean, independentWorkDay: boolean): { icon: LucideIcon; text: string } | undefined {
  if (holiday) return { icon: LucideCake, text: 'Праздничный день' }
  if (independentWorkDay) return { icon: LucideBed, text: 'День самостоятельной работы' }
}

type WeekdayProps = (
  | {
      mode: 'edit'
      onHolidayChanged: (current: boolean) => boolean
      onIndependentWorkDayChanged: (current: boolean) => boolean
      dayStore: ScheduleStore['days'][number]
    }
  | {
      mode: 'view'
    }
) &
  SharedWeekdayProps

type SharedWeekdayProps = (
  | {
      mode: 'edit'
      day: ScheduleStore['days'][number]
    }
  | {
      mode: 'view'
      day: Schedule['days'][number]
    }
) & {
  weekday: string
  dayIndex: number
}

export function WeekdayEdit({ day, dayIndex, weekday }: SharedWeekdayProps & { mode: 'edit' }) {
  const daySnap = useSnapshot(day)

  return (
    <Weekday
      mode='edit'
      day={daySnap as typeof day}
      dayStore={day}
      dayIndex={dayIndex}
      weekday={weekday}
      onHolidayChanged={(current) => {
        day.holiday = !current
        return current
      }}
      onIndependentWorkDayChanged={(current) => {
        day.independentWorkDay = !current
        return current
      }}
    />
  )
}

export function WeekdayView({ day, dayIndex, weekday }: SharedWeekdayProps & { mode: 'view' }) {
  return <Weekday mode='view' day={day} dayIndex={dayIndex} weekday={weekday} />
}

function Weekday(props: WeekdayProps) {
  const today = zonedDate().getDay() - 1 === props.dayIndex
  const overlay = getOverlay(!!props.day.holiday, !!props.day.independentWorkDay)
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
              <Switch action={props.onHolidayChanged} enabled={props.day.holiday === true} />
            </View>
            <View className='flex-row items-center px-4 mb-6'>
              <Text className='mr-auto text-lg'>День самостоятельной работы</Text>
              <Switch action={props.onIndependentWorkDayChanged} enabled={props.day.independentWorkDay === true} />
            </View>
          </>
        )}
        <View className='relative'>
          {overlay && (
            <View className='top-0 right-0 bottom-0 left-0 absolute justify-center items-center z-[1]'>
              <overlay.icon strokeWidth={1} className='mb-4 size-20 color-indigo-500' />
              <Text className='text-lg'>{overlay.text}</Text>
            </View>
          )}
          <View className={cn('gap-3', overlay && 'opacity-50 pointer-events-none')}>
            {Array.from({ length: maxLessons }).map((_, lessonI) => {
              const next = today && getNextLessonIndexFromNow() === lessonI
              return (
                <Fragment key={lessonI}>
                  {props.mode === 'edit' && <LessonEdit mode='edit' lesson={props.dayStore.lessons[lessonI]} next={next} dayIndex={props.dayIndex} lessonIndex={lessonI} />}
                  {props.mode === 'view' && <LessonView mode='view' lesson={props.day.lessons[lessonI]} next={next} dayIndex={props.dayIndex} lessonIndex={lessonI} />}
                  {lessonI === 1 && (
                    <View className='z-[1] justify-center items-center'>
                      <View className='absolute border border-neutral-800 bg-neutral-950 size-10 items-center justify-center rounded-xl'>
                        <LucideSoup strokeWidth={1} className='color-neutral-500 size-6' />
                      </View>
                    </View>
                  )}
                </Fragment>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}
