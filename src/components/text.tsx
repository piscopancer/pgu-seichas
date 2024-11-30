import { cn } from '@/utils'
import { Text as RNText, TextProps } from 'react-native'

export default function Text({ children, className, ...props }: TextProps) {
  return (
    <RNText {...props} className={cn('font-sans dark:text-neutral-200 align-middle', className)}>
      {children}
    </RNText>
  )
}
