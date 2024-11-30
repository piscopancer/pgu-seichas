import { cn } from '@/utils'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput'
import { forwardRef } from 'react'
import { TextInput } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'

const SheetTextInput = forwardRef<TextInput, BottomSheetTextInputProps>((props, ref) => {
  const modifiedProps: BottomSheetTextInputProps = {
    ...props,
    className: cn('text-neutral-200 text-lg font-sans border py-4 px-5 border-neutral-800 rounded-md focus:border-indigo-500 caret-indigo-500 placeholder:text-neutral-500', props.className),
    selectionColor: neutral[700],
    selectionHandleColor: indigo[500],
  }

  return <BottomSheetTextInput {...modifiedProps} ref={ref as any} />
})

export default SheetTextInput
