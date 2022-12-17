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
        <h1>{{ event.place }}</h1>
        <h5>{{ event.band }}</h5>
        <div class="image" v-if="event.metadata">
          <IonImg :src="event.metadata.band.spotify.image_large" 
            v-if="event.metadata.band.spotify.image_large"/>
          <IonImg :src="event.metadata.place.places_api.photo_large" 
            v-else-if="event.metadata.place.places_api.photo_large"/>
        </div>
        <div class="image-attribution" v-if="!event.metadata?.band.spotify.image_large && event.metadata?.place.places_api.photo_large">
          <div v-for="photo_attr in event.metadata.place.places_api.photo_attributions" :key="photo_attr" v-html="photo_attr"/>
        </div>
        <div class="actions">
          <IonButton @click="openUrl(nav_link ?? '')"  v-if="nav_link">
            <ion-icon slot="start" :icon="compassSharp" />
            Navigera
          </IonButton>
          <IonButton @click="openUrl(event_link ?? '')"  v-if="event_link">
            <ion-icon slot="start" :icon="calendarSharp" />
            Lägg till
          </IonButton>
        </div>
        <div class="details">
          <div v-if="event.city">
            <b>Plats: </b> {{ location }}
          </div>
          <div v-if="event.time">
            <b>Tid: </b> {{ event.time }}
          </div>
          <div v-if="event.date">
            <b>Datum: </b> {{ event.weekday }}dag {{ event.date }}
          </div>
          <div v-if="event.metadata?.place.places_api">
            <b>Adress: </b> 
            <a :href="maps_link"  v-if="maps_link">
              {{ event.metadata.place.places_api.address.replace(/, Sverige/, '') }}
            </a>
            <span v-else>
              {{ event.metadata.place.places_api.address.replace(/, Sverige/, '') }}
            </span>
          </div>
          <div v-if="event.metadata?.place.general.website_url">
            <b>Hemsida: </b>
            <a :href="event.metadata.place.general.website_url">
              {{ prettyUrl(event.metadata.place.general.website_url) }}
            </a>
          </div>
          <div v-if="event.metadata?.place.general.facebook_url">
            <b>Facebook: </b>
            <a :href="event.metadata.place.general.facebook_url">
              {{ prettyUrl(event.metadata.place.general.facebook_url) }}
            </a>
          </div>
          <div v-if="event.extra">
            <b>Info: </b> {{ event.extra }}
          </div>
        </div>
        <div class="spotify_embed">
          <iframe v-if="embed_url" 
            :src="embed_url" width="100%" height="300" frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
        </div>
        <div class="spotify_button" v-if="event?.metadata?.band.spotify?.id">
          <IonButton @click="openUrl(`https://open.spotify.com/artist/${event?.metadata?.band.spotify.id}`)" >
            <ion-icon slot="start" :src="require(`@/assets/spotify.svg`)" />
            Öppna {{ event.metadata.band.spotify.name }} i Spotify
          </IonButton>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { IonBackButton, IonButtons, IonButton, IonIcon, IonImg, IonContent, IonHeader, IonTitle, IonPage, IonToolbar } from '@ionic/vue'
import { globeSharp, logoFacebook, compassSharp, calendarSharp } from 'ionicons/icons'
import { useEvent } from '../data/events'
import { computed, defineComponent } from 'vue'
import { Browser } from '@capacitor/browser'
import { googleCalendarEventUrl } from 'google-calendar-url';
 
export default defineComponent({
  name: 'ViewEventPage',
  setup() {
    const route = useRoute();
    const { event } = useEvent(route.params.id as string)
    const location = computed(() => {
      const { city, county, region } = event.value ?? {}
      if (city === county && county == region ) {
        return city
      }
      if (city === county ) {
        return `${county}, ${region}`
      }
      return `${city}, ${county}, ${region}`
    })
    return { 
      event,
      location,
      embed_url: computed(() => {
        const { id } = event.value?.metadata?.band.spotify ?? {}
        return id
          ? `https://open.spotify.com/embed/artist/${id}?utm_source=generator` 
          : null;
      }),
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
      event_link: computed(() => {
        if (!event.value || !event.value.time) return null
        const { time, date, place, band, metadata } = event.value
        
        const split = time.split(/\s*[\u002D\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D]\s*/gi, 2)
        if (split.length !== 2) return null
        
        let [start, end] = split
        start =  date.replace(/-/gi, '') + 'T' + start.replace(/:/gi, '') + '00'
        end = date.replace(/-/gi, '') + 'T' +  end.replace(/:/gi, '') + '00'
        
        const url = googleCalendarEventUrl({
          start,
          end,
          
          title: [band, place].join(', '),
          details: [
            ['Tid', time],
            ['Band', band],
            ['Plats', [place, location.value].join(',')],
            ['Address', metadata?.place?.places_api?.address],
            ['Facebook', metadata?.place?.general?.facebook_url],
            ['Hemsida', metadata?.place?.general?.website_url]
          ].filter(tup => tup.every(t => t)).map(tup => tup.join(': ')).join('\n'),
          location: metadata?.place?.places_api?.address ?? place
        });

        return url
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
      calendarSharp
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
  max-height: 280px;
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
  justify-content: space-evenly;
}
.event .actions ion-button {
  flex-grow: 1;
  height: 3em;
}
.event h1 {
  margin-top: 0;
  margin-bottom: 0;
}
.event h5 {
  margin-top: 0;
}
.event .details div {
  margin: 6px 0;
  font-size: 1rem;
}
.event p {
  line-height: 22px;
}
.event .spotify_button {
  display: flex;
  justify-content: center;
}
.event .spotify_embed {
  display: flex;
  justify-content: center;
  margin-top: 0.4em;
}
.event .spotify_embed iframe {
  border-radius: 12px; 
  
}
</style>
