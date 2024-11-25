import { cn } from '@/utils'
import { ForwardedRef, forwardRef } from 'react'
import { TextInput as RnTextInput, TextInputProps } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'

function TextInput(props: TextInputProps & { ref: ForwardedRef<RnTextInput> }) {
  const _props: TextInputProps = {
    ...props,
    className: cn('text-neutral-200 text-lg font-sans border py-4 px-5 border-neutral-800 rounded-md focus:border-indigo-500 caret-indigo-500 placeholder:text-neutral-500', props.className),
    selectionColor: neutral[700],
    selectionHandleColor: indigo[500],
  }

  return <RnTextInput {..._props} ref={props.ref} />
}

export default forwardRef((props: TextInputProps, ref: ForwardedRef<RnTextInput>) => <TextInput {...props} ref={ref} />)
