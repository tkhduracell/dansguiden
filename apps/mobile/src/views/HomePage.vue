<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Dansguiden - Hitta din dans</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" >
      <ion-refresher slot="fixed" @ionRefresh="refresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      
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

        <ion-chip :outline="!venues" @click="isSelectingVenue = true">
          <ion-icon :icon="icons.businessSharp" color="primary"></ion-icon>
          <span v-if="venues && venues.length > 1">{{ venues[0] }} (+{{ venues.length - 1 }})</span>
          <span v-else-if="venues && venues.length == 1">{{ venues[0] }}</span>
          <span v-else>Välj plats</span>
          <ion-icon :icon="icons.close" 
            @click.stop.prevent="venues = undefined" 
            v-if="venues" ></ion-icon>
        </ion-chip>
        
        <EventListItem v-for="event in events" 
          :key="event._id" :event="event" />

      </ion-list>

      <RangeModal v-model:range="range" @dismiss="isSelectingRange = false" 
        :is-open="isSelectingRange" @select:weeks="selectQuickRange($event)" />

      <LocationModal v-model:filter="locationFilter" @dismiss="isSelectingLocation = false"
        :all-locations="allLocations" :locations="locations" :is-open="isSelectingLocation" 
        @select:location="selectLocation($event)" />

      <BandModal v-model:filter="bandFilter" @dismiss="isSelectingBand = false"
        :all-bands="allBands" :bands="bands" :is-open="isSelectingBand" 
        @select:band="selectBand($event)" />

      <VenueModal v-model:filter="venueFilter" @dismiss="isSelectingVenue = false"
        :all-venues="allVenues" :venues="venues" :is-open="isSelectingVenue" 
        @select:venue="selectVenue($event)" />

    </ion-content>

  </ion-page>
</template>

<script lang="ts">
import { 
  IonContent, IonHeader, IonList, 
  IonPage, IonRefresher, IonRefresherContent, 
  IonTitle, IonToolbar, IonChip, IonIcon
} from '@ionic/vue'

import EventListItem from '@/components/EventListItem.vue'
import BandModal from '@/components/BandModal.vue'
import LocationModal from '@/components/LocationModal.vue'
import RangeModal from '@/components/RangeModal.vue'
import VenueModal from '@/components/VenueModal.vue'

import { defineComponent } from 'vue'
import { useEvents } from '@/data/events'
import { format } from 'date-fns'
import { close, calendar, mapSharp, checkmarkSharp, peopleSharp, homeSharp, businessSharp } from 'ionicons/icons';
import { useLocationSelect } from '@/data/location'
import { useRangeSelect } from '@/data/date'
import { useBandSelect } from '@/data/bands'
import { useVenueSelect } from '@/data/venues'

export default defineComponent({
  name: 'HomePage',
  setup() {
    
    const { range, isSelectingRange, onDateRangeSelected, selectQuickRange }  = useRangeSelect()
    const { filter: locationFilter, locations, allLocations, selectLocation, isSelectingLocation } = useLocationSelect()
    const { filter: bandFilter, allBands, bands, selectBand, isSelectingBand } = useBandSelect()
    const { filter: venueFilter, allVenues, venues, selectVenue, isSelectingVenue } = useVenueSelect()
    const { events, refresh } = useEvents(range, locations, venues, bands)
    
    return {
      events,
      range,
      locationFilter,
      bandFilter,
      venueFilter,
      bands,
      locations,
      venues,
      allLocations,
      allBands,
      allVenues,
      isSelectingRange,
      isSelectingLocation,
      isSelectingBand,
      isSelectingVenue,
      onDateRangeSelected,
      selectLocation,
      selectQuickRange,
      selectBand,
      selectVenue,
      refresh: (ev: CustomEvent) => {
        refresh(() => {
          ev.detail.complete();
        });
      },
      fmt: (d: Date) => {
        const out = format(d, 'd MMM')
      
        return out
      },
      icons: { close, calendar, mapSharp, checkmarkSharp, peopleSharp, homeSharp, businessSharp }
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
    IonChip, 
    IonIcon,
    RangeModal,
    EventListItem,
    BandModal,
    LocationModal,
    VenueModal,
  },
});
</script>

<style>
  ion-modal {
    --border-radius: 16px;
    --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  ion-modal ion-header {
    --min-height: 60px;
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