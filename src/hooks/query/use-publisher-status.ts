import { db } from '@/db'
import { queryKeys } from '@/query'
import { useDeviceStore } from '@/secure-store'
import { useMutation, useQuery } from '@tanstack/react-query'

export async function checkTokenActivated(value: string): Promise<boolean> {
  const token = await db.publisherToken.findFirst({
    where: {
      value,
    },
  })
  return !!token && token.activated
}

export default function usePublisherStatus() {
  const [publisherToken, setPublisherToken] = useDeviceStore('publisherToken')

  const checkTokenActivatedMutation = useMutation({
    mutationFn: checkTokenActivated,
    onSuccess(activated) {
      if (!activated) {
        setPublisherToken(null)
      }
    },
  })

  return useQuery({
    queryKey: queryKeys.publisherStatus(publisherToken!),
    queryFn: () => checkTokenActivatedMutation.mutateAsync(publisherToken!),
    select: (activated) => {
      return !!publisherToken && activated
    },
    enabled: publisherToken !== null,
    initialData: false,
  })
}
