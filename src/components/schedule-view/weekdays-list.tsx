import { weekdays } from '@/schedule'
import { ScheduleViewProps } from './shared'
import { WeekdayEdit, WeekdayView } from './weekday'

export default function WeekdaysList(props: ScheduleViewProps) {
  return (
    <>
      {props.mode === 'edit' && weekdays.map((weekday, i) => <WeekdayEdit mode={props.mode} day={props.schedule.days[i]} key={i} weekday={weekday} dayIndex={i} />)}
      {props.mode === 'view' && weekdays.map((weekday, i) => <WeekdayView mode={props.mode} day={props.schedule.days[i]} key={i} weekday={weekday} dayIndex={i} />)}
    </>
  )
}
