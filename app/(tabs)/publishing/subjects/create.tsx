import { useSheetRef } from '@/components/bottom-sheet'
import SubjectTutorSheet from '@/components/subject-tutor-sheet'
import Text from '@/components/text'
import TextInput from '@/components/text-input'
import { db } from '@/db'
import useTutorsQuery from '@/hooks/query/use-tutors'
import { qc, queryKeys } from '@/query'
import { cn, colors } from '@/utils'
import { Prisma } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { LucideUserRound } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, ScrollView } from 'react-native'

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
  const [tutorId, setTutorId] = useState<number | null>(null)
  const tutorSheetRef = useSheetRef()
  const canCreate = !!subjectName || tutorId !== null

  function getTutor(): string | null {
    if (!tutorsQuery.data) {
      return '...'
    }
    if (tutorId !== null) {
      const { name, surname, middlename } = tutorsQuery.data.filter((t) => t.id === tutorId)[0]
      return `${surname} ${name} ${middlename}`
    } else {
      return null
    }
  }

  return (
    <ScrollView overScrollMode='never'>
      <>
        <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg mt-8'>Предмет</Text>
        <TextInput
          onChange={({ nativeEvent: { text } }) => {
            setSubjectName(text)
          }}
          className='mx-6 mb-4'
        />
        <Text className='mx-6 dark:text-neutral-500 mb-2 text-lg'>Преподаватель</Text>
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            tutorSheetRef.current?.expand()
          }}
          className='mx-6 border border-neutral-800 rounded-md p-4 flex-row mb-12'
        >
          <LucideUserRound strokeWidth={1} className='color-neutral-500 mr-5' />
          <Text className={cn('text-lg line-clamp-1', getTutor() ? '' : 'dark:text-neutral-500')}>{getTutor() ?? 'Не указан'}</Text>
        </Pressable>
        <SubjectTutorSheet ref={tutorSheetRef} onSelect={setTutorId} />
        <Pressable
          onPress={() => {
            createSubjectMutation.mutate({
              data: {
                name: subjectName,
                ...(tutorId !== null
                  ? {
                      tutor: {
                        connect: {
                          id: tutorId,
                        },
                      },
                    }
                  : {}),
              },
            })
          }}
          disabled={!canCreate}
          android_ripple={{ color: colors.indigo[300] }}
          className='bg-indigo-500 disabled:opacity-50 mx-6 rounded-md py-4 px-6'
        >
          <Text className='font-sans-bold text-center text-lg'>Добавить</Text>
        </Pressable>
      </>
    </ScrollView>
  )
}
