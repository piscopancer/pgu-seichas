import SheetSelect from '@/components/sheet-select'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { Rank, ranksInfo } from '@/tutor'
import { capitalizeFirstLetter, cn, objectEntries } from '@/utils'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'

function createTutor(tutor: Prisma.TutorCreateArgs) {
  return db.tutor.create(tutor)
}

export default function CreateTutor() {
  const [surname, setSurname] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [middlename, setMiddlename] = useState<string>('')
  const [rank, setRank] = useState<Rank | null>(null)
  const router = useRouter()

  const createTutorMutation = useMutation({
    mutationFn: createTutor,
    onSuccess(data) {
      console.log('created', data)
      router.replace('/(tabs)/publishing/tutors')
    },
  })

  return (
    <ScrollView overScrollMode='never'>
      <>
        <Text className='mt-12 mb-2 ml-9 dark:text-neutral-500'>Фамилия</Text>
        <TextInput placeholder='Фамилия' className='mb-4 mx-4' onChange={(e) => setSurname(e.nativeEvent.text)} />
        <Text className='mb-2 ml-9 dark:text-neutral-500'>Имя</Text>
        <TextInput onChange={(e) => setName(e.nativeEvent.text)} placeholder='Имя' className='mb-4 mx-4' />
        <Text className='mb-2 ml-9 dark:text-neutral-500'>Отчество</Text>
        <TextInput onChange={(e) => setMiddlename(e.nativeEvent.text)} placeholder='Отчество' className='mb-4 mx-4' />
        <Text className='mb-2 ml-9 dark:text-neutral-500'>Должность</Text>
        <SheetSelect
          options={objectEntries(ranksInfo)}
          pressableProps={{
            className: 'mb-12 mx-4 border rounded-md border-neutral-800 px-5 py-4 bg-neutral-950',
            android_ripple: { color: neutral[800] },
          }}
          renderOption={({ item: [rank, info] }, setOpen) => (
            <Pressable
              onPress={() => {
                setOpen(false)
              }}
              android_ripple={{ color: neutral[700] }}
              className='py-4'
            >
              <Text className='text-lg text-center'>{capitalizeFirstLetter(info.long)}</Text>
            </Pressable>
          )}
        >
          <Text className={cn('text-lg', rank ? '' : 'dark:text-neutral-500')}>{rank ? capitalizeFirstLetter(ranksInfo[rank].long) : 'Нет должности'}</Text>
        </SheetSelect>
        <Pressable
          disabled={createTutorMutation.isPending}
          onPress={() => {
            createTutorMutation.mutateAsync({
              data: {
                name,
                surname,
                middlename,
                rank,
              },
            })
          }}
          className='mb-12 mx-4 py-4 px-6 bg-indigo-500 rounded-md'
          android_ripple={{ color: indigo[300] }}
        >
          <Text className='text-center text-lg font-sans-bold'>Создать</Text>
        </Pressable>
        <Text className='dark:text-neutral-500 text-xs'>{JSON.stringify({ name, surname, middlename, rank }, null, 2)}</Text>
      </>
    </ScrollView>
  )
}
