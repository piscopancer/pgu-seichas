import '@/assets/style.css'
import { Slot } from 'expo-router'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex-1 bg-neutral-950'>
        <Slot />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
