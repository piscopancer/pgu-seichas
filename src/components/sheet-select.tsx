import { colors } from '@/utils'
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Portal } from '@gorhom/portal'
import { ComponentProps, Dispatch, PropsWithChildren, ReactElement, SetStateAction, useEffect, useRef, useState } from 'react'
import { FlatList, ListRenderItemInfo, Pressable, TextInput } from 'react-native'
import Text from './text'

type SheetSelectProps<O extends unknown = unknown> = PropsWithChildren<{
  options: O[]
  renderOption: (option: ListRenderItemInfo<O>, setOpen: Dispatch<SetStateAction<boolean>>) => ReactElement
  open?: boolean
  setOpen?: Dispatch<SetStateAction<boolean>>
  onUnselect?: (unselected: null) => void
  pressableProps?: ((open: boolean) => ComponentProps<typeof Pressable>) | ComponentProps<typeof Pressable>
}>

export default function SheetSelect<O>(props: SheetSelectProps<O>) {
  const sheetRef = useRef<BottomSheetModal>(null)
  const [open, setOpen] = useState(props.open ?? false)
  props.setOpen = setOpen

  useEffect(() => {
    if (open) {
      sheetRef.current?.expand()
    } else {
      sheetRef.current?.close()
    }
  }, [open])

  return (
    <>
      <Pressable onPress={() => setOpen((prev) => !prev)} {...(typeof props.pressableProps === 'function' ? props.pressableProps?.(open) : props.pressableProps)}>
        {props.children}
      </Pressable>
      <Portal>
        <BottomSheet
          backdropComponent={BottomSheetBackdrop}
          index={-1}
          snapPoints={['50%']}
          ref={sheetRef}
          backgroundStyle={{
            backgroundColor: colors.neutral[900],
          }}
          handleIndicatorStyle={{ backgroundColor: colors.neutral[700] }}
          enablePanDownToClose
          onClose={() => setOpen(false)}
        >
          <BottomSheetView>
            <TextInput placeholder='Поиск...' className='bg-neutral-950 m-4 border border-transparent rounded-md dark:text-neutral-200 placeholder:text-neutral-500 font-sans focus:border-indigo-500 caret-indigo-500 text-lg p-4' />
            <Pressable
              onPress={() => {
                props.onUnselect?.(null)
                setOpen(false)
              }}
              android_ripple={{
                color: colors.neutral[700],
              }}
              className='py-4'
            >
              <Text className='dark:text-neutral-500 text-lg text-center'>Сбросить</Text>
            </Pressable>
            <FlatList data={props.options} renderItem={(option) => props.renderOption(option, setOpen)} />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </>
  )
}
