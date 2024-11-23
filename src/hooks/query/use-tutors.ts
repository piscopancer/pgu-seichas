import { db } from '@/db'
import { queryKeys } from '@/query'
import { useQuery } from '@tanstack/react-query'

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

export default function useTutorsQuery() {
  return useQuery({
    queryKey: queryKeys.tutors,
    queryFn: queryTutors,
  })
}
