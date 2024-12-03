import HeaderButton from '@/components/header-button'
import usePublisherStatus from '@/hooks/query/use-publisher-status'
import { cn, colors } from '@/utils'
import { Href, Link, Stack, useSegments } from 'expo-router'
import { LucideCalendarSearch, LucideEdit3, LucideHome, LucideIcon, LucideSettings } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TabLayout() {
  const { data: publisher } = usePublisherStatus()

  return (
    <SafeAreaView className='flex-1 bg-neutral-200 dark:bg-neutral-950'>
      <View className='h-16 border-b border-neutral-900 flex flex-row justify-end'>
        <Link href={'/settings'} asChild>
          <HeaderButton icon={LucideSettings} />
        </Link>
      </View>
      <View className='flex-1'>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {
              backgroundColor: colors.neutral[950],
            },
          }}
        />
      </View>
      <View className='h-16 border-t border-neutral-900 flex flex-row'>
        <TabLink segment='' href={'/(tabs)'} icon={LucideHome} />
        <TabLink segment='schedules' href={'/(tabs)/schedules'} icon={LucideCalendarSearch} />
        {publisher && <TabLink segment='publishing' href='/(tabs)/publishing' icon={LucideEdit3} />}
      </View>
    </SafeAreaView>
  )
}

function TabLink(props: { href: Href; icon: LucideIcon; segment: NonNullable<ReturnType<typeof useSegments>>[1] }) {
  const segments = useSegments()
  const active = (segments[1] ?? '') === (props.segment ?? '')
  const Icon = props.icon

  return (
    <Link asChild href={props.href}>
      <Pressable
        android_ripple={{
          color: colors.neutral[700],
          radius: 70,
        }}
        className='flex-1 flex items-center justify-center'
      >
        <Icon strokeWidth={1.25} className={cn('size-8', active ? 'text-indigo-500' : 'text-neutral-500')} />
      </Pressable>
    </Link>
  )
}
