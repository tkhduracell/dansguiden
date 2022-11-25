import { format, addDays } from 'date-fns';
import { initializeApp } from 'firebase/app'
import { collection, doc, getFirestore, limit, onSnapshot, orderBy, query, QueryConstraint, QuerySnapshot, where } from "firebase/firestore";

import { computed, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
export type MetadataBand = {
  spotify: {
    id: string,
    name: string,
    image_small?: string
    image_large?: string
  } | Record<string, never>
}
export type MetadataPlace = {
  general: {
    county: string,
    region: string,  
    city: string,
    website_url?: string,
    facebook_url?: string
    program_url?: string
  },
  places_api: {
    place_id: string,
    address: string,
    name: string,
    photo_large?: string,
    photo_small?: string
  }
}

export type DanceEvent = {
  _id: string,
  city: string,
  band: string,
  place: string,
  weekday: string,
  county: string,
  region: string,
  date: string,
  time: string,
  updated_at: string,
  updated_at_pretty: string,
  spotify_id?: string,
  spotify_image?: string,
  extra: string,
  metadata: {
    band: MetadataBand,
    place: MetadataPlace
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyDCki04q59wZM_BEzTs2BwZF1QydfabQXg",
  authDomain: "dansguiden-b3a7d.firebaseapp.com",
  databaseURL: "https://dansguiden-b3a7d.firebaseio.com",
  projectId: "dansguiden-b3a7d",
  storageBucket: "dansguiden-b3a7d.appspot.com",
  messagingSenderId: "58654864940",
  appId: "1:58654864940:web:51a50793d5748ed18dc389"
};
initializeApp(firebaseConfig)

function iso(date?: Date): string {
  return format(date ?? new Date(), 'yyyy-MM-dd')
}

export function useEvents(
    datesRef: Ref<undefined | { start: Date, end: Date }>, 
    locationRef: Ref<undefined | string[]>,
    venueRef: Ref<undefined | string[]>,
    bandsRef: Ref<undefined | string[]>) {
  
  const firestore = getFirestore()
  const events = ref<DanceEvent[]>([])
  const loading = ref(false)

  function isBand(e: DanceEvent) {
    const filters = bandsRef.value
    if (filters && filters.length > 0) {
      return filters?.includes(e.band)
    }
    return true
  }

  const eventCol = collection(firestore, 'events')
  const filters = computed<QueryConstraint[]>(() => {
    const hasLocation = locationRef.value && locationRef.value.length > 0
    const hasVenue = venueRef.value && venueRef.value.length > 0
    const hasBand = bandsRef.value && bandsRef.value.length > 0
    
    const location = hasLocation
      ? [where('region', 'in', locationRef.value)]
      : []
    const venue = hasVenue
      ? [where('place', 'in', venueRef.value)]
      : []
    const dates = datesRef.value ? 
      [
        where('date', '>=', iso(datesRef.value.start)),
        where('date', '<=', iso(datesRef.value.end))
      ] : [
        where('date', '>=', iso()),
        where('date', '<=', iso(addDays(new Date(), 30)))
      ]
    const bands = (hasLocation || datesRef.value || !hasBand) ? []
      : [where('band', 'in', bandsRef.value)]

    return [
      ...(hasVenue ? venue : location),
      ...dates,
      ...bands,
      orderBy("date"),
      limit(hasLocation || datesRef.value ? 10000 : 10)
    ]
  })
  const eventsQuery = computed(() => query(eventCol, ...filters.value))
  
  function onSnapshotUpdated(snap: QuerySnapshot) {
    console.log('Loaded',  snap.size ,'events')
    loading.value = false
    const docs: DanceEvent[] = [];
    snap.forEach((doc) => {
        docs.push(doc.data() as DanceEvent);
    });
    events.value = docs;
  }

  const unsubscribe = ref<() => void>()
  watch(eventsQuery, q => {
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = undefined
    }
    console.log('Loading events...')
    loading.value = true
    unsubscribe.value = onSnapshot(q, onSnapshotUpdated);
  })
  onMounted(() => {
    console.log('Loading events...')
    loading.value = true
    unsubscribe.value = onSnapshot(eventsQuery.value, onSnapshotUpdated, err => console.error(err));
  })
  onUnmounted(() => {
    if (unsubscribe.value) {
      unsubscribe.value()
    }
  })

  function refresh(fn: () => void) {
    events.value = []
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = undefined
    }
    console.log('Loading events...')
    loading.value = true
    unsubscribe.value = onSnapshot(eventsQuery.value, (res) => {
      onSnapshotUpdated(res)
      fn()
    });
  }

  const filtered = computed(() => {
    return events.value.filter(isBand)
  })

  return { events: filtered, refresh }
}

export function useEvent(id: string) {
  const firestore = getFirestore()
  const event = ref<DanceEvent>()
  
  const eventRef = doc(firestore, 'events', id)

  const unsubscribe = ref<() => void>()

  onMounted(async () => {
     unsubscribe.value = onSnapshot(eventRef, (querySnapshot) => {
      event.value = querySnapshot.data() as DanceEvent;
    });
  })

  onUnmounted(() => {
    if (unsubscribe.value) {
      unsubscribe.value()
    }
  })

  return { event }
}