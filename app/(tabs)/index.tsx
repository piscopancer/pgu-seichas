import Switch from '@/components/switch'
import Text from '@/components/text'
import { cn } from '@/utils'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { indigo } from 'tailwindcss/colors'

export default function HomeScreen() {
  const [yes, setYes] = useState(false)

  return (
    <View className='flex-1'>
      <View className='self-center bg-red-300/20 overflow-hidden rounded-full aspect-square size-[50vw]'>
        <Pressable
          onPress={async () => {}}
          android_ripple={{
            color: indigo[300],
          }}
          className={cn(false ? 'bg-neutral-500' : 'bg-indigo-500', 'items-center justify-center flex-1 rounded-full')}
        >
          <Text className='text-2xl'>{false ? 'Stop' : 'Start'}</Text>
        </Pressable>
      </View>
      <Pressable>
        <Text>Messages from the stars</Text>
      </Pressable>
      <Pressable
        className='p-8 bg-neutral-900'
        // onPress={async () => {
        //   createTestData()
        // }}
      >
        <Text>kill 5</Text>
      </Pressable>
      <Switch
        action={(current) => {
          setYes(!current)
          return !current
        }}
        enabled={yes}
      />
    </View>
  )
}
