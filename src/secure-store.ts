import * as store from 'expo-secure-store'
import { useState } from 'react'
import { z } from 'zod'

const schemas = {
  publisherToken: z.string().nullable().catch(null),
  lessonViewMode: z.union([z.literal('position'), z.literal('time')]).catch('position'),
}

export type SecureStore = { [key in keyof typeof schemas]: z.infer<(typeof schemas)[key]> }

export function useSecureStore<K extends keyof SecureStore, V extends string | null = SecureStore[K]>(key: K) {
  const schema = schemas[key]
  const [storeValue, setStoreValue] = useState<V>(schema.parse(store.getItem(key)) as V)

  async function setValue(value: V) {
    setStoreValue(value)
    if (value) {
      return store.setItemAsync(key, value)
    } else {
      return store.deleteItemAsync(key)
    }
  }

  return [storeValue, setValue] as const
}
