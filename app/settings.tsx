import { BottomSheet, useSheetRef } from '@/components/bottom-sheet'
import HeaderButton from '@/components/header-button'
import SheetTextInput from '@/components/sheet-text-input'
import Text from '@/components/text'
import { db } from '@/db'
import { DeviceStore, useDeviceStore } from '@/device-store'
import usePublisherStatus from '@/hooks/query/use-publisher-status'
import { createTestData } from '@/misc/init-test-db'
import { qc, queryKeys } from '@/query'
import { cn, colors, objectEntries } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter } from 'expo-router'
import { LucideArrowLeft, LucideExternalLink } from 'lucide-react-native'
import { forwardRef, ReactNode, useRef } from 'react'
import { Pressable, ToastAndroid, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type LessonView = DeviceStore['lessonViewMode']

const lessonViewOptions = {
  position: {
    text: 'Номер пары',
    preview: ({ selected }) => <Text className='my-3 text-center text-lg'>1</Text>,
  },
  time: {
    text: 'Время пары',
    preview: ({ selected }) => <Text className='my-3 text-center text-lg'>8:30 - 10:10</Text>,
  },
} satisfies Record<LessonView, { text: string; preview: (props: { selected: boolean }) => ReactNode }>

type ScheduleView = DeviceStore['scheduleViewMode']

const scheduleViewOptions = {
  tabs: {
    text: 'Вкладки',
    preview: ({ selected }) => (
      <View className='h-32 items-center justify-center'>
        <View className='gap-1 items-center mb-3 w-1/3'>
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
        </View>
        <View className='flex-row gap-1.5 p-2 rounded-xl bg-neutral-800'>
          <View className='size-6 rounded-md bg-neutral-500' />
          <View className='size-6 rounded-md bg-neutral-600' />
          <View className='size-6 rounded-md bg-neutral-600' />
        </View>
      </View>
    ),
  },
  list: {
    text: 'Список',
    preview: ({ selected }) => (
      <View className='items-center justify-center h-32'>
        <View className='gap-1 items-center mb-4 w-1/3'>
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
        </View>
        <View className='gap-1 items-center w-1/3'>
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
          <View className='bg-neutral-700 h-1 w-full rounded-full' />
        </View>
      </View>
    ),
  },
} satisfies Record<ScheduleView, { text: string; preview: (props: { selected: boolean }) => ReactNode }>

export default function SettingsScreen() {
  const router = useRouter()
  const [lessonView, setLessonView] = useDeviceStore('lessonViewMode')
  const [scheduleView, setScheduleView] = useDeviceStore('scheduleViewMode')
  const publisherSheet = useSheetRef()

  return (
    <SafeAreaView className='dark:bg-neutral-950 flex-1 w-full'>
      <Pressable onLongPress={() => publisherSheet.current?.expand()} className='absolute size-24 bottom-0 left-0' />
      <Pressable
        onLongPress={async () => {
          await createTestData()
          ToastAndroid.show('test data created', ToastAndroid.SHORT)
        }}
        className='absolute size-24 bottom-0 right-0'
      />
      <PublisherSheet ref={publisherSheet} />
      <View className='flex flex-row border-b border-neutral-900'>
        <HeaderButton icon={LucideArrowLeft} onPress={() => router.back()} />
      </View>
      <View className='mx-6 mb-6'>
        <Text className='text-2xl mt-8 mb-6'>Внешний вид</Text>
        <Text className='text-lg mb-2'>Пара</Text>
        <View className='flex-row gap-2 mb-6'>
          {objectEntries(lessonViewOptions).map(([option, { text, preview: Preview }]) => (
            <Pressable
              key={option}
              android_ripple={{
                color: colors.neutral[700],
                foreground: true,
              }}
              disabled={lessonView === option}
              onPress={() => setLessonView(option)}
              className={cn('flex-1 rounded-md')}
            >
              <View className={cn('rounded-t-md mb-px', option === lessonView ? 'bg-neutral-850' : 'bg-neutral-900')}>
                <Preview selected={option === lessonView} />
              </View>
              <Text className={cn('text-center text-lg py-1 rounded-b-md', lessonView === option ? 'bg-neutral-850' : 'bg-neutral-900')}>{text}</Text>
            </Pressable>
          ))}
        </View>
        <Text className='text-lg mb-2'>Расписание</Text>
        <View className='flex-row gap-2 mb-6'>
          {objectEntries(scheduleViewOptions).map(([option, { text, preview: Preview }]) => (
            <Pressable
              key={option}
              android_ripple={{
                color: colors.neutral[700],
                foreground: true,
              }}
              disabled={scheduleView === option}
              onPress={() => setScheduleView(option)}
              className={cn('flex-1 rounded-md')}
            >
              <View className={cn('rounded-t-md mb-px', option === scheduleView ? 'bg-neutral-850' : 'bg-neutral-900')}>
                <Preview selected={option === scheduleView} />
              </View>
              <Text className={cn('text-center text-lg py-1 rounded-b-md', scheduleView === option ? 'bg-neutral-850' : 'bg-neutral-900')}>{text}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {/* <View className='mx-6 mb-6'>
        <Text className='text-2xl mt-8 mb-6'>Расписание</Text>
        <Text className='text-lg mb-2'>Показывать</Text>
        <View className='flex-row gap-2 mb-6'>
          {objectEntries(lessonViewOptions).map(([option, { text }]) => (
            <Pressable key={option} android_ripple={{ color: colors.neutral[700] }} disabled={lessonView === option} onPress={() => setLessonView(option)} className={cn('flex-1 py-3 rounded-md', lessonView === option ? 'bg-neutral-800' : 'bg-neutral-900')}>
              <Text className='text-center text-lg'>{text}</Text>
            </Pressable>
          ))}
        </View>
      </View> */}
      <View className='mx-6'>
        <Text className='text-2xl mb-6'>Поддержка</Text>
        <Link href={'http://t.me/piscopancer'} asChild>
          <Pressable android_ripple={{ color: colors.neutral[700] }} className='bg-neutral-900 rounded-md py-3 flex-row items-center justify-center'>
            <LucideExternalLink strokeWidth={1} className='color-neutral-500 absolute left-4 size-6' />
            <Text className='text-lg'>Задать вопрос</Text>
          </Pressable>
        </Link>
      </View>
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
              className='rounded-md bg-neutral-800 py-3 mx-6'
            >
              <Text className='dark:text-neutral-200 text-lg text-center'>Подтвердить</Text>
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
})
