import { Schedule, weekdays } from '@/schedule'
import { WeekdayEdit, WeekdayView } from './weekday'

type P =
  | {
      mode: 'edit'
    }
  | {
      mode: 'view'
      schedule: Schedule
    }

export default function WeekdaysList(props: P) {
  return (
    <>
      {props.mode === 'edit' && weekdays.map((weekday, i) => <WeekdayEdit key={i} weekday={weekday} dayIndex={i} />)}

      {props.mode === 'view' && weekdays.map((weekday, i) => <WeekdayView getDay={() => props.schedule.days[i]} key={i} weekday={weekday} dayIndex={i} />)}
    </>
  )
}
