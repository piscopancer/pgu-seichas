// import SheetSelect from '@/components/sheet-select'
import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import { qc, queryKeys } from '@/query'
import { Rank, ranks, ranksInfo, tutorSchema } from '@/tutor'
import { capitalizeFirstLetter, cn, colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Prisma } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { FlatList, Pressable, ScrollView, ToastAndroid } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'
import { proxy, useSnapshot } from 'valtio'

async function queryTutor(id: number) {
  return db.tutor.findFirst({
    where: {
      id,
    },
  })
}

const changedStore = proxy<Partial<{ name: string; surname: string; middlename: string; rank: Rank | null }>>({
  name: undefined,
  surname: undefined,
  middlename: undefined,
  rank: undefined,
})

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
    async onSuccess() {
      await qc.invalidateQueries({ queryKey: queryKeys.tutors })
      router.back()
    },
  })
  const changedSnap = useSnapshot(changedStore)
  const rankSheetRef = useSheetRef()

  useEffect(() => {
    return () => {
      changedStore.name = undefined
      changedStore.surname = undefined
      changedStore.middlename = undefined
      changedStore.rank = undefined
    }
  }, [])

  function getRank() {
    const rank = changedSnap.rank === undefined ? (tutorQuery.data?.rank as Rank | null) : changedSnap.rank
    if (!rank) {
      return null
    }
    return capitalizeFirstLetter(ranksInfo[rank].long)
  }

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
              changedStore.surname = text === tutorQuery.data?.surname ? undefined : text
            }}
          />
          <Text className='mb-2 ml-9 dark:text-neutral-500'>Имя</Text>
          <TextInput
            defaultValue={tutorQuery.data.name}
            placeholder={tutorQuery.data.name}
            onChange={(e) => {
              const text = e.nativeEvent.text
              changedStore.name = text === tutorQuery.data?.name ? undefined : text
            }}
            className='mb-4 mx-4'
          />
          <Text className='mb-2 ml-9 dark:text-neutral-500'>Отчество</Text>
          <TextInput
            defaultValue={tutorQuery.data.middlename}
            placeholder={tutorQuery.data.middlename}
            onChange={(e) => {
              const text = e.nativeEvent.text
              changedStore.middlename = text === tutorQuery.data?.middlename ? undefined : text
            }}
            className='mb-4 mx-4'
          />
          <Text className='mb-2 ml-9 dark:text-neutral-500'>Должность</Text>
          {/*  */}
          <Pressable onPress={() => rankSheetRef.current?.expand()} className='border rounded-md border-neutral-800 px-5 py-4 mx-4 mb-8'>
            <Text className={cn('text-lg', getRank() ? '' : 'dark:text-neutral-500')}>{getRank() ?? 'Не указана'}</Text>
          </Pressable>
          <BottomSheet ref={rankSheetRef}>
            <BottomSheetView>
              <Pressable
                android_ripple={{ color: colors.neutral[700] }}
                onPress={() => {
                  changedStore.rank = null
                  rankSheetRef.current?.close()
                }}
                className='px-6 py-4 flex-row items-center border-b border-neutral-800'
              >
                <Text className='text-lg'>Не указана</Text>
              </Pressable>
              <FlatList
                data={ranks}
                renderItem={({ item: rank }) => (
                  <Pressable
                    android_ripple={{ color: colors.neutral[700] }}
                    onPress={() => {
                      changedStore.rank = (tutorQuery.data!.rank as Rank | null) === rank ? undefined : rank
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
            onPress={() => {
              if (tutorQuery.data) {
                changedStore.name = tutorQuery.data.name
                changedStore.surname = tutorQuery.data.surname
                changedStore.middlename = tutorQuery.data.middlename
                changedStore.rank = (tutorQuery.data.rank as Rank | null) ?? undefined
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
              const tutorParseRes = tutorSchema.safeParse({
                name: changedStore.name ?? tutorQuery.data.name,
                surname: changedStore.surname ?? tutorQuery.data.surname,
                middlename: changedStore.middlename ?? tutorQuery.data.middlename,
                rank: changedStore.rank !== undefined ? changedStore.rank : (tutorQuery.data.rank as Rank | null),
              } satisfies typeof changedStore)
              if (tutorParseRes.success) {
                updateTutorMutation.mutate({
                  where: {
                    id: Number(tutorId),
                  },
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
            <Text className='text-center text-lg font-sans-bold'>Сохранить</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  )
}
