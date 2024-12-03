import { db } from '@/db'
import { queryKeys } from '@/query'
import { queryOptions, useQuery } from '@tanstack/react-query'

export async function querySubjects() {
  return db.subject.findMany()
}

const subjectsQueryOptions = queryOptions({
  queryKey: queryKeys.subjects,
  queryFn: querySubjects,
})

export default function useSubjectsQuery(options?: Omit<typeof subjectsQueryOptions, 'queryKey' | 'queryFn'>) {
  return useQuery({ ...subjectsQueryOptions, ...(options ?? {}) })
}
