import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import SheetTextInput from '@/components/sheet-text-input'
import Text from '@/components/text'
import { db } from '@/db'
import usePublisherStatus from '@/hooks/query/use-publisher-status'
import { qc, queryKeys } from '@/query'
import { DeviceStore, useDeviceStore } from '@/secure-store'
import { cn, colors, objectEntries } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter } from 'expo-router'
import { LucideArrowLeft, LucideExternalLink } from 'lucide-react-native'
import { forwardRef, useRef } from 'react'
import { Pressable, ToastAndroid, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const lessonViewOptions = {
  position: { text: 'Номер пары' },
  time: { text: 'Время пары' },
} satisfies Record<DeviceStore['lessonViewMode'], { text: string }>

export default function SettingsScreen() {
  const router = useRouter()
  const [lessonView, setLessonView] = useDeviceStore('lessonViewMode')
  const publisherSheet = useSheetRef()

  return (
    <SafeAreaView className='dark:bg-black flex-1 w-full'>
      <Pressable onLongPress={() => publisherSheet.current?.expand()} className='absolute size-24 bottom-0 left-0' />
      <PublisherSheet ref={publisherSheet} />
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
      <View className='mx-6 mb-6'>
        <Text className='text-2xl mt-8 mb-6'>Расписание</Text>
        <Text className='text-lg mb-2'>Показывать</Text>
        <View className='flex-row gap-2 mb-6'>
          {objectEntries(lessonViewOptions).map(([option, { text }]) => (
            <Pressable key={option} android_ripple={{ color: colors.neutral[700] }} disabled={lessonView === option} onPress={() => setLessonView(option)} className={cn('flex-1 py-3 rounded-md', lessonView === option ? 'bg-neutral-800' : 'bg-neutral-900')}>
              <Text className='text-center text-lg'>{text}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View className='mx-6'>
        <Text className='text-2xl mb-6'>Поддержка</Text>
        <Link href={'http://t.me/piscopancer'} asChild>
          <Pressable android_ripple={{ color: colors.neutral[700] }} className='bg-neutral-900 rounded-md py-3 flex-row items-center justify-center'>
            <LucideExternalLink strokeWidth={1} className='color-neutral-500 absolute left-4 size-6' />
            <Text className='text-lg'>Задать вопрос</Text>
          </Pressable>
        </Link>
      </View>
      {/* <Text
        onPress={() =>
          db.publisherToken
            .createMany({
              data: [
                {
                  value: 'annarob_1234',
                },
                {
                  value: 'igorbistr_0109',
                },
              ],
            })
            .then((res) => console.log(JSON.stringify(res, null, 2)))
        }
      >
        create
      </Text>
      <Text
        onPress={() =>
          db.publisherToken
            .updateMany({
              data: {
                activated: false,
              },
            })
            .then((res) => console.log(JSON.stringify(res, null, 2)))
        }
      >
        RESET
      </Text>
      <Text
        onPress={() => {
          db.publisherToken.findMany().then((t) => console.log(JSON.stringify(t, null, 2)))
        }}
      >
        query
      </Text> */}
    </SafeAreaView>
  )
}

async function validateToken(value: string) {
  const token = await db.publisherToken.findFirst({
    where: {
      value,
    },
  })
  if (!token || token.activated) {
    return false
  }
  return {
    id: token.id,
  }
}

async function activateToken(id: number) {
  return db.publisherToken.update({
    where: {
      id,
    },
    data: {
      activated: true,
    },
  })
}

async function deactivateToken(value: string) {
  return db.publisherToken.update({
    where: {
      value,
    },
    data: {
      activated: false,
    },
  })
}

const PublisherSheet = forwardRef<BottomSheetMethods, {}>((props, ref) => {
  const tokenInputText = useRef('')
  const [publisherToken, setPublisherToken] = useDeviceStore('publisherToken')
  const { data: publisher } = usePublisherStatus()
  const activateTokenMutation = useMutation({
    mutationFn: activateToken,
    onSuccess(token) {
      setPublisherToken(token.value)
      qc.setQueryData(queryKeys.publisherStatus(token.value), true)
    },
  })
  const validateTokenMutation = useMutation({
    mutationFn: validateToken,
    onSuccess(token) {
      if (token) {
        activateTokenMutation.mutate(token.id)
      } else {
        ToastAndroid.show('Токен неверный или он уже активирован', ToastAndroid.SHORT)
      }
    },
  })
  const deactivateTokenMutation = useMutation({
    mutationFn: deactivateToken,
    onError() {
      setPublisherToken(null)
    },
    onSuccess() {
      setPublisherToken(null)
    },
  })

  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        {publisher ? (
          <>
            <Text className='my-6 text-lg text-center dark:text-indigo-500'>Токен активирован</Text>
            <Text className='text-center dark:text-neutral-500 mb-6 text-lg'>{publisherToken}</Text>
            <Pressable
              onLongPress={() => {
                deactivateTokenMutation.mutate(publisherToken!)
              }}
              android_ripple={{ color: colors.neutral[700] }}
              className='rounded-md bg-neutral-800 py-3 mx-6 px-4 mb-6'
            >
              <Text className='dark:text-neutral-200 text-lg text-center mb-2'>Сбросить токен</Text>
              <Text className='dark:text-neutral-500 text-center mb-1'>(Удерживайте)</Text>
              <Text className='dark:text-neutral-500 text-center'>(Токен снова станет доступным для активации, например, на другом устройстве, предположительно вашем)</Text>
            </Pressable>
          </>
        ) : (
          <>
            <SheetTextInput onChangeText={(text) => (tokenInputText.current = text.trim())} className='mx-6 my-4' />
            <Pressable
              disabled={validateTokenMutation.isPending || activateTokenMutation.isPending}
              onPress={() => {
                validateTokenMutation.mutate(tokenInputText.current)
              }}
              android_ripple={{ color: colors.neutral[700] }}
              className='rounded-md bg-neutral-800 py-4 mx-6'
            >
              <Text className='dark:text-neutral-200 text-lg text-center'>Подтвердить</Text>
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
})
