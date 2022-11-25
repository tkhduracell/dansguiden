import { sortedUniq } from 'lodash';
import { ref, Ref, computed } from 'vue';
import { useStorage } from './storage';

export function useLocation(filter: Ref<string | undefined>) {
    const locations = useStorage<string[]>('locations')

    let i = 0
    const base = [  
      { id: i++, name: "Blekinge", city: "Karlskrona"},
      { id: i++, name: "Dalarna", city: "Falun"},
      { id: i++, name: "Gävleborg", city: "Gävle"},
      { id: i++, name: "Gotland", city: "Visby"},
      { id: i++, name: "Halland", city: "Halmstad"},
      { id: i++, name: "Jämtland", city: "Östersund"},
      { id: i++, name: "Jönköping", city: "Närområde"},
      { id: i++, name: "Kalmar", city: "Öland"},
      { id: i++, name: "Kronoberg", city: "Växjö"},
      { id: i++, name: "Norrbotten", city: "Luleå"},
      { id: i++, name: "Örebro", city: "Närområde"},
      { id: i++, name: "Östergötland", city: "Linköping"},
      { id: i++, name: "Skåne", city: "Malmö"},
      { id: i++, name: "Södermanland", city: "Nyköping"},
      { id: i++, name: "Stockholm", city: "Närområde"},
      { id: i++, name: "Stockholm (Båt)", city: "Närområde"},
      { id: i++, name: "Uppsala", city: "Närområde"},
      { id: i++, name: "Värmland", city: "Karlstad"},
      { id: i++, name: "Västerbotten", city: "Umeå"},
      { id: i++, name: "Västernorrland", city: "Härnösand"},
      { id: i++, name: "Västmanland", city: "Västerås"},
      { id: i++, name: "Västra Götaland", city: "Göteborg"}
    ]

    const allLocations = computed(() => {
        const f = filter.value
        const without = base.filter(c => !locations.value?.includes(c.name))
        return f ?
            without
              .filter(c => c.name.toLocaleLowerCase().includes(f.toLocaleLowerCase())) :
            without
    })

    return { 
        locations, 
        allLocations 
    }
}

export function useLocationSelect() {
  const filter = ref<string>()
  const { locations, allLocations } = useLocation(filter)  
  
  const isSelectingLocation = ref(false)
  function selectLocation (name: string) {
    if (locations.value?.includes(name)) {
      locations.value = locations.value.filter(l => l !== name)
    } else {
      locations.value = sortedUniq([name, ...(locations.value ?? [])].sort())
    }
    if (locations.value.length === 0) {
      locations.value = undefined
    }
    filter.value = undefined
  }

  return { locations, allLocations, filter, isSelectingLocation, selectLocation }

}