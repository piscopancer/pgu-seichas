import Text from '@/components/text'
import { SecureStore, useSecureStore } from '@/secure-store'
import { cn, colors, objectEntries } from '@/utils'
import { useRouter } from 'expo-router'
import { LucideArrowLeft } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const lessonViewOptions = {
  position: { text: 'Номер пары' },
  time: { text: 'Время' },
} satisfies Record<SecureStore['lessonViewMode'], { text: string }>

export default function SettingsScreen() {
  const router = useRouter()
  const [publisherToken, setPublisherToken] = useSecureStore('publisherToken')
  const [lessonView, setLessonView] = useSecureStore('lessonViewMode')

  return (
    <View className='dark:bg-black flex-1 w-full'>
      <SafeAreaView>
        <View className='flex flex-row border-b border-neutral-900'>
          <Pressable
            android_ripple={{
              color: colors.neutral[700],
              radius: 24,
            }}
            className='size-16 flex items-center justify-center'
            onPress={() => {
              router.back()
            }}
          >
            <LucideArrowLeft strokeWidth={1} className='text-neutral-500 size-8' />
          </Pressable>
        </View>
        <Text>Yeah</Text>
        <View className='flex-row'>
          {objectEntries(lessonViewOptions).map(([option, { text }]) => (
            <Pressable disabled={lessonView === option} onPress={() => setLessonView(option)} className={cn('flex', lessonView === option ? '' : '')}>
              <Text>{text}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </View>
  )
}
