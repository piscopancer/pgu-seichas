import { BottomSheet, useBottomSheetRef } from '@/components/bottom-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { queryKeys } from '@/query'
import { colors } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { LucideRotateCcw, LucideUserRound, LucideUserRoundX } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Pressable, ScrollView } from 'react-native'

async function querySubject(id: number) {
  return db.subject.findFirst({
    where: {
      id,
    },
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

export default function ScheduleScreen() {
  const { id: subjectId } = useLocalSearchParams<{ id: string }>()
  const subjectQuery = useQuery({
    queryKey: queryKeys.subject(Number(subjectId)),
    queryFn: () => querySubject(Number(subjectId)),
  })
  const tutorsQuery = useTutorsQuery()
  const [changedTutorId, setChangedTutorId] = useState<number | null | undefined>(undefined)

  const tutorSheetRef = useBottomSheetRef()

  function getTutor(): string {
    if (changedTutorId === undefined) {
      if (subjectQuery.data?.tutor) {
        const { name, surname, middlename } = subjectQuery.data.tutor
        return `${surname} ${name} ${middlename}`
      } else {
        return 'Не указан'
      }
    } else if (changedTutorId === null) {
      return 'Не указан'
    } else {
      if (tutorsQuery.data) {
        const { name, surname, middlename } = tutorsQuery.data.filter((t) => t.id === changedTutorId)[0]
        return `${surname} ${name} ${middlename}`
      } else {
        return '...'
      }
    }
  }

  return (
    <ScrollView overScrollMode='never'>
      {subjectQuery.data && tutorsQuery.data ? (
        <>
          <Text className='text-2xl mx-6 mb-8 font-sans-bold'>{subjectQuery.data.name}</Text>
          {/* subject */}
          <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg'>Предмет</Text>
          <TextInput placeholder={subjectQuery.data.name} defaultValue={subjectQuery.data.name} className='mx-6 mb-4' />
          {/* tutor */}
          <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg'>Преподаватель</Text>
          <Pressable
            android_ripple={{ color: colors.neutral[700] }}
            onPress={() => {
              tutorSheetRef.current?.expand()
            }}
            className='bg-neutral-900 px-6 py-4 flex-row mb-12'
          >
            <LucideUserRound strokeWidth={1} className='color-neutral-500 mr-5' />
            <Text className='text-lg line-clamp-1'>{getTutor()}</Text>
          </Pressable>
          <BottomSheet ref={tutorSheetRef}>
            <Pressable
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                setChangedTutorId(undefined)
                tutorSheetRef.current?.close()
              }}
              className='px-6 py-4 flex-row items-center border-b border-neutral-800'
            >
              <LucideRotateCcw strokeWidth={1} className='mr-5 color-neutral-500' />
              <Text className='text-lg'>Отменить изменения</Text>
            </Pressable>
            <Pressable
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                setChangedTutorId(null)
                tutorSheetRef.current?.close()
              }}
              className='px-6 py-4 flex-row items-center border-b border-neutral-800'
            >
              <LucideUserRoundX strokeWidth={1} className='mr-5 color-neutral-500' />
              <Text className='text-lg'>Не указан</Text>
            </Pressable>
            <FlatList
              data={tutorsQuery.data ?? []}
              renderItem={({ item: tutor }) => (
                <Pressable
                  android_ripple={{ color: colors.neutral[700] }}
                  onPress={() => {
                    setChangedTutorId(tutor.id)
                    tutorSheetRef.current?.close()
                  }}
                  className='px-6 py-4 flex-row items-center'
                >
                  <LucideUserRound strokeWidth={1} className='mr-5 color-neutral-500' />
                  <Text className='text-lg line-clamp-1'>
                    {tutor.surname}{' '}
                    <Text className='dark:text-neutral-500'>
                      {tutor.name} {tutor.middlename}
                    </Text>
                  </Text>
                </Pressable>
              )}
            />
          </BottomSheet>
          <Pressable className='bg-indigo-500 mx-6 rounded-md py-4 px-6'>
            <Text className='font-sans-bold text-center text-lg'>Сохранить</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  )
}
