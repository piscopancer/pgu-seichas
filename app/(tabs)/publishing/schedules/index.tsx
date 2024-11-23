import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { queryKeys } from '@/query'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'
import { Link } from 'expo-router'
import { LucideCalendarDays, LucideCalendarPlus, LucideEdit } from 'lucide-react-native'
import { FlatList, Pressable, ScrollView, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'

async function querySchedules() {
  return db.schedule.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      days: {
        select: {
          _count: {
            select: {
              lessons: {
                where: {
                  subject: { isNot: null },
                },
              },
            },
          },
        },
      },
    },
  })
}

export default function SchedulesScreen() {
  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules,
    queryFn: querySchedules,
  })

  return (
    <ScrollView overScrollMode='never'>
      <Link asChild href={'/(tabs)/publishing/schedules/create'}>
        <Pressable android_ripple={{ color: neutral[700] }} className='bg-neutral-950 py-4 px-6 flex-row items-center'>
          <LucideCalendarPlus strokeWidth={1} className='color-neutral-600 size-8 mr-5' />
          <Text className='text-lg'>Добавить расписание</Text>
        </Pressable>
      </Link>
      <TextInput className='m-4' placeholder='Поиск...' />
      <View className='flex-row mx-6 mb-4'>
        <LucideCalendarDays strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{schedulesQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={schedulesQuery.data ?? []}
        renderItem={({ item: schedule }) => (
          <Link asChild href={`/(tabs)/publishing/subjects/${schedule.id}`}>
            <Pressable className='bg-neutral-950 px-6 py-4 flex-row items-center' android_ripple={{ color: neutral[700] }}>
              <View className='flex-1 mr-4'>
                <Text className='mb-2 line-clamp-1 mr-auto text-lg'>{schedule.name}</Text>
                <View className='flex-row gap-2 mb-3'>
                  <Text className='align-middle px-2 py-1 border border-neutral-700 rounded-md'>{schedule.days.length} дней</Text>
                  <Text className='align-middle px-2 py-1 border border-neutral-700 rounded-md'>{schedule.days.map((d) => d._count.lessons).reduce((l, r) => l + r)} пар</Text>
                </View>
                <Text className='dark:text-neutral-500'>
                  Обновлено {format(schedule.updatedAt, 'd MMMM yyyy', { locale: ru })} в {format(schedule.updatedAt, 'HH:mm')}
                </Text>
              </View>
              <LucideEdit strokeWidth={1} className='color-neutral-500 size-6' />
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
