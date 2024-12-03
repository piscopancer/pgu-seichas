import ScheduleCard from '@/components/schedule-card'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { queryKeys } from '@/query'
import { querySchedules } from '@/schedule'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { LucideCalendarDays, LucideCalendarPlus, LucideSearch } from 'lucide-react-native'
import { FlatList, Pressable, ScrollView, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'

export default function SchedulesScreen() {
  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules(),
    queryFn: () => querySchedules(),
  })

  return (
    <ScrollView overScrollMode='never'>
      <Link asChild href={'/(tabs)/publishing/schedules/create'}>
        <Pressable android_ripple={{ color: neutral[700] }} className='bg-neutral-950 py-4 px-6 flex-row items-center mt-4'>
          <LucideCalendarPlus strokeWidth={1} className='color-neutral-600 size-8 mr-5' />
          <Text className='text-lg'>Добавить расписание</Text>
        </Pressable>
      </Link>
      <View className='my-4 mx-6 items-center flex-row'>
        <TextInput placeholder='Поиск...' className='flex-1' />
        <LucideSearch strokeWidth={1} className='color-neutral-500 absolute right-5' />
      </View>
      <View className='flex-row mx-6 mb-4'>
        <LucideCalendarDays strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{schedulesQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList scrollEnabled={false} data={schedulesQuery.data ?? []} renderItem={({ item: schedule }) => <ScheduleCard mode='edit' schedule={schedule} />} ItemSeparatorComponent={() => <View className='border-b border-neutral-800 mx-6' />} />
    </ScrollView>
  )
}
