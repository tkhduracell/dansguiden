<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar :title="'adads'">
        <ion-title>
          Om Dansen
        </ion-title>
        <ion-buttons slot="start">
          <ion-back-button :text="getBackButtonText()" default-href="/">
          </ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" v-if="event"> 
      <div class="ion-padding event">
        <h2>{{ event.band }}</h2>
        <h5>{{ event.place }}</h5>
        <IonImg :src="event.metadata.band.spotify.image_large" 
          style="max-width: 260px; margin: 1em auto;" 
          v-if="event.metadata.band.spotify.image_large"/>
        <IonImg :src="event.metadata.place.places_api.photo_large" 
          style="max-width: 260px; margin: 1em auto;" 
          v-else-if="event.metadata.place.places_api.photo_large"/>
        <div class="details">
          <div v-if="event.city">
            <b>Plats: </b> {{ event.city }}, {{ event.county }}, {{ event.region }}
          </div>
          <div v-if="event.metadata.place.places_api.address">
            <b>Adress: </b> 
            <a :href="maps_link"  v-if="maps_link">
              {{ event.metadata.place.places_api.address }}
            </a>
            <span v-else>{{ event.metadata.place.places_api.address }}</span>
          </div>
          <div v-if="event.date">
            <b>Datum: </b> {{ event.weekday }} {{ event.date }} 
          </div>
          <div v-if="event.time">
            <b>Tid: </b> {{ event.time }}
          </div>
          <div v-if="event.extra">
            <b>Info: </b> {{ event.extra }}
          </div>
        </div>
        <div style="display: flex;justify-content: center; margin-top: 1.6em">
          <iframe v-if="embed_url" style="border-radius: 12px; max-width: 400px;" 
            :src="embed_url" width="100%" height="300" frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { IonBackButton, IonButtons, IonImg, IonContent, IonHeader, IonTitle, IonPage, IonToolbar } from '@ionic/vue';
import { useEvent } from '../data/events';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewEventPage',
  setup() {
    const route = useRoute();
    const { event } = useEvent(route.params.id as string)
    
    return { 
      event,
      embed_url: computed(() => event.value?.metadata.band.spotify.id 
        ? `https://open.spotify.com/embed/artist/${event.value?.metadata.band.spotify.id}?utm_source=generator` : null),
      maps_link: computed(() => event.value?.metadata.place.places_api.place_id 
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.value.place)}&query_place_id=${encodeURIComponent(event.value.metadata.place.places_api.place_id)}`: null),
      getBackButtonText: () => {
        const win = window as any;
        const mode = win && win.Ionic && win.Ionic.mode;
        return mode === 'ios' ? 'Danser' : '';
      }
    }
  },
  components: {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonImg
  },
});
</script>

<style scoped>

ion-label {
  margin-top: 12px;
  margin-bottom: 12px;
}

.event h2 {
  margin-top: 0px;
}

.event div {
  margin: 6px 0;
  font-size: 0.9rem;
}

.event p {
  line-height: 22px;
}
</style>
