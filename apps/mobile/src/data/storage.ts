import { Preferences } from '@capacitor/preferences';
import { onMounted, ref, watch } from 'vue';

export function useStorage<T>(key: string, defaultValue?: T) {
    const refValue = ref<T | undefined>(defaultValue)
    onMounted(async () => {
        const { value } = await Preferences.get({ key  })
        if (value) {
          try {
            refValue.value = JSON.parse(value)
          } catch(e) {
            console.warn('Unable to read storage', key, value)
            await Preferences.remove({ key })
          }
        }
    })
    watch(refValue, async (val) => {
        await Preferences.set({ key, value: JSON.stringify(val) })
    })

    return refValue
}