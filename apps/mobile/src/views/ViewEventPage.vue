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
        <h1>{{ event.band }}</h1>
        <h2>{{ event.place }}</h2>
        <h3 v-if="event.city">{{ location }}</h3>
        <div class="image" v-if="event.metadata">
          <IonImg :src="event.metadata.band.spotify?.image_large"
            v-if="event.metadata.band.spotify?.image_large"/>
        </div>
        <div class="details">
          <div v-if="event.date">
            <div class="icon">
              <ion-icon :icon="calendarSharp" />
            </div>
            {{ event.weekday }}dag {{ event.date }}
          </div>
          <div v-if="event.time">
            <div class="icon">
              <ion-icon :icon="time" />
            </div>
            {{ event.time }}
          </div>
          <div v-if="event.metadata?.place.general.website_url">
            <div class="icon">
              <ion-icon :icon="globeSharp" />
            </div>
            <a :href="event.metadata.place.general.website_url">
              {{ prettyUrl(event.metadata.place.general.website_url) }}
            </a>
          </div>
          <div v-if="event.metadata?.place.general.facebook_url">
            <div class="icon">
              <ion-icon :icon="logoFacebook" />
            </div>
            <a :href="event.metadata.place.general.facebook_url">
              {{ prettyUrl(event.metadata.place.general.facebook_url) }}
            </a>
          </div>
          <div v-if="event.metadata?.place.places_api">
            <div class="icon">
              <ion-icon :icon="compassSharp" />
            </div>
            <a :href="maps_link"  v-if="maps_link">
              {{ event.metadata.place.places_api.address.replace(/, Sverige/, '') }}
            </a>
            <span v-else>
              {{ event.metadata.place.places_api.address.replace(/, Sverige/, '') }}
            </span>
          </div>
          <div v-if="event.extra">
            <b>Info: </b> {{ event.extra }}
          </div>
        </div>
        <div class="actions">
          <IonButton size="default"  @click="openUrl(nav_link ?? '')"  v-if="nav_link">
            <ion-icon slot="start" :icon="compassSharp" />
            Navigera med Maps
          </IonButton>
          <IonButton size="default"  @click="openCalendarEventUrl()" v-if="supportCalendar">
            <ion-icon slot="start" :icon="calendarSharp" />
            Lägg till i din kalender
          </IonButton>
          <IonButton size="default"  @click="openUrl(`https://open.spotify.com/artist/${event?.metadata?.band.spotify.id}`)" v-if="event?.metadata?.band.spotify?.id">
            <ion-icon slot="start" :src="require(`@/assets/spotify.svg`)" />
            Lyssna med Spotify
          </IonButton>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { IonBackButton, IonButtons, IonButton, IonIcon, IonImg, IonContent, IonHeader, IonTitle, IonPage, IonToolbar } from '@ionic/vue'
import { globeSharp, logoFacebook, compassSharp, calendarSharp, time } from 'ionicons/icons'
import { useEvent } from '../data/events'
import { computed, defineComponent } from 'vue'
import { Browser } from '@capacitor/browser'
import { useCalendarEvent } from '@/data/calendar-event'


export default defineComponent({
  name: 'ViewEventPage',
  setup() {
    const route = useRoute();
    const { event, location } = useEvent(route.params.id as string)

    const { supportCalendar, openCalendarEventUrl } = useCalendarEvent(event, location)

    return { 
      event,
      supportCalendar,
      openCalendarEventUrl,
      location,
      maps_link: computed(() => {
        const { id } = event.value?.metadata?.place?.places_api ?? {}
        const query = encodeURIComponent(event.value?.place ?? '')
        const query_place_id = encodeURIComponent(id ?? '')
        return id
          ? `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${query_place_id}`
          : null;
        }),
      nav_link: computed(() => {
        const { address, id } = event.value?.metadata?.place?.places_api ?? {}
        const destination = decodeURIComponent(address ?? '')
        const destination_place_id = decodeURIComponent(id ?? '')
        return id && address
          ? `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${destination_place_id}`
          : null;
      }),
      getBackButtonText: () => {
        const win = window as any;
        const mode = win && win.Ionic && win.Ionic.mode;
        return mode === 'ios' ? 'Danser' : '';
      },
      prettyUrl: (url: string) => url.replace(/https?:\/\/(www\.)?/gi, '').replace(/\/$/, ''),
      async openUrl(url: string) {
        await Browser.open({ url });
      },
      globeSharp,
      logoFacebook,
      compassSharp,
      calendarSharp,
      time
    }
  },
  components: {
    IonBackButton,
    IonButtons,
    IonButton,
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonImg,
    IonIcon
  },
});
</script>

<style scoped>

ion-label {
  margin-top: 12px;
  margin-bottom: 12px;
}
.event .image {
  display: flex;
  width: 100%;
  justify-content: center;
}
.event .image-attribution {
  font-size: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.event .image-attribution {
  margin: 0.2rem;
}
.event .actions {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 0.1em;
}
.event h1 {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 3rem;
}
.event h2 {
  margin-top: 0;
  font-size: 2rem;
}
.event h3 {
  margin-top: 0;
  font-size: 1rem;
  font-weight: 400;
}
.event .details div {
  margin: 6px 0;
  font-size: 1.2rem;
  display: flex;
  gap: 4px;
  align-items: center;
}
.event .details div .icon {
  display: flex;
  margin-right: 0.1em;
  font-size: 32px;
  width: 32px;
}
.event p {
  line-height: 22px;
}
</style>
