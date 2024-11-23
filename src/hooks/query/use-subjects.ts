import { db } from '@/db'
import { queryKeys } from '@/query'
import { useQuery } from '@tanstack/react-query'

export async function querySubjects() {
  return db.subject.findMany()
}

export default function useSubjectsQuery() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: querySubjects,
  })
}
