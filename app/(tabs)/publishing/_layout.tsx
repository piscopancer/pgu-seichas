import Text from '@/components/text'
import usePublisherStatus from '@/hooks/query/use-publisher-status'
import { colors } from '@/utils'
import { Stack } from 'expo-router'

export default function PublishingLayout() {
  const { data: publisher } = usePublisherStatus()

  if (!publisher) {
    return <Text className='text-center mt-12'>Нет доступа</Text>
  }

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
