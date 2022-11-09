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
      <div class="ion-padding">
        <h1 style="margin-bottom: 18px">
          {{ event.band }},
          {{ event.place }}
        </h1>
        <IonImg :src="event.spotify_image" 
          style="max-width: 260px; margin: 0 auto;" 
          v-if="event.spotify_image"/>
        <div v-if="event.city">
          <p>
            <b>Plats: </b> {{ event.city }}, {{ event.county }}, {{ event.region }}
          </p>
        </div>
        <div v-if="event.date">
          <p>
            <b>Datum: </b> {{ event.weekday }} {{ event.date }} 
          </p>
        </div>
        <div v-if="event.time">
          <p>
            <b>Tid: </b> {{ event.time }}
          </p>
        </div>
        <div v-if="event.extra">
          <p><b>Info: </b> {{ event.extra }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { IonBackButton, IonButtons, IonImg, IonContent, IonHeader, IonTitle, IonPage, IonToolbar } from '@ionic/vue';
import { personCircle } from 'ionicons/icons';
import { useEvent } from '../data/events';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewMessagePage',
  data() {
    return {
      personCircle,
      getBackButtonText: () => {
        const win = window as any;
        const mode = win && win.Ionic && win.Ionic.mode;
        return mode === 'ios' ? 'Inbox' : '';
      }
    }
  },
  setup() {
    const route = useRoute();
    const { event } = useEvent(route.params.id as string)

    return { event }
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

h1 {
  margin: 0;
  font-weight: bold;
  font-size: 22px;
}

p {
  line-height: 22px;
}
</style>
