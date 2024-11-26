import { ScheduleViewEdit } from '@/components/schedule-view/schedule-view'
import { queryKeys } from '@/query'
import { querySchedule } from '@/schedule'
import { defaultCommonScheduleStore, updateScheduleStore } from '@/store/schedule'
import { assignObject, colors } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator } from 'react-native'

export default function UpdateScheduleScreen() {
  const { id: scheduleId } = useLocalSearchParams<{ id: string }>()
  const scheduleQuery = useQuery({
    queryKey: queryKeys.schedule(Number(scheduleId)),
    queryFn: () => querySchedule(Number(scheduleId)),
  })

  useEffect(() => {
    if (scheduleQuery.data) {
      assignObject(updateScheduleStore, scheduleQuery.data)
      console.log('😁😁😁')
      console.log(JSON.stringify(scheduleQuery.data.days[0], null, 2))
    }
  }, [scheduleQuery.dataUpdatedAt])

  useEffect(() => {
    return () => {
      assignObject(updateScheduleStore, {
        id: undefined,
        name: defaultCommonScheduleStore.name,
        days: defaultCommonScheduleStore.days,
      })
    }
  }, [])

  if (scheduleQuery.isFetching) {
    return <ActivityIndicator size={'large'} color={colors.indigo[500]} className='mt-[33vh]' />
  }

  return <ScheduleViewEdit mode='edit' schedule={updateScheduleStore} />
}
