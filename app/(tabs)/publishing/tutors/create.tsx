import { useSheetRef } from '@/components/bottom-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import TutorRankSheet from '@/components/tutor-rank-sheet'
import { db } from '@/db'
import { Rank, ranksInfo, tutorSchema } from '@/tutor'
import { capitalizeFirstLetter, cn } from '@/utils'
import { store } from '@davstack/store'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, ToastAndroid } from 'react-native'
import { indigo } from 'tailwindcss/colors'

const tutorStore = store<Prisma.TutorCreateInput>({
  name: '',
  surname: '',
  middlename: '',
})

export default function CreateTutor() {
  const tutorSnap = tutorStore.use()
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
        {/* <Text
          onPress={() =>
            console.log(
              tutorStore.assign({
                rank: 'professor' satisfies Rank,
              })
            )
          }
        >
          CLICK ME LOL
        </Text> */}
        <Text className='mt-12 mb-2 ml-11 dark:text-neutral-500'>Фамилия</Text>
        <TextInput className='mb-4 mx-6' onChange={({ nativeEvent: { text } }) => tutorStore.surname.set(text.trim())} />
        <Text className='mb-2 ml-11 dark:text-neutral-500'>Имя</Text>
        <TextInput onChange={({ nativeEvent: { text } }) => tutorStore.name.set(text.trim())} className='mb-4 mx-6' />
        <Text className='mb-2 ml-11 dark:text-neutral-500'>Отчество</Text>
        <TextInput onChange={({ nativeEvent: { text } }) => tutorStore.middlename.set(text.trim())} className='mb-4 mx-6' />
        <Text className='mb-2 ml-11 dark:text-neutral-500'>Должность</Text>
        <Pressable onPress={() => rankSheetRef.current?.expand()} className='border rounded-md border-neutral-800 px-5 py-4 mx-6 mb-8'>
          <Text className={cn('text-lg', tutorSnap.rank ? '' : 'dark:text-neutral-500')}>{tutorSnap.rank ? capitalizeFirstLetter(ranksInfo[tutorSnap.rank as Rank].long) : 'Не указана'}</Text>
        </Pressable>
        <TutorRankSheet
          ref={rankSheetRef}
          onSelect={(rank) => {
            tutorStore.assign({
              rank,
            })
          }}
        />
        <Pressable
          disabled={createTutorMutation.isPending}
          onPress={() => {
            const tutorParseRes = tutorSchema.safeParse(tutorStore.get())
            if (tutorParseRes.success) {
              createTutorMutation.mutateAsync({
                data: tutorParseRes.data,
              })
            } else {
              const errorMsg = tutorParseRes.error.issues.map((i) => i.message).join('\n')
              ToastAndroid.show(errorMsg, ToastAndroid.SHORT)
            }
          }}
          className='mb-12 mx-6 py-4 px-6 bg-indigo-500 rounded-md'
          android_ripple={{ color: indigo[300] }}
        >
          <Text className='text-center text-lg font-sans-bold'>Добавить</Text>
        </Pressable>
      </>
    </ScrollView>
  )
}
