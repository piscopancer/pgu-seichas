import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { queryKeys } from '@/query'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { LucideBookCopy, LucideBookPlus, LucideEdit } from 'lucide-react-native'
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
        <Pressable android_ripple={{ color: neutral[700] }} className='bg-neutral-950 py-4 px-6 flex-row items-center'>
          <LucideBookPlus strokeWidth={1} className='color-neutral-600 size-8 mr-5' />
          <Text className='text-lg'>Добавить предмет</Text>
        </Pressable>
      </Link>
      <TextInput className='m-4' placeholder='Поиск...' />
      <View className='flex-row mx-6 mb-4'>
        <LucideBookCopy strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{subjectsQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={subjectsQuery.data ?? []}
        renderItem={({ item: subject }) => (
          <Link asChild href={`/(tabs)/publishing/subjects/${subject.id}`}>
            <Pressable className='bg-neutral-950 px-6 py-4 flex-row items-center' android_ripple={{ color: neutral[700] }}>
              <View className='flex-1 mr-4'>
                <Text className='mb-1 line-clamp-1 mr-auto text-lg'>{subject.name}</Text>
                <Text className='dark:text-neutral-500'>{subject.tutor ? `${subject.tutor.surname} ${subject.tutor.name[0]}. ${subject.tutor.middlename[0]}.` : 'Преподаватель не назначен'}</Text>
              </View>
              <LucideEdit strokeWidth={1} className='color-neutral-500 size-6' />
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
