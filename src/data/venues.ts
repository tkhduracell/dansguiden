import { collection, getDocs, getFirestore, query, orderBy, where } from "firebase/firestore";
import { sortBy, sortedUniq } from "lodash";
import { computed, onMounted, ref } from "vue";
import { useStorage } from "./storage";

export type Venue = {
    name: string,
//    city: string
//    county: string
    region: string
    count: number
//    in7Days: number
    in30Days: number
//    in90Days: number
    in180Days: number
    image?: string
}

export function useVenueSelect() {
    const venues = useStorage<string[]>('venues')

    const filter = ref<string>()
    const isSelectingVenue = ref(false)
    const all = ref<Venue[]>([
      { name: 'Nalen', region: 'Stockholm', count: 1, in180Days: 1, in30Days: 1 }
    ])
    
    const store = getFirestore()
    const q = query(
        collection(store, 'metadata_places'), 
        where('counts.in_180_days', '>=', 1),
        orderBy('counts.in_180_days')
    )

    onMounted(() => {
        setTimeout(async () => {
            const docs = await getDocs(q)
            const out: Venue[] = []
            docs.forEach(item => {
                const { count, region, in30Days, in180Days } = item.data() as Pick<Venue, 'count' | 'region' | 'in30Days' | 'in180Days'> 
                out.push({ name: item.id, count, region, in30Days, in180Days })
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
            const byName =  nonSelections.filter(b => b.name.toLocaleLowerCase().startsWith(f.toLocaleLowerCase()))
            if (byName.length === 0) {
                const byRegion = nonSelections.filter(b => b.region.toLocaleLowerCase().startsWith(f.toLocaleLowerCase()))
                return sortBy(byRegion, l => l.name)    
            }
            return sortBy(byName, l => l.name)
        }
        return nonSelections.slice(0, 14) ?? []
    })

    return { filter, venues, allVenues, isSelectingVenue, selectVenue }
}