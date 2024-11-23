import '@/assets/style.css'
import { initializeDb } from '@/db'
// import { defineBGTask, registerBackgroundTask } from '@/bg-task'
// import { category as notificationCategory } from '@/notification'
import { qc } from '@/query'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { PortalProvider } from '@gorhom/portal'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
// import * as notifications from 'expo-notifications'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { cssInterop } from 'nativewind'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Svg from 'react-native-svg'

// defineBGTask()

// notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// })

// notifications
//   .setNotificationCategoryAsync(notificationCategory, [
//     {
//       buttonTitle: 'Остановить',
//       identifier: 'stop',
//     },
//   ])
//   .then((c) => {
//     //
//   })

// async function pushNotification() {
//   const moscow = 'Europe/Moscow'
//   const zonedStartOfToday = startOfDay(toZonedTime(new Date(), moscow))
//   const from = toZonedTime(new Date(), moscow)
//   const to = zonedStartOfToday.setHours(12)
//   const diffMin = differenceInMinutes(to, from)
//   const diff = formatDuration({ minutes: diffMin }, { format: ['minutes'], locale: ru })

//   // await notifications.scheduleNotificationAsync({
//   //   identifier: notificationId,
//   //   content: createc,
//   //   trigger: null,
//   // })
// }

SplashScreen.preventAutoHideAsync()

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      width: true,
      height: true,
    },
  },
})

export default function RootLayout() {
  const [fonts] = useFonts({
    'Geist-Regular': require('@/assets/fonts/Geist-Regular.otf'),
    'Geist-Bold': require('@/assets/fonts/Geist-Bold.otf'),
    'GeistMono-Regular': require('@/assets/fonts/GeistMono-Regular.otf'),
    'GeistMono-Bold': require('@/assets/fonts/GeistMono-Bold.otf'),
  })
  // const notificationListener = useRef<notifications.Subscription | null>(null)
  // const responseListener = useRef<notifications.Subscription | null>()
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    // notificationListener.current = notifications.addNotificationReceivedListener((n) => {})
    // responseListener.current = notifications.addNotificationResponseReceivedListener(async (response) => {
    //   if (response.actionIdentifier === 'kill') {
    //     // setKills((prev) => prev + 5)
    //   }
    //   if (response.actionIdentifier === 'stop') {
    //     await notifications.dismissNotificationAsync(response.notification.request.identifier)
    //   }
    // })
    // const interval = setInterval(() => {
    //   pushNotification()
    // }, 1 * 5000)
    // registerBackgroundTask()
    initializeDb().then(() => setDbInitialized(true))

    return () => {
      // notificationListener.current?.remove()
      // responseListener.current?.remove()
      // clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (fonts && dbInitialized) {
      SplashScreen.hideAsync()
    }
  }, [fonts, dbInitialized])

  if (!fonts || !dbInitialized) {
    return null
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <GestureHandlerRootView>
          <PortalProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
            </BottomSheetModalProvider>
          </PortalProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
