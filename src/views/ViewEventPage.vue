<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar :title="'adads'">
        <ion-title>
          {{ event?.band ?? 'Event' }},
          {{ event?.place ?? '' }}
        </ion-title>
        <ion-buttons slot="start">
          <ion-back-button :text="getBackButtonText()" default-href="/">
          </ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" v-if="event">      
      <div class="ion-padding band">
        <IonImg :src="band?.main_image ?? event.spotify_image" 
          style="max-width: 260px; margin: 0 auto;" 
          v-if="event.spotify_image"/>
        <div v-if="event.city">
          <b>Plats: </b> {{ event.city }}, {{ event.county }}, {{ event.region }}
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
        <iframe v-if="band?.embed_url" style="border-radius:12px" 
          :src="band.embed_url" width="100%" height="300" frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { IonBackButton, IonButtons, IonImg, IonContent, IonHeader, IonTitle, IonPage, IonToolbar } from '@ionic/vue';
import { personCircle } from 'ionicons/icons';
import { useEvent } from '../data/events';
import { computed, defineComponent } from 'vue';
import { useBand } from '@/data/bands';

export default defineComponent({
  name: 'ViewMessagePage',
  data() {
    return {
      personCircle,
      getBackButtonText: () => {
        const win = window as any;
        const mode = win && win.Ionic && win.Ionic.mode;
        return mode === 'ios' ? 'Events' : '';
      }
    }
  },
  setup() {
    const route = useRoute();
    const { event } = useEvent(route.params.id as string)
    
    const bandName = computed(() => event.value?.band)
    const { band } = useBand(bandName)

    return { event, band }
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
ion-item {
  --inner-padding-end: 0;
  --background: transparent;
}

ion-label {
  margin-top: 12px;
  margin-bottom: 12px;
}

ion-item h2 {
  font-weight: 600;
}

ion-item .date {
  float: right;
  align-items: center;
  display: flex;
}

ion-item ion-icon {
  font-size: 42px;
  margin-right: 8px;
}

ion-item ion-note {
  font-size: 15px;
  margin-right: 12px;
  font-weight: normal;
}

.band div {
  margin: 6px 0;
}

p {
  line-height: 22px;
}
</style>
