<template>
    <ion-modal :is-open="isOpen" @didDismiss="emit('dismiss')">
        <ion-header>
          <ion-toolbar>
            <ion-title color="dark">Band</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="emit('dismiss')">Klar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding bands" :scroll-events="true">
          <ion-searchbar placeholder="Sök" :value="filter" @ionChange="emit('update:filter', $event.detail?.value)"/>
          <ion-list>
            <ion-item v-for="b in bands" :key="'band-' + b">
              <ion-label>
                <h2>{{ b }}</h2>
              </ion-label>
              <ion-icon :icon="checkmarkSharp" color="primary" slot="end"></ion-icon>
            </ion-item>
            <ion-item v-if="!filter" disabled>
              <ion-label>
                Använd sökfältet för att hitta band
              </ion-label>
            </ion-item>
            <ion-item v-for="b in allBands" :key="'band-' + b.id" @click="emit('select:band', b.name)">
              <ion-label>
                <h2>{{ b.name }}</h2>
              </ion-label>
              <ion-icon :icon="checkmarkSharp" color="primary" slot="end" v-if="bands?.includes(b.name)"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-content>
    </ion-modal>
</template>

<script lang="ts" setup>
import { 
  IonContent, IonHeader, IonList, 
  IonModal, IonItem, IonLabel,
  IonTitle, IonToolbar, IonIcon,
  IonButton, IonButtons, IonSearchbar
} from '@ionic/vue'

import { defineProps, defineEmits } from 'vue';
import { checkmarkSharp } from 'ionicons/icons';

defineProps<{
    bands: string[] | undefined,
    allBands: { name: string, id: string }[],
    filter: string | undefined,
    isOpen: boolean
}>()

const emit = defineEmits<{
    (event: 'update:filter', value: string | undefined): void
    (event: 'select:band', value: string): void
    (event: 'dismiss'): void
}>()
</script>