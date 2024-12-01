import * as deviceStore from 'expo-secure-store'
import { atom, useAtom } from 'jotai'
import { z } from 'zod'

const schemas = {
  publisherToken: z.string({ coerce: true }).nullable().catch(null),
  lessonViewMode: z.union([z.literal('position'), z.literal('time')]).catch('position'),
  selectedScheduleId: z.number({ coerce: true }).nonnegative().nullable().catch(null),
}

type Atom<V> = ReturnType<typeof atom<V>>

type Atoms = { [key in keyof typeof schemas]: Atom<z.infer<(typeof schemas)[key]>> }

function initStoreAtoms() {
  const store = {} as Atoms
  for (const _key in schemas) {
    const key = _key as keyof DeviceStore
    const value = schemas[key].parse(deviceStore.getItem(key))
    ;(store[key] as any) = atom(value)
  }
  return store
}

const storeAtoms = initStoreAtoms()

export type DeviceStore = { [key in keyof typeof schemas]: z.infer<(typeof schemas)[key]> }

export function useDeviceStore<K extends keyof Atoms>(key: K) {
  const [storeValue, setStoreValue] = useAtom(storeAtoms[key])

  async function setValue(value: Parameters<typeof setStoreValue>[0]) {
    setStoreValue(value)
    if (value instanceof Function) {
      const v = value(storeValue)
      if (v) {
        return deviceStore.setItemAsync(key, String(v))
      } else {
        return deviceStore.deleteItemAsync(key)
      }
    } else {
      if (value) {
        return deviceStore.setItemAsync(key, String(value))
      } else {
        return deviceStore.deleteItemAsync(key)
      }
    }
  }

  return [storeValue, setValue] as const
}
