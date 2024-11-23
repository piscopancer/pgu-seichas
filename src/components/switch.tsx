import { cn } from '@/utils'
import { Pressable, PressableProps, View } from 'react-native'

export default function Switch({ action, enabled, ...htmlProps }: PressableProps & { enabled: boolean; action: (current: boolean) => Promise<boolean> | boolean }) {
  async function onClick() {
    await action(enabled)
  }

  return (
    <Pressable {...htmlProps} onPress={onClick} className={cn(enabled ? 'justify-end bg-indigo-500' : 'justify-start bg-neutral-800', 'flex-row h-10 w-16 items-center rounded-full p-1', htmlProps.className)}>
      <View className={cn('aspect-square h-full rounded-full', enabled ? 'bg-neutral-200' : 'bg-neutral-500')} />
    </Pressable>
  )
}
