import Text from '@/components/text'
import { queryKeys } from '@/query'
import { querySchedules } from '@/schedule'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { Link } from 'expo-router'
import { LucideSearch } from 'lucide-react-native'
import { FlatList, Pressable, ScrollView, TextInput, View } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'
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
      <Text className='mx-4 text-4xl mt-16 mb-4 font-sans-bold'>Расписания</Text>
      <Text className='font-sans dark:text-neutral-500 mx-4 mb-6'>Ищите расписание своей группы по предметам, кабинетам или преподавателям</Text>
      <View className='mx-4'>
        <TextInput
          defaultValue={snap.search}
          onChange={({ nativeEvent: { text } }) => {
            store.search = text.trim()
          }}
          selectionColor={neutral[700]}
          selectionHandleColor={indigo[500]}
          placeholder='СПСТЭД:511-21'
          className='text-neutral-200 text-lg font-sans border p-4 border-neutral-800 rounded-md focus:border-indigo-500 caret-indigo-500 placeholder:text-neutral-500'
        />
        <LucideSearch strokeWidth={1} className='absolute text-neutral-500 size-7 right-4 top-1/2 -translate-y-1/2' />
      </View>
      {/*  */}
      <FlatList
        scrollEnabled={false}
        data={schedulesQuery.data ?? []}
        renderItem={({ item: schedule }) => (
          <Link asChild href={`/(tabs)/schedules/${schedule.id}`}>
            <Pressable className='bg-neutral-950 px-6 py-4 flex-row items-center' android_ripple={{ color: neutral[700] }}>
              <View className='flex-1 mr-4'>
                <Text className='mb-2 line-clamp-1 mr-auto text-lg'>{schedule.name}</Text>
                <View className='flex-row gap-2 mb-3'>
                  <Text className='align-middle px-2 py-1 border border-neutral-700 rounded-md'>{schedule._count.days} дней</Text>
                  <Text className='align-middle px-2 py-1 border border-neutral-700 rounded-md'>{schedule.days.map((d) => d._count.lessons).reduce((l, r) => l + r)} пар</Text>
                </View>
                <Text className='dark:text-neutral-500'>
                  Обновлено {format(schedule.updatedAt, 'd MMMM yyyy', { locale: ru })} в {format(schedule.updatedAt, 'HH:mm')}
                </Text>
              </View>
              {/* <LucideEdit strokeWidth={1} className='color-neutral-500 size-6' /> */}
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
