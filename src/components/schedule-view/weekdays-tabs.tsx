import { Schedule, weekdays } from '@/schedule'
import { cn, colors, getDayOfWeekIndex } from '@/utils'
import { Portal } from '@gorhom/portal'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import Text from '../text'
import { WeekdayEdit, WeekdayView } from './weekday'

type P =
  | {
      mode: 'edit'
    }
  | {
      mode: 'view'
      schedule: Schedule
    }

export default function WeekdaysTabs(props: P) {
  const todayIndex = getDayOfWeekIndex()
  const [dayIndex, setDayIndex] = useState(todayIndex === 6 ? 0 : todayIndex)
  const weekday = weekdays[dayIndex]

  return (
    <>
      {props.mode === 'edit' ? <WeekdayEdit weekday={weekday} dayIndex={dayIndex} /> : <WeekdayView getDay={() => props.schedule.days[dayIndex]} weekday={weekday} dayIndex={dayIndex} />}
      <Portal hostName='weekdays-tabs'>
        <View className='bg-neutral-900 flex-row gap-2 p-2 rounded-xl mx-12 absolute bottom-8 z-[1]'>
          {weekdays.map((_, i) => (
            <Pressable
              android_ripple={{ color: i === dayIndex ? colors.indigo[400] : colors.neutral[700] }}
              disabled={i === dayIndex}
              key={i}
              onPress={() => setDayIndex(i)}
              className={cn('flex-1 rounded-md aspect-square items-center justify-center', i === dayIndex ? 'bg-indigo-500' : i === todayIndex ? 'bg-neutral-800' : '')}
            >
              <Text className={cn('text-xl')}>{i + 1}</Text>
            </Pressable>
          ))}
        </View>
      </Portal>
    </>
  )
}
