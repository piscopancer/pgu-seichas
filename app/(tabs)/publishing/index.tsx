import Text from '@/components/text'
import { db } from '@/db'
import { useQuery } from '@tanstack/react-query'
import { Href, Link } from 'expo-router'
import { LucideArrowRight, LucideBookCopy, LucideCalendarDays, LucideIcon, LucideUsersRound } from 'lucide-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import { neutral } from 'tailwindcss/colors'

export default function PublishingScreen() {
  const tutorsCountQuery = useQuery({
    queryKey: ['tutors', 'count'],
    queryFn: () => db.tutor.count(),
  })
  const subjectsCountQuery = useQuery({
    queryKey: ['subjects', 'count'],
    queryFn: () => db.subject.count(),
  })
  const schedulesCountQuery = useQuery({
    queryKey: ['schedule', 'count'],
    queryFn: () => db.schedule.count(),
  })

  return (
    <ScrollView overScrollMode='never'>
      <CategoryLink href='/(tabs)/publishing/tutors' icon={LucideUsersRound} text='Преподаватели' count={tutorsCountQuery.data ?? 0} />
      <CategoryLink href='/(tabs)/publishing/subjects' icon={LucideBookCopy} text='Предметы' count={subjectsCountQuery.data ?? 0} />
      <CategoryLink href='/(tabs)/publishing/schedules' icon={LucideCalendarDays} text='Расписания' count={schedulesCountQuery.data ?? 0} />
    </ScrollView>
  )
}

function CategoryLink(props: { href: Href; icon: LucideIcon; count: number; text: string }) {
  return (
    <Link asChild href={props.href}>
      <Pressable
        className='bg-neutral-950 py-4 px-6 flex-row items-center'
        android_ripple={{
          color: neutral[800],
        }}
      >
        <View className='mr-6 relative'>
          <props.icon strokeWidth={1} className='color-neutral-600 size-8' />
          <Text className='absolute bg-neutral-950 -bottom-1 -right-1'>{props.count}</Text>
        </View>
        <Text className='text-lg mr-auto'>{props.text}</Text>
        <LucideArrowRight strokeWidth={1} className='color-neutral-500 size-8' />
      </Pressable>
    </Link>
  )
}
