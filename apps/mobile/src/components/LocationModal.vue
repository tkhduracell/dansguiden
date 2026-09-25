<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title color="dark">Län</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('dismiss')">Klar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding locations" :scroll-events="true">
      <ion-searchbar placeholder="Sök" :value="filter" @ion-change="emit('update:filter', $event.detail?.value)" />
      <ion-list>
        <ion-item v-for="l in locations" :key="'loc-' + l" @click="emit('select:location', l)">
          <ion-label>
            <h2>{{ l }}</h2>
          </ion-label>
          <ion-icon :icon="checkmarkSharp" color="primary" slot="end" />
        </ion-item>
        <ion-item v-if="!filter" disabled>
          <ion-label>
            Använd sökfältet för att hitta platser
          </ion-label>
        </ion-item>
        <ion-item v-for="l in allLocations" :key="'loc-' + l.id" @click="emit('select:location', l.name)">
          <ion-label>
            <h2>{{ l.name }}</h2>
            <p>{{ l.city }}</p>
          </ion-label>
          <ion-icon :icon="checkmarkSharp" color="primary" slot="end" v-if="locations?.includes(l.name)"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { checkmarkSharp } from 'ionicons/icons';
import { 
  IonContent, IonHeader, IonList, 
  IonModal, IonItem, IonLabel,
  IonTitle, IonToolbar, IonIcon,
  IonButton, IonButtons, IonSearchbar
} from '@ionic/vue'

defineProps<{
    locations?: string[],
    allLocations: { name: string, city: string, id: number }[],
    filter?: string,
    isOpen: boolean
}>()

const emit = defineEmits<{
    (event: 'update:filter', value: string | undefined): void
    (event: 'select:location', value: string): void
    (event: 'dismiss'): void
}>()
</script>

<style scoped>
ion-modal {
  --height: 50em;
}
</style>