import useTutorsQuery from '@/hooks/query/use-tutors'
import { colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { LucideUserRound, LucideUserRoundX } from 'lucide-react-native'
import { forwardRef } from 'react'
import { FlatList, Pressable } from 'react-native'
import { BottomSheet } from './bottom-sheet'
import Text from './text'

type SubjectTutorSheetProps = {
  onSelect: (tutorId: number | null) => void
}

const SubjectTutorSheet = forwardRef<BottomSheetMethods, SubjectTutorSheetProps>((props, ref) => {
  const tutorsQuery = useTutorsQuery()

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
          <LucideUserRoundX strokeWidth={1} className='mr-5 color-neutral-500' />
          <Text className='text-lg'>Не указан</Text>
        </Pressable>
        {tutorsQuery.data && (
          <FlatList
            data={tutorsQuery.data}
            renderItem={({ item: tutor }) => (
              <Pressable
                android_ripple={{ color: colors.neutral[700] }}
                onPress={() => {
                  props.onSelect(tutor.id)
                  if (typeof ref === 'object') {
                    ref?.current?.close()
                  }
                }}
                className='px-6 py-4 flex-row items-center'
              >
                <LucideUserRound strokeWidth={1} className='mr-5 color-neutral-500' />
                <Text className='text-lg line-clamp-1'>
                  {tutor.surname}{' '}
                  <Text className='dark:text-neutral-500'>
                    {tutor.name} {tutor.middlename}
                  </Text>
                </Text>
              </Pressable>
            )}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  )
})

export default SubjectTutorSheet
