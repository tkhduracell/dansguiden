import { computed, Ref } from 'vue';
import { DanceEvent } from './events';
import { CalendarEvent } from 'calendar-link'
import { google, outlook, office365, yahoo, ics } from "calendar-link"
import { useStorage } from '@/data/storage'
import { actionSheetController } from '@ionic/vue'
import { Browser } from '@capacitor/browser'

export function useCalendarEvent(event: Ref<DanceEvent | undefined>, location: Ref<string | undefined>) {
    
    const details = computed<CalendarEvent | null>(() => {
        if (!event.value || !event.value.time) return null

        const { time, date, place, band, metadata, city } = event.value
        
        const split = time.split(/\s*[\u002D\u058A\u05BE\u1400\u1806\u2010-\u2015\u2E17\u2E1A\u2E3A\u2E3B\u2E40\u301C\u3030\u30A0\uFE31\uFE32\uFE58\uFE63\uFF0D]\s*/gi, 2)
        if (split.length !== 2) return null
        
        let [start, end] = split
        start =  date.replace(/-/gi, '') + 'T' + start.replace(/:/gi, '') + '00'
        end = date.replace(/-/gi, '') + 'T' +  end.replace(/:/gi, '') + '00'
        const description = [
            ['Tid', time],
            ['Band', band],
            ['Plats', [place, location.value].join(',')],
            ['Address', metadata?.place?.places_api?.address],
            ['Facebook', metadata?.place?.general?.facebook_url],
            ['Hemsida', metadata?.place?.general?.website_url]
          ].filter(tup => tup.every(t => t))
          .map(tup => tup.join(': '))
          .join('\n')
  
        return {
          start,
          end,
          title: [band, place].join(', '),
          description,
          location: metadata?.place?.places_api?.address ?? [place, city].join(', '),
          url: metadata?.place.general?.facebook_url ?? metadata?.place.general?.program_url
        } as CalendarEvent
      })
      const supportCalendar = computed(() => !!details.value)
  
      const opts = {
        header: 'Vilken kalendertyp använder du?',
        subHeader: 'Detta val kommer att sparas för framtida användning',
        buttons: [
          { text: 'Google Calendar', role: 'google' },
          { text: 'Outlook Calendar', role: 'outlook' },
          { text: 'Office365 Calendar', role: 'office365' },
          { text: 'Apple Calendar', role: 'apple' },
          { text: 'Annan kalender (ics)', role: 'ics' },
          { text: 'Avbryt', role: 'cancel' },
        ],
      }
      type CalendarType = (typeof opts)['buttons'][number]['role']      
      
      const savedCalendarType = useStorage<CalendarType>('calendar-type')
      
      async function promptCalendarOrSaved(reset?: boolean) {
        if (savedCalendarType.value && reset !== false) {
          return savedCalendarType.value as CalendarType
        }
  
        const actionSheet = await actionSheetController.create(opts);
        await actionSheet.present();
  
        const { role } = await actionSheet.onDidDismiss();
  
        savedCalendarType.value = role
  
        return role as CalendarType
      }

      function open(url: string) {
        return Browser.open({ url })
      }

      async function openCalendarEventUrl(reset?: boolean) {
        const data = details.value
        if (!data) return 

        const cal = await promptCalendarOrSaved(reset)
        
        if (cal === 'google') return open(google(data))
        if (cal === 'outlook') return open(outlook(data))
        if (cal === 'office365') return open(office365(data))
        if (cal === 'yahoo') return open(yahoo(data))
        if (cal === 'apple') return open(ics(data))
        if (cal === 'ics') return open(ics(data))

        return null
      }

      return { supportCalendar, openCalendarEventUrl }
}