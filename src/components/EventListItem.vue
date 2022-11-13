<template>
  <ion-item v-if="event" :routerLink="'/event/' + event._id" detail class="list-item">
    <div slot="start" class="event-image">
      <ion-img :src="event?.spotify_image" v-if="event?.spotify_image" />
      <ion-icon :icon="imageSharp" v-else/>
    </div>

    <ion-label class="ion-text-wrap">
      <h1>
        {{ event.band }}, {{ event.place }}
        <span class="chevron">
          <ion-icon :icon="chevronForward" size="small" v-if="isIos()"></ion-icon>
        </span>
      </h1>
      <p class="date">
        {{ event.date }} 
      </p>
      <p>
        {{ event.weekday }} {{ event.time }}
        <ion-badge color="medium" v-if="event.extra?.toLowerCase() === 'pro'">PRO-dans</ion-badge>
      </p>
      <p v-if="event.city === event.county && event.county === event.region">
        {{ event.city }}
      </p>
      <p v-else-if="event.city === event.county">
        {{ event.county }}, {{ event.region }}
      </p>
      <p v-else>
        {{ event.city }}, {{ event.county }}, {{ event.region }}
      </p>
    </ion-label>
  </ion-item>
</template>

<script lang="ts">
import { DanceEvent } from '@/data/events';
import { IonIcon, IonItem, IonLabel, IonBadge, IonImg } from '@ionic/vue';
import { chevronForward, imageSharp } from 'ionicons/icons';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'EventListItem',
  components: {
    IonIcon,
    IonItem,
    IonLabel,
    IonImg,
    IonBadge
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
  user-select: none;
  margin-right: 6px;
}

.list-item ion-label {
  margin-top: 12px;
  margin-bottom: 12px;
  margin-right: 6px;
}
.list-item ion-label ion-badge {
  float:right
}

.list-item h1 {
  font-weight: 600;
  font-size: large;
  margin-bottom: 6px !important;
}
.list-item h1,p {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 95%;
  margin-top: 0;
  margin-bottom: 0;
}

.list-item .chevron {
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

.list-item .date {
  font-size: 15px;
}
.list-item .date ion-badge {
  position: relative;
  top: 4px;
}

.list-item .event-image {
  max-height: 100px;
  
  margin-bottom: 0px;
  margin-top: 0px;
  margin-right: 16px;
}
.list-item .event-image ion-img {
  width: 100px;
}
.list-item .event-image ion-icon {
  width: 100px;
  scale: 3.0;
}
</style>