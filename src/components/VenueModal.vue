<template>
  <ion-modal :is-open="isOpen" @didDismiss="emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title color="dark">Platser</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emit('dismiss')">Klar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding venue" :scroll-events="true">
      <ion-searchbar placeholder="Sök" :value="filter" @ion-change="emit('update:filter', $event.detail?.value)" />
      <ion-list>
        <ion-item v-for="l in venues" :key="'ven-' + l" @click="emit('select:venue', l)">
          <ion-label>
            <h2>{{ l }}</h2>
          </ion-label>
          <ion-icon :icon="checkmarkSharp" color="primary" slot="end" />
        </ion-item>
        <ion-item v-for="l in allVenues" :key="'ven-' + l.name" @click="emit('select:venue', l.name)">
          <ion-label>
            <h2>{{ l.name }}</h2>
            <p>{{ l.region }}</p>
          </ion-label>
          <ion-icon :icon="checkmarkSharp" color="primary" slot="end" v-if="venues?.includes(l.name)"></ion-icon>
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
    venues?: string[],
    allVenues: { name: string, region: string }[],
    filter?: string,
    isOpen: boolean
}>()

const emit = defineEmits<{
    (event: 'update:filter', value: string | undefined): void
    (event: 'select:venue', value: string): void
    (event: 'dismiss'): void
}>()
</script>