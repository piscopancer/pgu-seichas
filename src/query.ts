import { QueryClient } from '@tanstack/react-query'

export const qc = new QueryClient()

export const queryKeys = {
  tutors: ['tutors'],
  tutor: (id: number) => [...queryKeys.tutors, id],
  subjects: ['subjects'],
  subject: (id: number) => [...queryKeys.subjects, id],
  schedules: (filters?: { search?: string }) => (filters ? ['schedules', filters] : ['schedules']),
  schedule: (id: number) => [...queryKeys.schedules(), id],
  publisherStatus: (token: string) => ['publisher-token', token],
} as const
