import { store } from '@davstack/store'
import * as deviceStore from 'expo-secure-store'
import { z } from 'zod'

const schemas = {
  publisherToken: z.string({ coerce: true }).nullable().catch(null),
  selectedScheduleId: z.number({ coerce: true }).nonnegative().nullable().catch(null),
  lessonViewMode: z.union([z.literal('position'), z.literal('time')]).catch('position'),
  scheduleViewMode: z.union([z.literal('tabs'), z.literal('list')]).catch('tabs'),
}

type Atoms = { [key in keyof typeof schemas]: z.infer<(typeof schemas)[key]> }

const deviceStoreStore = store(initStoreAtoms())

function initStoreAtoms() {
  const store = {} as Atoms
  for (const _key in schemas) {
    const key = _key as keyof DeviceStore
    const value = schemas[key].parse(deviceStore.getItem(key))
    ;(store[key] as any) = value
  }
  return store
}

export type DeviceStore = { [key in keyof typeof schemas]: z.infer<(typeof schemas)[key]> }

export function useDeviceStore<K extends keyof Atoms>(key: K) {
  const valueSnap = deviceStoreStore.use((store) => store[key])

  async function setValue(value: Parameters<(typeof deviceStoreStore)[K]['set']>[0]) {
    if (value instanceof Function) {
      const calculatedValue = value(valueSnap as never)
      deviceStoreStore[key].set(calculatedValue as never)
      if (calculatedValue) {
        return deviceStore.setItemAsync(key, String(calculatedValue))
      } else {
        return deviceStore.deleteItemAsync(key)
      }
    } else {
      deviceStoreStore[key].set(value as never)
      if (value) {
        return deviceStore.setItemAsync(key, String(value))
      } else {
        return deviceStore.deleteItemAsync(key)
      }
    }
  }

  return [valueSnap, setValue] as const
}
