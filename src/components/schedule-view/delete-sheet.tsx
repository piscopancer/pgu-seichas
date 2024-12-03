import { BottomSheet } from '@/components/bottom-sheet'
import SheetTextInput from '@/components/sheet-text-input'
import Text from '@/components/text'
import { db } from '@/db'
import { qc, queryKeys } from '@/query'
import { ScheduleStore } from '@/store/schedule'
import { colors } from '@/utils'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { forwardRef, useState } from 'react'
import { Pressable } from 'react-native'

const DeleteSheet = forwardRef<BottomSheetMethods, { schedule: ScheduleStore }>((props, ref) => {
  const [confirmSchedule, setConfirmSchedule] = useState('')
  const router = useRouter()
  const deleteScheduleMutation = useMutation({
    mutationFn: () =>
      db.schedule.delete({
        where: {
          id: props.schedule.id,
        },
      }),
    async onSuccess() {
      await qc.invalidateQueries({ queryKey: queryKeys.schedules() })
      router.replace('/publishing/schedules')
    },
  })

  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        <Text className='mb-4 mt-6 mx-6 text-lg text-center font-sans-bold'>{props.schedule.name}</Text>
        <Text className='mb-6 mx-6 text-lg text-center'>Чтобы удалить расписание, введите его название</Text>
        <SheetTextInput defaultValue={confirmSchedule} placeholder={props.schedule.name} onChangeText={(text) => setConfirmSchedule(text.trim())} className='mb-4 mx-6 focus:border-rose-500 caret-rose-500' />
        <Pressable
          android_ripple={{ color: colors.rose[700] }}
          onPress={() => deleteScheduleMutation.mutate()}
          disabled={confirmSchedule.toLowerCase() !== props.schedule.name.toLowerCase() || deleteScheduleMutation.isPending}
          className='disabled:opacity-50 disabled:bg-neutral-800 py-4 bg-rose-500/20 rounded-md mx-6 mb-6'
        >
          <Text disabled={confirmSchedule.toLowerCase() !== props.schedule.name.toLowerCase() || deleteScheduleMutation.isPending} className='text-center text-lg dark:text-rose-500 disabled:dark:text-neutral-200'>
            Удалить
          </Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  )
})

export default DeleteSheet
