import { collection, getDocs, getFirestore, query, orderBy, where } from "firebase/firestore";
import { sortedUniq } from "lodash";
import { computed, onMounted, ref } from "vue";
import { useStorage } from "./storage";

export type Band = {
    id?: string,
    name: string,
    genres: string[],
    images: { height: number, width: number, url: string }[],
    updated_at: Date
    main_image?: string,
    embed_url?: string
}

export type BandItem = { name: string, id: string }
export function useBandSelect() {
    const bands = useStorage<string[]>('bands')

    const filter = ref<string>()
    const isSelectingBand = ref(false)
    const all = ref<BandItem[]>([
      { name: 'Sannex', id: '1' }, 
      { name: 'Blender', id: '2' }, 
      { name: 'Duo Vi', id: '3' }
    ])
    
    const store = getFirestore()
    const q = query(
        collection(store, 'metadata_bands'), 
        where('counts.in_180_days', '>=', 1),
        orderBy('counts.in_180_days')
    )

    onMounted(() => {
        setTimeout(async () => {
            const docs = await getDocs(q)
            const out: BandItem[] = []
            docs.forEach(item => {
                out.push({ name: item.id, id: item.id })
            })
            console.log('Loaded', out.length, 'bands')
            all.value = out
        }, 500)
    })

    function selectBand(name: string) {
        if (bands.value?.includes(name)) {
            bands.value = bands.value.filter(l => l !== name)
        } else {
            bands.value = sortedUniq([name, ...(bands.value ?? [])].sort())
        }
        if (bands.value.length === 0) {
            bands.value = undefined
        }
        filter.value = undefined
    }

    const allBands = computed(() => {
        const f = filter.value
        const nonSelections = all.value.filter(b => !bands.value?.includes(b.name))
        if (f && f.length >= 2) {
            return nonSelections.filter(b => b.name.toLocaleLowerCase().startsWith(f.toLocaleLowerCase()))
        }
        return nonSelections.slice(0, 14) ?? []
    })

    return { filter, bands, allBands, isSelectingBand, selectBand }
}