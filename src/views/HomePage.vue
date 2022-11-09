<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Dansguiden</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Inbox</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-list>
        <ion-chip :outline="true" @click="isSelectingRange = true">
          <ion-icon :icon="icons.calendar" color="primary"></ion-icon>
    
          <span v-if="range">{{ fmt(range.start) }} -  {{ fmt(range.end) }}</span>
          <span v-else>Välj Datum</span>
           
          <ion-icon :icon="icons.close" @click.prevent="range = undefined" v-if="range"></ion-icon>
        </ion-chip>

        <ion-chip @click="isSelectingLocation = true">
          <ion-icon :icon="icons.mapSharp" color="primary"></ion-icon>
          <span v-if="location">{{ location }}</span>
          <span v-else>Välj plats</span>
        </ion-chip>

        <EventListItem v-for="event in events" 
          :key="event._id" :event="event" />
      </ion-list>

      <ion-modal :is-open="isSelectingRange" :initial-breakpoint="0.9" :breakpoints="[0.9]">
        <ion-header>
          <ion-toolbar>
            <ion-title>Välj datum</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isSelectingRange = false">Klar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="quick-filter">
            <b>Snabbfilter: </b>
            <div>
              <ion-button size="small" fill="outline" @click="selectQuickRange(2)">Kommande 2 veckor</ion-button>
              <ion-button size="small" fill="outline" @click="selectQuickRange(4)">Kommande månad</ion-button>
            </div>
          </div>
          <date-picker mode="date" :sm=12 :rows=2 v-model="range" is-range is-expanded />
        </ion-content>
      </ion-modal>


      <ion-modal :is-open="isSelectingLocation" ref="modal" :initial-breakpoint="0.75" :breakpoints="[0, 0.75]">
        <ion-content class="ion-padding">
          <ion-searchbar placeholder="Sök" disabled></ion-searchbar>
          <ion-list>
            <ion-item v-for="l in locations" :key="'loc-' + l.id" @click="selectLocation(l.name)">
              <ion-label>
                <h2>{{ l.name }}</h2>
                <p>{{ l.city }}</p>
              </ion-label>
              <ion-icon :icon="icons.checkmarkSharp" color="primary" slot="end" v-if="location == l.name"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

    </ion-content>

  </ion-page>
</template>

<script lang="ts">
import { 
  IonContent, IonHeader, IonList, 
  IonPage, IonRefresher, IonRefresherContent, 
  IonTitle, IonToolbar, IonModal,
  IonButton, IonSearchbar, IonLabel,
  IonButtons, IonChip, IonIcon
} from '@ionic/vue'
import EventListItem from '@/components/EventListItem.vue'
import { defineComponent, ref } from 'vue'
import { useEvents } from '@/data/events'
import { DatePicker } from 'v-calendar'
import { formatRelative, addWeeks, format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { close, calendar, mapSharp, checkmarkSharp } from 'ionicons/icons';

export default defineComponent({
  name: 'HomePage',
  setup() {
    const isSelectingRange = ref(false)
    const isSelectingLocation = ref(false)
    const range = ref<{ start: Date, end: Date }>()
    const location = ref<string>()
    const locations = [  
      { id: 1, name: "Blekinge", city: "Karlskrona"},
      { id: 2, name: "Dalarna", city: "Falun"},
      { id: 3, name: "Gävleborg", city: "Gävle"},
      // { id: 4, name: "Gotland", city: "Visby"},
      { id: 5, name: "Halland", city: "Halmstad"},
      { id: 6, name: "Jämtland", city: "Östersund"},
      { id: 7, name: "Jönköping", city: "Närområde"},
      { id: 8, name: "Kalmar", city: "Öland"},
      { id: 9, name: "Kronoberg", city: "Växjö"},
      { id: 10, name: "Norrbotten", city: "Luleå"},
      { id: 11, name: "Örebro", city: "Närområde"},
      { id: 12, name: "Östergötland", city: "Linköping"},
      { id: 13, name: "Skåne", city: "Malmö"},
      { id: 14, name: "Södermanland", city: "Nyköping"},
      { id: 15, name: "Stockholm", city: "Närområde"},
      { id: 16, name: "Uppsala", city: "Närområde"},
      { id: 17, name: "Värmland", city: "Karlstad"},
      { id: 18, name: "Västerbotten", city: "Umeå"},
      { id: 19, name: "Västernorrland", city: "Härnösand"},
      { id: 20, name: "Västmanland", city: "Västerås"},
      { id: 21, name: "Västra Götaland", city: "Göteborg"}
    ]
    const { events } = useEvents(range, location)

    function onDateRangeSelected() {
      isSelectingRange.value = false
    }
    function selectLocation (name: string) {
      location.value = name
      isSelectingLocation.value = false
    }
    function selectQuickRange(weeks: number) {
      range.value = {
        start: new Date(),
        end: addWeeks(new Date(), weeks)
      }
      isSelectingRange.value = false
    }

    return {
      events,
      range,
      location,
      locations,
      isSelectingRange,
      isSelectingLocation,
      onDateRangeSelected,
      selectLocation,
      selectQuickRange,
      refresh: (ev: CustomEvent) => {
          setTimeout(() => {
            ev.detail.complete();
          }, 3000);
      },
      fmt: (d: Date) => {
        const out = format(d, 'yyyy-MM-dd')
      
        return out.toLocaleUpperCase()
      },
      icons: { close, calendar, mapSharp, checkmarkSharp }
    }
  },
  components: {
    IonContent,
    IonHeader,
    IonList,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
    IonModal,
    IonButton,
    IonSearchbar, 
    IonLabel,
    IonButtons, 
    IonChip, 
    IonIcon,
    DatePicker,
    EventListItem
  },
});
</script>

<style>
  ion-modal {
    --border-radius: 16px;
    --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  ion-modal ion-toolbar {    
    --color: white;
  }

  .quick-filter {
    display: flex;
    margin-bottom: 4px;
  }
  .quick-filter b {
    margin-top: 8px;
    margin-right: 6px;
  }
</style>