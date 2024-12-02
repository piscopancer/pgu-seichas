import { cn, colors } from '@/utils'
import { LucideIcon } from 'lucide-react-native'
import { forwardRef } from 'react'
import { Pressable, PressableProps, View } from 'react-native'

type HeaderButtonProps = Omit<PressableProps, 'children'> & {
  icon: LucideIcon
}

const HeaderButton = forwardRef<View, HeaderButtonProps>((props, ref) => {
  const modifiedProps: HeaderButtonProps = {
    ...props,
    android_ripple: {
      color: colors.neutral[700],
      radius: 24,
    },
    className: cn('size-16 flex items-center justify-center', props.className),
  }

  return (
    <Pressable {...modifiedProps} ref={ref}>
      <props.icon strokeWidth={1} className='color-neutral-500 size-8' />
    </Pressable>
  )
})

export default HeaderButton
