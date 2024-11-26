import { colors } from '@/utils'
import { Stack } from 'expo-router'

export default function SchedulesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.neutral[950],
        },
      }}
    />
  )
}
