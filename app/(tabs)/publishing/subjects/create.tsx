import { BottomSheet, useBottomSheetRef } from '@/components/bottom-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { qc, queryKeys } from '@/query'
import { colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideUserRound, LucideUserRoundX } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Pressable, ScrollView } from 'react-native'

export default function SubjectScreen() {
  const router = useRouter()
  const createSubjectMutation = useMutation({
    mutationFn: (subject: Prisma.SubjectCreateArgs) => db.subject.create(subject),
    onSuccess() {
      qc.invalidateQueries({ queryKey: queryKeys.subjects })
      router.replace('/(tabs)/publishing/subjects')
    },
  })
  const tutorsQuery = useTutorsQuery()
  const [subjectName, setSubjectName] = useState<string>('')
  const [tutorId, setTutor] = useState<number | undefined>(undefined)
  const tutorSheetRef = useBottomSheetRef()
  const canCreate = !!subjectName || tutorId !== undefined

  function getTutor(): string {
    if (!tutorsQuery.data) {
      return '...'
    }
    if (tutorId !== undefined) {
      const { name, surname, middlename } = tutorsQuery.data.filter((t) => t.id === tutorId)[0]
      return `${surname} ${name} ${middlename}`
    } else {
      return 'Не указан'
    }
  }

  return (
    <ScrollView overScrollMode='never'>
      <>
        {/* subject */}
        <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg'>Предмет</Text>
        <TextInput
          onChange={({ nativeEvent: { text } }) => {
            setSubjectName(text)
          }}
          className='mx-6 mb-4'
        />
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
          <BottomSheetView>
            <Pressable
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                setTutor(undefined)
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
                    setTutor(tutor.id)
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
          </BottomSheetView>
        </BottomSheet>
        <Pressable
          onPress={() => {
            createSubjectMutation.mutate({
              data: {
                name: subjectName,
                tutor: {
                  connect: {
                    id: tutorId,
                  },
                },
              },
            })
          }}
          disabled={!canCreate}
          className='bg-indigo-500 disabled:opacity-50 mx-6 rounded-md py-4 px-6'
        >
          <Text className='font-sans-bold text-center text-lg'>Сохранить</Text>
        </Pressable>
      </>
    </ScrollView>
  )
}
