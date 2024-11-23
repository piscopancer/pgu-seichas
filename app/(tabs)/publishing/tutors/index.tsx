import Text from '@/components/text'
import TextInput from '@/components/text-input'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { Rank, ranksInfo } from '@/tutor'
import { Link } from 'expo-router'
import { LucideEdit, LucideUserRoundPlus, LucideUsersRound } from 'lucide-react-native'
import { FlatList, Pressable, ScrollView, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'

export default function TutorsScreen() {
  const allTutorsQuery = useTutorsQuery()

  return (
    <ScrollView overScrollMode='never'>
      <Link asChild href={'/(tabs)/publishing/tutors/create'}>
        <Pressable android_ripple={{ color: neutral[700] }} className='bg-neutral-950 py-4 px-6 flex-row items-center'>
          <LucideUserRoundPlus strokeWidth={1} className='color-neutral-600 size-8 mr-5' />
          <Text className='text-lg'>Добавить преподавателя</Text>
        </Pressable>
      </Link>
      <TextInput className='m-4' placeholder='Поиск...' />
      <View className='flex-row mx-6 mb-4'>
        <LucideUsersRound strokeWidth={1} className='size-5 mr-2 color-neutral-500' />
        <Text>{allTutorsQuery.data?.length ?? '...'}</Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={allTutorsQuery.data ?? []}
        renderItem={({ item: tutor }) => (
          <Link asChild href={`/(tabs)/publishing/tutors/${tutor.id}`}>
            <Pressable className='bg-neutral-950 px-6 py-4 flex-row items-center' android_ripple={{ color: neutral[700] }}>
              <View className='mr-auto'>
                <Text className='text-lg mb-2'>
                  {tutor.surname}{' '}
                  <Text className='dark:text-neutral-500'>
                    {tutor.name} {tutor.middlename}
                  </Text>
                </Text>
                <View className='flex-row gap-2'>
                  <Text className='align-middle px-2 py-1 border border-neutral-700 rounded-md'>{tutor.rank ? ranksInfo[tutor.rank as Rank].short : 'Должность не указана'}</Text>
                  <Text className='align-middle px-2 py-1 border border-neutral-700 rounded-md'>{tutor._count.subjects} предм.</Text>
                </View>
              </View>
              <LucideEdit strokeWidth={1} className='color-neutral-500 size-6' />
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
