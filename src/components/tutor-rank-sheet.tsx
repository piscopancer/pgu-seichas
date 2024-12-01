import { Rank, ranks, ranksInfo } from '@/tutor'
import { capitalizeFirstLetter, colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { forwardRef } from 'react'
import { FlatList, Pressable } from 'react-native'
import { BottomSheet } from './bottom-sheet'
import Text from './text'

type TutorRankSheetProps = {
  onSelect: (rank: Rank | null) => void
}

const TutorRankSheet = forwardRef<BottomSheetMethods, TutorRankSheetProps>((props, ref) => {
  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        <Pressable
          android_ripple={{ color: colors.neutral[700] }}
          onPress={() => {
            props.onSelect(null)
            if (typeof ref === 'object') {
              ref?.current?.close()
            }
          }}
          className='px-6 py-4 flex-row items-center border-b border-neutral-800'
        >
          <Text className='text-lg'>Не указана</Text>
        </Pressable>
        <FlatList
          data={ranks}
          renderItem={({ item: rank }) => (
            <Pressable
              android_ripple={{ color: colors.neutral[700] }}
              onPress={() => {
                props.onSelect(rank)
                if (typeof ref === 'object') {
                  ref?.current?.close()
                }
              }}
              className='px-6 py-4 flex-row items-center'
            >
              <Text className='text-lg line-clamp-1'>{capitalizeFirstLetter(ranksInfo[rank].long)}</Text>
            </Pressable>
          )}
        />
      </BottomSheetView>
    </BottomSheet>
  )
})

export default TutorRankSheet
