import Text from '@/components/text'
import { LucideSearch } from 'lucide-react-native'
import { ScrollView, TextInput, View } from 'react-native'
import { indigo, neutral } from 'tailwindcss/colors'

export default function SchedulesScreen() {
  return (
    <ScrollView overScrollMode='never'>
      <Text className='mx-4 text-4xl mt-16 mb-4 font-sans-bold'>Расписания</Text>
      <Text className='font-sans dark:text-neutral-500 mx-4 mb-6'>Ищите расписание своей группы по предметам, кабинетам или преподавателям</Text>
      <View className='mx-4'>
        <TextInput selectionColor={neutral[700]} selectionHandleColor={indigo[500]} placeholder='СПСТЭД:511-21' className='text-neutral-200 text-lg font-sans border p-4 border-neutral-800 rounded-md focus:border-indigo-500 caret-indigo-500 placeholder:text-neutral-500' />
        <LucideSearch strokeWidth={1} className='absolute text-neutral-500 size-7 right-4 top-1/2 -translate-y-1/2' />
      </View>
      {/*  */}
      <View className='bg-indigo-500/10 p-4 h-[200vh] justify-center'></View>
    </ScrollView>
  )
}
