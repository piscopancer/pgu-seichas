import ScheduleCard from '@/components/schedule-card'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { queryKeys } from '@/query'
import { querySchedules } from '@/schedule'
import { useQuery } from '@tanstack/react-query'
import { LucideCalendarDays, LucideCalendarSearch, LucideSearch } from 'lucide-react-native'
import { FlatList, ScrollView, View } from 'react-native'
import { proxy, useSnapshot } from 'valtio'

const store = proxy({
  search: '',
})

export default function SchedulesScreen() {
  const snap = useSnapshot(store)
  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules({ search: snap.search }),
    queryFn: () => querySchedules({ search: snap.search }),
  })

  return (
    <ScrollView overScrollMode='never'>
      <LucideCalendarSearch strokeWidth={1} className='mt-12 mb-4 size-20 color-neutral-200 mx-auto' />
      <Text className='text-2xl mb-4 font-sans-bold text-center'>Расписания</Text>
      <Text className='font-sans text-center dark:text-neutral-500 mx-4 mb-6'>Ищите расписание своей группы по предметам, кабинетам или преподавателям</Text>
      <View className='mx-6 mb-4 flex-row items-center'>
        <TextInput
          defaultValue={snap.search}
          onChange={({ nativeEvent: { text } }) => {
            store.search = text.trim()
          }}
          placeholder='Поиск...'
          className='flex-1'
        />
        <LucideSearch strokeWidth={1} className='absolute text-neutral-500 right-5' />
      </View>
      <View className='flex-row mx-6 mb-4'>
        <LucideCalendarDays strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{schedulesQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList scrollEnabled={false} data={schedulesQuery.data ?? []} ItemSeparatorComponent={() => <View className='border-b border-neutral-800 mx-6' />} renderItem={({ item: schedule }) => <ScheduleCard mode='view' schedule={schedule} />} />
    </ScrollView>
  )
}
