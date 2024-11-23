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
  // const x = useSharedValue(0)
  // const xSlow = useDerivedValue(() => x.value * 0.5)
  // const drag = Gesture.Pan()
  //   .onChange((e) => {
  //     // console.log('total x', e.translationX)
  //     // console.log('change x', e.changeX)
  //     x.value = e.translationX
  //   })
  //   .onEnd((e) => {
  //     x.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) })
  //   })

  return (
    <ScrollView overScrollMode='never'>
      <Link asChild href={'/(tabs)/publishing/tutors/create'}>
        <Pressable android_ripple={{ color: neutral[600] }} className='bg-neutral-950 py-8 px-6'>
          <LucideUserRoundPlus strokeWidth={1} className='color-neutral-500 size-12 self-center mb-4' />
          <Text className='dark text-center text-lg'>Добавить преподавателя</Text>
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
        renderItem={(tutor) => (
          <Link asChild href={`/(tabs)/publishing/tutors/${tutor.item.id}`}>
            <Pressable className='bg-neutral-950 px-6 py-4 flex-row items-center' android_ripple={{ color: neutral[800] }}>
              <Text className='mr-auto'>
                {tutor.item.rank && <Text className='dark:text-neutral-500'>({ranksInfo[tutor.item.rank as Rank].short})</Text>} {tutor.item.surname} {tutor.item.name} {tutor.item.middlename}
              </Text>
              <LucideEdit strokeWidth={1} className='color-neutral-500 size-6' />
            </Pressable>
          </Link>
        )}
      />
    </ScrollView>
  )
}
