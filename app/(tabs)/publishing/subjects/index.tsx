import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { queryKeys } from '@/query'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { LucideBookCopy, LucideBookPlus, LucideEdit3, LucideSearch } from 'lucide-react-native'
import { FlatList, Pressable, ScrollView, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'

async function querySubjects() {
  return db.subject.findMany({
    select: {
      id: true,
      name: true,
      tutor: {
        select: {
          id: true,
          name: true,
          surname: true,
          middlename: true,
          rank: true,
        },
      },
    },
  })
}

export default function SubjectsScreen() {
  const subjectsQuery = useQuery({
    queryKey: queryKeys.subjects,
    queryFn: querySubjects,
  })

  return (
    <ScrollView overScrollMode='never'>
      <Link asChild href={'/(tabs)/publishing/subjects/create'}>
        <Pressable android_ripple={{ color: neutral[700] }} className='bg-neutral-950 py-4 px-6 flex-row items-center mt-4'>
          <LucideBookPlus strokeWidth={1} className='color-neutral-600 size-8 mr-5' />
          <Text className='text-lg'>Добавить предмет</Text>
        </Pressable>
      </Link>
      <View className='my-4 mx-6 items-center flex-row'>
        <TextInput placeholder='Поиск...' className='flex-1' />
        <LucideSearch strokeWidth={1} className='color-neutral-500 absolute right-5' />
      </View>
      <View className='flex-row mx-6 mb-4'>
        <LucideBookCopy strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{subjectsQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={subjectsQuery.data ?? []}
        ItemSeparatorComponent={() => <View className='border-b border-neutral-800 mx-4' />}
        renderItem={({ item: subject }) => (
          <Link asChild href={`/(tabs)/publishing/subjects/${subject.id}`}>
            <Pressable className='bg-neutral-950 px-6 pt-4 pb-5 flex-row items-center' android_ripple={{ color: neutral[700] }}>
              <View className='flex-1 mr-4'>
                <Text className='line-clamp-1 mr-auto text-lg'>{subject.name}</Text>
                <Text className='dark:text-neutral-500 text-lg'>{subject.tutor ? `${subject.tutor.surname} ${subject.tutor.name[0]}. ${subject.tutor.middlename[0]}.` : 'Преподаватель не указан'}</Text>
              </View>
              <LucideEdit3 strokeWidth={1} className='color-neutral-500 size-6' />
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
