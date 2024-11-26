import Text from '@/components/text'
import { queryKeys } from '@/query'
import { querySchedule } from '@/schedule'
import { colors } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator } from 'react-native'

export default function ViewScheduleScreen() {
  const { id: scheduleId } = useLocalSearchParams<{ id: string }>()
  const scheduleQuery = useQuery({
    queryKey: queryKeys.schedule(Number(scheduleId)),
    queryFn: () => querySchedule(Number(scheduleId)),
  })

  if (!scheduleQuery.data) {
    return <ActivityIndicator size={'large'} color={colors.indigo[500]} className='mt-[33vh]' />
  }

  // return <ScheduleView scheduleStore={updateScheduleStore} />
  return <Text>{scheduleQuery.data?.name}</Text>
}
