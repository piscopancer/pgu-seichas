import { colors } from '@/utils'
import { useRouter } from 'expo-router'
import { LucideArrowLeft } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <View className='bg-neutral-950 flex-1 w-full'>
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
      </SafeAreaView>
    </View>
  )
}
