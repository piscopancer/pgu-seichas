// import SheetSelect from '@/components/sheet-select'
import SheetSelect from '@/components/sheet-select'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { queryKeys } from '@/query'
import { Rank, ranksInfo } from '@/tutor'
import { capitalizeFirstLetter, cn, objectEntries } from '@/utils'
import { Prisma } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'

async function queryTutor(id: number) {
  return db.tutor.findFirst({
    where: {
      id,
    },
  })
}

async function updateTutor(updated: Prisma.TutorUpdateArgs) {
  return db.tutor.update(updated)
}

export default function TutorScreen() {
  const { id: tutorId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const tutorQuery = useQuery({
    queryKey: queryKeys.tutor(Number(tutorId)),
    queryFn: () => queryTutor(Number(tutorId)),
  })
  const updateTutorMutation = useMutation({
    mutationFn: updateTutor,
    onError(e) {
      console.error(e)
    },
    async onSuccess(data) {
      console.log('tutor updated', data)
      await tutorQuery.refetch()
      router.back()
    },
  })
  const [changedSurname, setChangedSurname] = useState<string | undefined>()
  const [changedName, setChangedName] = useState<string | undefined>()
  const [changedMiddlename, setChangedMiddlename] = useState<string | undefined>()
  const [changedRank, setChangedRank] = useState<Rank | undefined>()

  return (
    <ScrollView overScrollMode='never'>
      {tutorQuery.data ? (
        <>
          <Text className='mt-12 mb-2 ml-9 dark:text-neutral-500'>Фамилия</Text>
          <TextInput
            defaultValue={tutorQuery.data.surname}
            placeholder={tutorQuery.data.surname}
            className='mb-4 mx-4'
            onChange={(e) => {
              const text = e.nativeEvent.text
              setChangedSurname(text === tutorQuery.data?.surname ? undefined : text)
            }}
          />
          <Text className='mb-2 ml-9 dark:text-neutral-500'>Имя</Text>
          <TextInput
            defaultValue={tutorQuery.data.name}
            placeholder={tutorQuery.data.name}
            onChange={(e) => {
              const text = e.nativeEvent.text
              setChangedName(text === tutorQuery.data?.name ? undefined : text)
            }}
            className='mb-4 mx-4'
          />
          <Text className='mb-2 ml-9 dark:text-neutral-500'>Отчество</Text>
          <TextInput
            defaultValue={tutorQuery.data.middlename}
            placeholder={tutorQuery.data.middlename}
            onChange={(e) => {
              const text = e.nativeEvent.text
              setChangedMiddlename(text === tutorQuery.data?.middlename ? undefined : text)
            }}
            className='mb-4 mx-4'
          />
          <Text className='mb-2 ml-9 dark:text-neutral-500'>Должность</Text>
          <SheetSelect
            options={objectEntries(ranksInfo)}
            pressableProps={{
              className: 'mb-12 mx-4 border rounded-md border-neutral-800 px-5 py-4 bg-neutral-950',
              android_ripple: { color: neutral[800] },
            }}
            onUnselect={() => setChangedRank(undefined)}
            renderOption={({ item: [rank, info] }, setOpen) => (
              <Pressable
                onPress={() => {
                  setChangedRank(rank)
                  setOpen(false)
                }}
                android_ripple={{ color: neutral[700] }}
                className='py-4'
              >
                <Text className='text-lg text-center'>{capitalizeFirstLetter(info.long)}</Text>
              </Pressable>
            )}
          >
            <Text className={cn('text-lg', tutorQuery.data.rank ? '' : 'dark:text-neutral-500')}>{tutorQuery.data.rank ? capitalizeFirstLetter(ranksInfo[tutorQuery.data.rank as Rank].long) : 'Нет должности'}</Text>
          </SheetSelect>
          <Pressable
            onPress={() => {
              if (tutorQuery.data) {
                setChangedSurname(tutorQuery.data.surname)
                setChangedName(tutorQuery.data.name)
                setChangedMiddlename(tutorQuery.data.middlename)
                setChangedRank((tutorQuery.data.rank as Rank | null) ?? undefined)
              }
            }}
            className='mb-4 mx-4 py-4 px-6 bg-neutral-900 rounded-md'
            android_ripple={{ color: neutral[800] }}
          >
            <Text className='text-center text-lg'>Сбросить</Text>
          </Pressable>
          <Pressable
            disabled={updateTutorMutation.isPending}
            onPress={() => {
              if (!tutorQuery.data) return
              updateTutorMutation.mutate({
                where: {
                  id: Number(tutorId),
                },
                data: {
                  // todo - fix prisma skip resolves to undefined
                  surname: changedSurname ?? Prisma.skip,
                  name: changedName ?? Prisma.skip,
                  middlename: changedMiddlename ?? Prisma.skip,
                  rank: changedRank ?? Prisma.skip,
                },
              })
            }}
            className='mb-12 mx-4 py-4 px-6 bg-indigo-500 rounded-md'
            android_ripple={{ color: indigo[300] }}
          >
            <Text className='text-center text-lg font-sans-bold'>Сохранить</Text>
          </Pressable>
          <Text className='dark:text-neutral-500 text-xs'>{JSON.stringify({ name: changedName, surname: changedSurname, middlename: changedMiddlename, rank: changedRank }, null, 2)}</Text>
        </>
      ) : null}
    </ScrollView>
  )
}
