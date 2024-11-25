import { colors } from '@/utils'
import RNBottomSheet, { BottomSheetBackdrop, BottomSheetProps } from '@gorhom/bottom-sheet'
import { Portal } from '@gorhom/portal'
import { ForwardedRef, forwardRef, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function useBottomSheetRef() {
  return useRef<RNBottomSheet>(null)
}

export type BottomSheetForwardedRef = ForwardedRef<RNBottomSheet>

export const BottomSheet = forwardRef(({ children, ...props }: BottomSheetProps, ref: BottomSheetForwardedRef) => {
  const insets = useSafeAreaInsets()

  return (
    <Portal>
      <RNBottomSheet
        backdropComponent={BottomSheetBackdrop}
        index={-1}
        snapPoints={['50%']}
        backgroundStyle={{
          backgroundColor: colors.neutral[900],
        }}
        topInset={insets.top}
        ref={ref}
        handleIndicatorStyle={{ backgroundColor: colors.neutral[700] }}
        enablePanDownToClose
        {...props}
      >
        {children}
      </RNBottomSheet>
    </Portal>
  )
})
