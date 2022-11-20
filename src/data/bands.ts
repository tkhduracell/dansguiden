import { collection, doc, getDoc, getDocs, getFirestore, query, orderBy } from "firebase/firestore";
import { maxBy, sortedUniq } from "lodash";
import { computed, onMounted, ref, Ref, watch } from "vue";
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

export function useBand(bandNameRef: Ref<string | undefined>) {
    const store = getFirestore()
    
    const band = ref<Band>()
    
    watch(bandNameRef, async (bandName) => {
        if (bandName) {
            const d = doc(store, 'band_metadata', bandName)
            const result = await getDoc(d)
            const data = result.data() as Band
            
            const main_image = maxBy(data.images, i => i.height)?.url

            const embed_url = data.id ? `https://open.spotify.com/embed/artist/${data.id}?utm_source=generator` : undefined
            band.value = { ...data, main_image, embed_url }

        } else {
            band.value = undefined
        }
    })
    
    return { band }
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
        // where('in30Days', '>=', 1),
        orderBy('count')
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