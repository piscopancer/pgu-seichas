import useTutorsQuery from '@/hooks/query/use-tutors'
import { colors } from '@/utils'
import { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { LucideSearch } from 'lucide-react-native'
import { forwardRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { BottomSheet } from './bottom-sheet'
import SheetTextInput from './sheet-text-input'
import Text from './text'

type SubjectTutorSheetProps = {
  onSelect: (tutorId: number | null) => void
}

const SubjectTutorSheet = forwardRef<BottomSheetMethods, SubjectTutorSheetProps>((props, ref) => {
  const [search, setSearch] = useState('')
  const tutorsQuery = useTutorsQuery({
    select: (tutors) =>
      tutors.filter((t) => {
        if (!search.trim() || [t.name, t.surname, t.middlename].some((el) => el.toLowerCase().includes(search.toLowerCase()))) {
          return t
        }
      }),
  })

  return (
    <BottomSheet android_keyboardInputMode='adjustResize' ref={ref}>
      <View className='flex-row items-center mx-6 my-4'>
        <SheetTextInput defaultValue={search} onChangeText={setSearch} className='flex-1' />
        <LucideSearch strokeWidth={1} className='absolute right-5 color-neutral-500' />
      </View>
      <Pressable
        android_ripple={{ color: colors.neutral[700] }}
        onPress={() => {
          props.onSelect(null)
          if (typeof ref === 'object') {
            ref?.current?.close()
          }
        }}
        className='px-6 py-4'
      >
        <Text className='text-lg'>Не указан</Text>
      </Pressable>
      <View className='border-b border-neutral-800 mx-6' />
      {tutorsQuery.data && (
        <BottomSheetFlatList
          scrollEnabled
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
    </BottomSheet>
  )
})

export default SubjectTutorSheet
