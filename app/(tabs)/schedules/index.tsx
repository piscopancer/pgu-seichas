import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { queryKeys } from '@/query'
import { querySchedules } from '@/schedule'
import { cn } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { Link } from 'expo-router'
import { LucideCalendarDays, LucideCalendarSearch, LucideSearch } from 'lucide-react-native'
import { FlatList, Pressable, ScrollView, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'
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
      <View className='mx-4 mb-4'>
        <TextInput
          defaultValue={snap.search}
          onChange={({ nativeEvent: { text } }) => {
            store.search = text.trim()
          }}
          placeholder='СПСТЭД:511-21'
        />
        <LucideSearch strokeWidth={1} className='absolute text-neutral-500 size-7 right-4 top-1/2 -translate-y-1/2' />
      </View>
      <View className='flex-row mx-6 mb-4'>
        <LucideCalendarDays strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{schedulesQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={schedulesQuery.data ?? []}
        ItemSeparatorComponent={() => <View className='border-b border-neutral-800 mx-6' />}
        renderItem={({ item: schedule }) => (
          <Link asChild href={`/(tabs)/schedules/${schedule.id}`}>
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
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
