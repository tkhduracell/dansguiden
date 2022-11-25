<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title color="dark">Välj datum</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('dismiss')">Klar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="quick-filter">
        <ion-button size="small" fill="outline" @click="emit('select:weeks', 2)">Kommande 2 veckor</ion-button>
        <ion-button size="small" fill="outline" @click="emit('select:weeks', 4)">Kommande månad</ion-button>
      </div>
      <date-picker mode="date" :sm=12 :rows=2 @change="emit('update:range', $event)" :value="range" is-range is-expanded />
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { 
  IonContent, IonHeader, IonModal, 
  IonTitle, IonToolbar, IonButton, 
  IonButtons
} from '@ionic/vue'
import { DatePicker } from 'v-calendar'
import { defineProps, defineEmits } from 'vue'

defineProps<{
    range?: { start: Date, end: Date },
    isOpen: boolean
}>()

const emit = defineEmits<{
    (event: 'update:range', value: { start: Date, end: Date }): void
    (event: 'select:weeks', value: number): void
    (event: 'dismiss'): void
}>()
</script>