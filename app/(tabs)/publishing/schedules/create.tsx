import { ScheduleViewEdit } from '@/components/schedule-view/schedule-view'
import { createScheduleStore, defaultCommonSchedule } from '@/store/schedule'
import { useEffect } from 'react'
import { deepClone } from 'valtio/utils'

export default function CreateScheduleScreen() {
  useEffect(() => {
    return () => {
      createScheduleStore.name = deepClone(defaultCommonSchedule.name)
      createScheduleStore.days = deepClone(defaultCommonSchedule.days)
    }
  }, [])

  return <ScheduleViewEdit mode='edit' schedule={createScheduleStore} />
}
