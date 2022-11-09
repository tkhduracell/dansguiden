<template>
  <ion-item v-if="event" :routerLink="'/event/' + event._id" detail class="list-item">
    <div slot="start" class="event-image">
      <ion-img :src="event?.spotify_image" v-if="event?.spotify_image" />
      <ion-icon :icon="imageSharp" v-else/>
    </div>

    <ion-label class="ion-text-wrap">
      <h2>
        {{ event.band }}, {{ event.place }}
        <span class="date">
          <ion-note>{{ event.weekday }} {{ event.date }}</ion-note>
          <ion-icon :icon="chevronForward" size="small" v-if="isIos()"></ion-icon>
        </span>
      </h2>
      <h3>{{ event.weekday }} {{ event.time }}</h3>
      <p>
        {{ event.city }}, {{ event.county }}, {{ event.region }}
      </p>
    </ion-label>
  </ion-item>
</template>

<script lang="ts">
import { DanceEvent } from '@/data/events';
import { IonIcon, IonItem, IonLabel, IonNote, IonImg } from '@ionic/vue';
import { chevronForward, imageSharp } from 'ionicons/icons';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'EventListItem',
  components: {
    IonIcon,
    IonItem,
    IonLabel,
    IonNote,
    IonImg
  },
  props: {
    event: Object as PropType<DanceEvent>,
  },
  methods: {
    isIos: () => {
      const win = window as any;
      return win && win.Ionic && win.Ionic.mode === 'ios';
    }
  },
  data() {
    return { chevronForward, imageSharp }
  }
});
</script>

<style scoped>
.list-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.list-item ion-label {
  margin-top: 12px;
  margin-bottom: 12px;
}

.list-item  h2 {
  font-weight: 600;
  margin: 0;
}

.list-item p {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 95%;
}

.list-item .date {
  float: right;
  align-items: center;
  display: flex;
}

.list-item ion-icon {
  color: #c9c9ca;
}

.list-item ion-note {
  font-size: 15px;
  margin-right: 8px;
  font-weight: normal;
}

.list-item ion-note.md {
  margin-right: 14px;
}

.list-item .dot {
  display: block;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  align-self: start;
  margin: 16px 10px 16px 16px;
}

.list-item .dot-unread {
  background: var(--ion-color-primary);
}

.list-item .event-image {
  max-height: 100px;
}
.list-item .event-image ion-img {
  width: 100px;
}
.list-item .event-image ion-icon {
  width: 100px;
  scale: 3.0;
}
</style>