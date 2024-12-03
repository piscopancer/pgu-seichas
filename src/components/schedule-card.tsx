import Text from '@/components/text'
import { useDeviceStore } from '@/device-store'
import { ScheduleForCard, ScheduleViewMode } from '@/schedule'
import { cn } from '@/utils'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { Href, Link } from 'expo-router'
import { LucideEdit3 } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'

export default function ScheduleCard({ schedule, mode }: { schedule: ScheduleForCard; mode: ScheduleViewMode }) {
  const [selectedScheduleId] = useDeviceStore('selectedScheduleId')
  const href = (
    {
      edit: `/(tabs)/publishing/schedules/${schedule.id}`,
      view: `/(tabs)/schedules/${schedule.id}`,
    } satisfies Record<typeof mode, Href>
  )[mode]

  return (
    <Link asChild href={href}>
      <Pressable className='bg-neutral-950 px-6 py-4 flex-row items-center' android_ripple={{ color: neutral[700] }}>
        <View className='flex-1 mr-4'>
          <Text className='mb-3 line-clamp-1 mr-auto text-xl'>{schedule.name}</Text>
          <View className='flex-row gap-2 mb-3'>
            <View className='flex-row h-6'>
              {schedule.days.map((d, i) => (
                <View key={i} style={{ marginLeft: 10 * i }} className={cn('absolute size-6 rounded-full border-2 border-neutral-950', d._count.lessons ? 'bg-indigo-500' : 'bg-indigo-800')} />
              ))}
            </View>
          </View>
          <Text className='dark:text-neutral-500'>Обновлено {formatDistanceToNow(schedule.updatedAt, { locale: ru, addSuffix: true })}</Text>
        </View>
        {mode === 'edit' && <LucideEdit3 strokeWidth={1} className='color-neutral-500' />}
        {selectedScheduleId === schedule.id && <View className='left-0 h-full w-1.5 absolute rounded-r-full bg-indigo-500' />}
      </Pressable>
    </Link>
  )
}
