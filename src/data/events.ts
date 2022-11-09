import { format } from 'date-fns';
import { initializeApp } from 'firebase/app'
import { collection, doc, getFirestore, limit, onSnapshot, orderBy, query, QueryConstraint, QuerySnapshot, where } from "firebase/firestore";

import { computed, onMounted, onUnmounted, Ref, ref, watch } from 'vue';
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
  spotify_id: string,
  spotify_image: string,
  extra: string,
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
    locationRef: Ref<undefined | string>) {
  
  const firestore = getFirestore()
  const events = ref<DanceEvent[]>([])

  const eventCol = collection(firestore, 'events')
  const filters = computed<QueryConstraint[]>(() => {
    const dates = datesRef.value
    const location = locationRef.value 
      ? [where('region', '==', locationRef.value)]
      : []
    if (dates) {
      const { start, end } = dates
      return [
        where('date', '>=', iso(start)),
        where('date', '<=', iso(end)),
        ...location,
        orderBy("date")
      ]
    }
    return [where('date', '>=', iso()), ...location]
  })
  const eventsQuery = computed(() => query(eventCol, ...filters.value, limit(100)))
  
  function onSnapshotUpdated(snap: QuerySnapshot) {
    console.log('Loaded',  snap.size ,'events')
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
    unsubscribe.value = onSnapshot(q, onSnapshotUpdated);
  })
  onMounted(() => {
    unsubscribe.value = onSnapshot(eventsQuery.value, onSnapshotUpdated, err => console.error(err));
  })
  onUnmounted(() => {
    if (unsubscribe.value) {
      unsubscribe.value()
    }
  })

  return { events }
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