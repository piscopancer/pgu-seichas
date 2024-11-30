import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { qc, queryKeys } from '@/query'
import { cn, colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { Prisma } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
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
        },
      },
    },
  })
}

export default function SubjectScreen() {
  const { id: subjectId } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const subjectQuery = useQuery({
    queryKey: queryKeys.subject(Number(subjectId)),
    queryFn: () => querySubject(Number(subjectId)),
  })
  const updateSubjectMutation = useMutation({
    mutationFn: (subject: Prisma.SubjectUpdateArgs) => db.subject.update(subject),
    onSuccess() {
      qc.invalidateQueries({ queryKey: queryKeys.subjects })
      router.back()
    },
  })
  const tutorsQuery = useTutorsQuery()
  const [changedSubjectName, setChangedSubjectName] = useState<string | undefined>(undefined)
  const [changedTutorId, setChangedTutorId] = useState<number | null | undefined>(undefined)
  const tutorSheetRef = useSheetRef()
  const canUpdate = !!changedSubjectName || changedTutorId !== undefined

  function getTutor(): string | null {
    if (!tutorsQuery.data) {
      return '...'
    }
    const tutorId = changedTutorId !== undefined ? changedTutorId : subjectQuery.data?.tutor?.id
    if (tutorId) {
      const { name, surname, middlename } = tutorsQuery.data.filter((t) => t.id === tutorId)[0]
      return `${surname} ${name} ${middlename}`
    } else {
      return null
    }
  }

  return (
    <ScrollView overScrollMode='never'>
      {subjectQuery.data && tutorsQuery.data ? (
        <>
          <Text className='text-2xl mx-6 mb-8 mt-8 font-sans-bold'>{subjectQuery.data.name}</Text>
          <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg'>Предмет</Text>
          <TextInput
            placeholder={subjectQuery.data.name}
            defaultValue={subjectQuery.data.name}
            onChange={({ nativeEvent: { text } }) => {
              setChangedSubjectName(text === subjectQuery.data!.name ? undefined : text)
            }}
            className='mx-6 mb-4'
          />
          <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg'>Преподаватель</Text>
          <Pressable
            onPress={() => {
              tutorSheetRef.current?.expand()
            }}
            className='border border-neutral-800 rounded-md mx-6 px-4 py-4 flex-row mb-12'
          >
            <LucideUserRound strokeWidth={1} className='color-neutral-500 mr-5' />
            <Text className={cn('text-lg line-clamp-1', getTutor() ? '' : 'dark:text-neutral-500')}>{getTutor() ?? 'Не указан'}</Text>
          </Pressable>
          <BottomSheet ref={tutorSheetRef}>
            <BottomSheetView>
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
                      setChangedTutorId(subjectQuery.data!.tutor?.id === tutor.id ? undefined : tutor.id)
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
              updateSubjectMutation.mutate({
                data: {
                  ...(changedSubjectName ? { name: changedSubjectName } : {}),
                  tutor: {
                    ...(changedTutorId === null
                      ? {
                          disconnect: {
                            id: subjectQuery.data?.tutor?.id ?? undefined,
                          },
                        }
                      : {
                          connect: {
                            id: changedTutorId ?? undefined,
                          },
                        }),
                  },
                },
                where: {
                  id: Number(subjectId),
                },
              })
            }}
            disabled={!canUpdate}
            className='bg-indigo-500 disabled:opacity-50 mx-6 rounded-md py-4 px-6'
          >
            <Text className='font-sans-bold text-center text-lg'>Сохранить</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  )
}
