import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { Rank, ranks, ranksInfo, tutorSchema } from '@/tutor'
import { capitalizeFirstLetter, cn, colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { FlatList, Pressable, ScrollView, ToastAndroid } from 'react-native'
import { indigo } from 'tailwindcss/colors'
import { proxy, useSnapshot } from 'valtio'

const tutorStore = proxy<Prisma.TutorCreateArgs['data']>({
  name: '',
  surname: '',
  middlename: '',
})

export default function CreateTutor() {
  const tutorSnap = useSnapshot(tutorStore)
  const router = useRouter()
  const rankSheetRef = useSheetRef()
  const createTutorMutation = useMutation({
    mutationFn: (tutor: Prisma.TutorCreateArgs) => db.tutor.create(tutor),
    onSuccess() {
      router.replace('/(tabs)/publishing/tutors')
    },
  })

  return (
    <ScrollView overScrollMode='never'>
      <>
        <Text className='mt-12 mb-2 ml-9 dark:text-neutral-500'>Фамилия</Text>
        <TextInput className='mb-4 mx-4' onChange={({ nativeEvent: { text } }) => (tutorStore.surname = text.trim())} />
        <Text className='mb-2 ml-9 dark:text-neutral-500'>Имя</Text>
        <TextInput onChange={({ nativeEvent: { text } }) => (tutorStore.name = text.trim())} className='mb-4 mx-4' />
        <Text className='mb-2 ml-9 dark:text-neutral-500'>Отчество</Text>
        <TextInput onChange={({ nativeEvent: { text } }) => (tutorStore.middlename = text.trim())} className='mb-4 mx-4' />
        <Text className='mb-2 ml-9 dark:text-neutral-500'>Должность</Text>
        <Pressable onPress={() => rankSheetRef.current?.expand()} className='border rounded-md border-neutral-800 px-5 py-4 mx-4 mb-8'>
          <Text className={cn('text-lg', tutorSnap.rank ? '' : 'dark:text-neutral-500')}>{tutorSnap.rank ? capitalizeFirstLetter(ranksInfo[tutorSnap.rank as Rank].long) : 'Не указана'}</Text>
        </Pressable>
        <BottomSheet ref={rankSheetRef}>
          <BottomSheetView>
            <Pressable
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                tutorStore.rank = null
                rankSheetRef.current?.close()
              }}
              className='px-6 py-4 flex-row items-center border-b border-neutral-800'
            >
              <Text className='dark:text-neutral-500 text-lg'>Не указана</Text>
            </Pressable>
            <FlatList
              data={ranks}
              renderItem={({ item: rank }) => (
                <Pressable
                  android_ripple={{ color: colors.neutral[700] }}
                  onPress={() => {
                    tutorStore.rank = rank
                    rankSheetRef.current?.close()
                  }}
                  className='px-6 py-4 flex-row items-center'
                >
                  <Text className='text-lg line-clamp-1'>{capitalizeFirstLetter(ranksInfo[rank].long)}</Text>
                </Pressable>
              )}
            />
          </BottomSheetView>
        </BottomSheet>
        <Pressable
          disabled={createTutorMutation.isPending}
          onPress={() => {
            const tutorParseRes = tutorSchema.safeParse(tutorStore)
            if (tutorParseRes.success) {
              createTutorMutation.mutateAsync({
                data: tutorParseRes.data,
              })
            } else {
              const errorMsg = tutorParseRes.error.issues.map((i) => i.message).join('\n')
              ToastAndroid.show(errorMsg, ToastAndroid.SHORT)
            }
          }}
          className='mb-12 mx-4 py-4 px-6 bg-indigo-500 rounded-md'
          android_ripple={{ color: indigo[300] }}
        >
          <Text className='text-center text-lg font-sans-bold'>Добавить</Text>
        </Pressable>
      </>
    </ScrollView>
  )
}
