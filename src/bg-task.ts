import * as BackgroundFetch from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { ToastAndroid } from 'react-native'

export const BACKGROUND_FETCH_TASK = 'bg-task1'

export function defineBGTask() {
  return TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    const now = Date.now()

    console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`)
    ToastAndroid.show('Hello World :-)', ToastAndroid.LONG)

    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData
  })
}

export function registerBackgroundTask() {
  console.log(`Registering ${BACKGROUND_FETCH_TASK}`)
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 10,
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

export function unregisterBackgroundTask() {
  console.log(`Unregistering ${BACKGROUND_FETCH_TASK}`)
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
}
