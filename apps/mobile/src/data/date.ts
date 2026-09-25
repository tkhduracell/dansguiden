import { ref } from 'vue'
import { addWeeks } from 'date-fns'

export function useRangeSelect() {
    const isSelectingRange = ref(false)
    const range = ref<{ start: Date, end: Date }>()
    
    function onDateRangeSelected() {
      isSelectingRange.value = false
    }

    function selectQuickRange(weeks: number) {
      range.value = {
        start: new Date(),
        end: addWeeks(new Date(), weeks)
      }
      setTimeout(() => isSelectingRange.value = false, 300)
    }

    return {
        isSelectingRange,
        range,
        onDateRangeSelected,
        selectQuickRange
    }
}