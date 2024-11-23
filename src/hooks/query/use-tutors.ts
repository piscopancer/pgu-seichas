import { db } from '@/db'
import { queryKeys } from '@/query'
import { useQuery } from '@tanstack/react-query'

export async function queryTutors() {
  return db.tutor.findMany()
}

export default function useTutorsQuery() {
  return useQuery({
    queryKey: queryKeys.tutors,
    queryFn: queryTutors,
  })
}
