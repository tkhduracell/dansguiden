import { doc, getDoc, getFirestore } from "firebase/firestore";
import { maxBy } from "lodash";
import { ref, Ref, watch } from "vue";

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