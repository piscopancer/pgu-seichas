import ScheduleView from '@/components/schedule-view'
import { queryKeys } from '@/query'
import { querySchedule } from '@/schedule'
import { defaultCommonScheduleStore, updateScheduleStore } from '@/store/schedule'
import { assignObject } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'

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

  if (!scheduleQuery.data) {
    return null
  }

  return <ScheduleView scheduleStore={updateScheduleStore} />
}
