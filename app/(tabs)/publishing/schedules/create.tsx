import { ScheduleViewEdit } from '@/components/schedule-view/schedule-view'
import { createScheduleStore } from '@/store/schedule'

export default function CreateScheduleScreen() {
  // useEffect(() => {
  //   return () => {
  //     createScheduleStore.reset()
  //   }
  // }, [])

  return <ScheduleViewEdit scheduleStore={createScheduleStore} />
}
