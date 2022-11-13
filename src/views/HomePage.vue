<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Dansguiden - Hitta din dans</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="refresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Inbox</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-list>
        <ion-chip :outline="!range" @click="isSelectingRange = true">
          <ion-icon :icon="icons.calendar" color="primary"></ion-icon>
    
          <span v-if="range">{{ fmt(range.start) }} -  {{ fmt(range.end) }}</span>
          <span v-else>Välj datum</span>
           
          <ion-icon :icon="icons.close" @click.stop.prevent="range = undefined" v-if="range"></ion-icon>
        </ion-chip>

        <ion-chip :outline="!locations" @click="isSelectingLocation = true">
          <ion-icon :icon="icons.mapSharp" color="primary"></ion-icon>
          <span v-if="locations && locations.length > 1">{{ locations[0] }} (+{{ locations.length - 1 }})</span>
          <span v-else-if="locations && locations.length == 1">{{ locations[0] }}</span>
          <span v-else>Välj län</span>
          <ion-icon :icon="icons.close" @click.stop.prevent="locations = undefined" v-if="locations"></ion-icon>
        </ion-chip>

        <ion-chip :outline="!bands" @click="isSelectingBand = true">
          <ion-icon :icon="icons.peopleSharp" color="primary"></ion-icon>
          <span v-if="bands && bands.length > 1">{{ bands[0] }} (+{{ bands.length - 1 }})</span>
          <span v-else-if="bands && bands.length == 1">{{ bands[0] }}</span>
          <span v-else>Välj band</span>
          <ion-icon :icon="icons.close" 
            @click.stop.prevent="bands = undefined" 
            v-if="bands" ></ion-icon>
        </ion-chip>

        <EventListItem v-for="event in events" 
          :key="event._id" :event="event" />
      </ion-list>

      <ion-modal :is-open="isSelectingRange" @didDismiss="isSelectingRange = false" :initial-breakpoint="0.9" :breakpoints="[0.9]">
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
            <ion-button size="small" fill="outline" @click="selectQuickRange(2)">Kommande 2 veckor</ion-button>
            <ion-button size="small" fill="outline" @click="selectQuickRange(4)">Kommande månad</ion-button>
          </div>
          <date-picker mode="date" :sm=12 :rows=2 v-model="range" is-range is-expanded />
        </ion-content>
      </ion-modal>


      <ion-modal :is-open="isSelectingLocation" @didDismiss="isSelectingLocation = false" :initial-breakpoint="0.9" :breakpoints="[0.9]">
        <ion-header>
          <ion-toolbar>
            <ion-title>Platser</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isSelectingLocation = false">Klar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding locations" :scroll-events="true">
          <ion-searchbar placeholder="Sök" v-model="locationFilter" />
          <ion-list>
            <ion-item v-for="l in allLocations" :key="'loc-' + l.id" @click="selectLocation(l.name)">
              <ion-label>
                <h2>{{ l.name }}</h2>
                <p>{{ l.city }}</p>
              </ion-label>
              <ion-icon :icon="icons.checkmarkSharp" color="primary" slot="end" v-if="locations?.includes(l.name)"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="isSelectingBand" @didDismiss="isSelectingBand = false" :initial-breakpoint="0.9" :breakpoints="[0.9]">
        <ion-header>
          <ion-toolbar>
            <ion-title>Band</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isSelectingBand = false">Klar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding bands" :scroll-events="true">
          <ion-searchbar placeholder="Sök" v-model="bandFilter" />
          <ion-list>
            <ion-item v-for="b in bands" :key="'band-' + b">
              <ion-label>
                <h2>{{ b }}</h2>
              </ion-label>
              <ion-icon :icon="icons.checkmarkSharp" color="primary" slot="end"></ion-icon>
            </ion-item>
            <ion-item v-if="!bandFilter" disabled>
              <ion-label>
                Använd fältet för att hitta bandet
              </ion-label>
            </ion-item>
            <ion-item v-for="b in allBands" :key="'band-' + b.id" @click="selectBand(b.name)">
              <ion-label>
                <h2>{{ b.name }}</h2>
              </ion-label>
              <ion-icon :icon="icons.checkmarkSharp" color="primary" slot="end" v-if="bands?.includes(b.name)"></ion-icon>
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
  IonButtons, IonChip, IonIcon, IonItem
} from '@ionic/vue'
import EventListItem from '@/components/EventListItem.vue'
import { defineComponent } from 'vue'
import { useEvents } from '@/data/events'
import { DatePicker } from 'v-calendar'
import { format } from 'date-fns'
import { close, calendar, mapSharp, checkmarkSharp, peopleSharp } from 'ionicons/icons';
import { useLocationSelect } from '@/data/location'
import { useRangeSelect } from '@/data/date'
import { useBandSelect } from '@/data/bands'

export default defineComponent({
  name: 'HomePage',
  setup() {
    
    const { filter: locationFilter, isSelectingLocation, selectLocation, locations, allLocations } = useLocationSelect()
    const { range, isSelectingRange, onDateRangeSelected, selectQuickRange }  = useRangeSelect()
    const { filter: bandFilter, allBands, bands, selectBand, isSelectingBand } = useBandSelect()
    
    const { events, refresh } = useEvents(range, locations, bands)
    
    return {
      events,
      range,
      locationFilter,
      bandFilter,
      bands,
      locations,
      allLocations,
      allBands,
      isSelectingRange,
      isSelectingLocation,
      isSelectingBand,
      onDateRangeSelected,
      selectLocation,
      selectQuickRange,
      selectBand,
      refresh: (ev: CustomEvent) => {
        refresh(() => {
          ev.detail.complete();
        });
      },
      fmt: (d: Date) => {
        const out = format(d, 'd MMM')
      
        return out
      },
      icons: { close, calendar, mapSharp, checkmarkSharp, peopleSharp }
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
    IonItem,
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
  .locations {
    user-select: none;
  }
</style>