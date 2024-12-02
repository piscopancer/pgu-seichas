import { db } from '@/db'
import { queryKeys } from '@/query'
import { queryOptions, useQuery } from '@tanstack/react-query'

export async function queryTutors() {
  return db.tutor.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      middlename: true,
      rank: true,
      _count: {
        select: {
          subjects: true,
        },
      },
    },
  })
}

const tutorsQueryOptions = queryOptions({
  queryKey: queryKeys.tutors,
  queryFn: queryTutors,
})

export default function useTutorsQuery(options?: Omit<typeof tutorsQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({ ...tutorsQueryOptions, ...(options ?? {}) })
}
