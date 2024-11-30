import { forwardRef, useRef } from 'react'
import { TextInput as RnTextInput, TextInputProps } from 'react-native'
import TextInput from './text-input'

type DebouncedTextInputProps = TextInputProps & {
  /**
   * Delay in seconds
   * @default 0.5
   */
  delay?: number
}

const DebouncedTextInput = forwardRef<RnTextInput, DebouncedTextInputProps>((props, ref) => {
  const timer = useRef<NodeJS.Timeout | null>(null)
  const delayMs = props.delay ? props.delay * 1000 : 500

  const modifiedProps: TextInputProps = {
    ...props,
    onChange: (e) => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      timer.current = setTimeout(() => {
        props.onChange?.(e)
      }, delayMs)
    },
    onChangeText: (text) => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      timer.current = setTimeout(() => {
        props.onChangeText?.(text)
      }, delayMs)
    },
  }

  return <TextInput {...modifiedProps} ref={ref} />
})

export default DebouncedTextInput
