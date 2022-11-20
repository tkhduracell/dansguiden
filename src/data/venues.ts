import { collection, getDocs, getFirestore, query, orderBy } from "firebase/firestore";
import { sortedUniq } from "lodash";
import { computed, onMounted, ref } from "vue";
import { useStorage } from "./storage";

export type Venue = {
    name: string,
    count: number,
    in30Days: number,
}

export function useVenueSelect() {
    const venues = useStorage<string[]>('venues')

    const filter = ref<string>()
    const isSelectingVenue = ref(false)
    const all = ref<Venue[]>([
      { name: 'Nalen', count: 0, in30Days: 0 }
    ])
    
    const store = getFirestore()
    const q = query(
        collection(store, 'metadata_places'), 
        // where('in30Days', '>=', 1),
        orderBy('count')
    )

    onMounted(() => {
        setTimeout(async () => {
            const docs = await getDocs(q)
            const out: Venue[] = []
            docs.forEach(item => {
                const { count, in30Days } = item.data() as Pick<Venue, 'count' | 'in30Days'> 
                out.push({ name: item.id, count, in30Days })
            })
            console.log('Loaded', out.length, 'venues')
            all.value = out
        }, 500)
    })

    function selectVenue(name: string) {
        if (venues.value?.includes(name)) {
            venues.value = venues.value.filter(l => l !== name)
        } else {
            venues.value = sortedUniq([name, ...(venues.value ?? [])].sort())
        }
        filter.value = undefined
    }

    const allVenues = computed(() => {
        const f = filter.value
        const nonSelections = all.value.filter(b => !venues.value?.includes(b.name))
        if (f && f.length >= 2) {
            return nonSelections.filter(b => b.name.toLocaleLowerCase().startsWith(f.toLocaleLowerCase()))
        }
        return nonSelections.slice(0, 14) ?? []
    })

    return { filter, venues, allVenues, isSelectingVenue, selectVenue }
}