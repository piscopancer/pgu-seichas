// import SheetSelect from '@/components/sheet-select'
import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import SheetTextInput from '@/components/sheet-text-input'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import TutorRankSheet from '@/components/tutor-rank-sheet'
import { db } from '@/db'
import { qc, queryKeys } from '@/query'
import { Rank, ranksInfo, tutorSchema } from '@/tutor'
import { capitalizeFirstLetter, cn, colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { Prisma } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { forwardRef, useEffect, useState } from 'react'
import { Pressable, ScrollView, ToastAndroid } from 'react-native'
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

export default function TutorScreen() {
  const { id: tutorId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const tutorQuery = useQuery({
    queryKey: queryKeys.tutor(Number(tutorId)),
    queryFn: () => queryTutor(Number(tutorId)),
  })
  const updateTutorMutation = useMutation({
    mutationFn: (update: Prisma.TutorUpdateArgs) => db.tutor.update(update),
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
  const confirmDeleteSheetRef = useSheetRef()

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
          <Text className='mt-12 mb-2 ml-11 dark:text-neutral-500'>Фамилия</Text>
          <TextInput defaultValue={tutorQuery.data.surname} placeholder={tutorQuery.data.surname} className='mb-4 mx-6' onChangeText={(text) => (changedStore.surname = text === tutorQuery.data?.surname ? undefined : text)} />
          <Text className='mb-2 ml-11 dark:text-neutral-500'>Имя</Text>
          <TextInput defaultValue={tutorQuery.data.name} placeholder={tutorQuery.data.name} onChangeText={(text) => (changedStore.name = text === tutorQuery.data?.name ? undefined : text)} className='mb-4 mx-6' />
          <Text className='mb-2 ml-11 dark:text-neutral-500'>Отчество</Text>
          <TextInput defaultValue={tutorQuery.data.middlename} placeholder={tutorQuery.data.middlename} onChangeText={(text) => (changedStore.middlename = text === tutorQuery.data?.middlename ? undefined : text)} className='mb-4 mx-6' />
          <Text className='mb-2 ml-11 dark:text-neutral-500'>Должность</Text>
          {/*  */}
          <Pressable onPress={() => rankSheetRef.current?.expand()} className='border rounded-md border-neutral-800 px-5 py-4 mx-6 mb-8'>
            <Text className={cn('text-lg', getRank() ? '' : 'dark:text-neutral-500')}>{getRank() ?? 'Не указана'}</Text>
          </Pressable>
          <TutorRankSheet
            ref={rankSheetRef}
            onSelect={(rank) => {
              changedStore.rank = (tutorQuery.data!.rank as Rank | null) === rank ? undefined : rank
            }}
          />
          <Pressable
            onPress={() => {
              if (tutorQuery.data) {
                changedStore.name = tutorQuery.data.name
                changedStore.surname = tutorQuery.data.surname
                changedStore.middlename = tutorQuery.data.middlename
                changedStore.rank = (tutorQuery.data.rank as Rank | null) ?? undefined
              }
            }}
            className='mb-4 mx-6 py-4 px-6 bg-neutral-900 rounded-md'
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
            className='mb-4 mx-6 py-4 px-6 bg-indigo-500 rounded-md'
            android_ripple={{ color: indigo[300] }}
          >
            <Text className='text-center text-lg font-sans-bold'>Сохранить</Text>
          </Pressable>
          <Pressable android_ripple={{ color: colors.rose[700] }} onPress={() => confirmDeleteSheetRef.current?.snapToIndex(0)} className='mx-6 py-4 mb-12 px-6 rounded-md bg-red-500/20'>
            <Text className='text-center text-lg font-sans-bold dark:text-rose-500'>Удалить</Text>
          </Pressable>
          <ConfirmDeleteSheet ref={confirmDeleteSheetRef} tutor={tutorQuery.data} />
        </>
      ) : null}
    </ScrollView>
  )
}

type Tutor = NonNullable<Awaited<ReturnType<typeof queryTutor>>>

const ConfirmDeleteSheet = forwardRef<BottomSheetMethods, { tutor: Tutor }>((props, ref) => {
  const [confirmSurname, setConfirmSurname] = useState('')
  const router = useRouter()
  const deleteTutorMutation = useMutation({
    mutationFn: () =>
      db.tutor.delete({
        where: {
          id: props.tutor.id,
        },
      }),
    async onSuccess() {
      await qc.invalidateQueries({ queryKey: queryKeys.tutors })
      router.replace('/publishing/tutors')
    },
  })

  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        <Text className='mb-4 mt-6 mx-6 text-lg text-center font-sans-bold'>
          {props.tutor.surname} {props.tutor.name} {props.tutor.middlename}
        </Text>
        <Text className='mb-6 mx-6 text-lg text-center'>Чтобы удалить преподавателя, введите его фамилию</Text>
        <SheetTextInput defaultValue={confirmSurname} placeholder={props.tutor.surname} onChangeText={(text) => setConfirmSurname(text.trim())} className='mb-4 mx-6 focus:border-rose-500 caret-rose-500' />
        <Pressable onPress={() => deleteTutorMutation.mutate()} disabled={confirmSurname.toLowerCase() !== props.tutor.surname.toLowerCase() || deleteTutorMutation.isPending} className='disabled:opacity-50 py-4 bg-rose-500/20 rounded-md mx-6 mb-6'>
          <Text className='text-center text-lg dark:text-rose-500 font-sans-bold'>Удалить</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  )
})
