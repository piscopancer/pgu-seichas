import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import SheetTextInput from '@/components/sheet-text-input'
import SubjectTutorSheet from '@/components/subject-tutor-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { qc, queryKeys } from '@/query'
import { cn, colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { Prisma, Subject } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LucideUserRound } from 'lucide-react-native'
import { forwardRef, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

async function querySubject(id: number) {
  return db.subject.findFirst({
    where: {
      id,
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
  const confirmDeleteSheetRef = useSheetRef()
  const tutorsQuery = useTutorsQuery()
  const [changedSubjectName, setChangedSubjectName] = useState<string | undefined>(undefined)
  const [changedTutorId, setChangedTutorId] = useState<number | null | undefined>(undefined)
  const tutorSheetRef = useSheetRef()
  const canUpdate = !!changedSubjectName || changedTutorId !== undefined

  function getTutor(): string | null {
    if (!tutorsQuery.data) {
      return '...'
    }
    const tutorId = changedTutorId !== undefined ? changedTutorId : subjectQuery.data?.tutorId
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
          <SubjectTutorSheet ref={tutorSheetRef} onSelect={setChangedTutorId} />
          <Pressable
            onPress={() => {
              updateSubjectMutation.mutate({
                data: {
                  ...(changedSubjectName ? { name: changedSubjectName } : {}),
                  tutor: {
                    ...(changedTutorId === null
                      ? {
                          disconnect: {
                            id: subjectQuery.data?.tutorId ?? undefined,
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
            android_ripple={{ color: colors.indigo[300] }}
            className='bg-indigo-500 disabled:opacity-50 mx-6 rounded-md py-4 px-6 mb-4'
          >
            <Text className='font-sans-bold text-center text-lg'>Сохранить</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} android_ripple={{ color: colors.neutral[700] }} className='mx-6 py-4 rounded-md bg-neutral-900 mb-6'>
            <Text className='text-center text-lg'>Отменить</Text>
          </Pressable>
          <View className='border-b border-dashed border-neutral-800 mx-6 mb-6' />
          <Pressable android_ripple={{ color: colors.neutral[800] }} onPress={() => confirmDeleteSheetRef.current?.snapToIndex(0)} className='mx-6 py-4 mb-12 px-6 rounded-md border border-neutral-800'>
            <Text className='text-center text-lg'>Удалить</Text>
          </Pressable>
          <ConfirmDeleteSheet ref={confirmDeleteSheetRef} subject={subjectQuery.data} />
        </>
      ) : null}
    </ScrollView>
  )
}

const ConfirmDeleteSheet = forwardRef<BottomSheetMethods, { subject: Subject }>((props, ref) => {
  const [confirmSubject, setConfirmSubject] = useState('')
  const router = useRouter()
  const deleteSubjectMutation = useMutation({
    mutationFn: () =>
      db.subject.delete({
        where: {
          id: props.subject.id,
        },
      }),
    async onSuccess() {
      await qc.invalidateQueries({ queryKey: queryKeys.subjects })
      router.replace('/publishing/subjects')
    },
  })

  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        <Text className='mb-4 mt-6 mx-6 text-lg text-center font-sans-bold'>{props.subject.name}</Text>
        <Text className='mb-6 mx-6 text-lg text-center'>Чтобы удалить предмет, введите его название</Text>
        <SheetTextInput defaultValue={confirmSubject} placeholder={props.subject.name} onChangeText={(text) => setConfirmSubject(text.trim())} className='mb-4 mx-6 focus:border-rose-500 caret-rose-500' />
        <Pressable
          android_ripple={{ color: colors.rose[700] }}
          onPress={() => deleteSubjectMutation.mutate()}
          disabled={confirmSubject.toLowerCase() !== props.subject.name.toLowerCase() || deleteSubjectMutation.isPending}
          className='disabled:opacity-50 disabled:bg-neutral-800 py-4 bg-rose-500/20 rounded-md mx-6 mb-6'
        >
          <Text disabled={confirmSubject.toLowerCase() !== props.subject.name.toLowerCase() || deleteSubjectMutation.isPending} className='text-center text-lg dark:text-rose-500 disabled:dark:text-neutral-200'>
            Удалить
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  )
})
