import { sortedUniq, uniq } from 'lodash';
import { ref, Ref, computed } from 'vue';

export function useLocation(filter: Ref<string | undefined>) {
    
    const locations = ref<string[]>()
    const base = [  
      { id: 1, name: "Blekinge", city: "Karlskrona"},
      { id: 2, name: "Dalarna", city: "Falun"},
      { id: 3, name: "Gävleborg", city: "Gävle"},
      // { id: 4, name: "Gotland", city: "Visby"},
      { id: 5, name: "Halland", city: "Halmstad"},
      { id: 6, name: "Jämtland", city: "Östersund"},
      { id: 7, name: "Jönköping", city: "Närområde"},
      { id: 8, name: "Kalmar", city: "Öland"},
      { id: 9, name: "Kronoberg", city: "Växjö"},
      { id: 10, name: "Norrbotten", city: "Luleå"},
      { id: 11, name: "Örebro", city: "Närområde"},
      { id: 12, name: "Östergötland", city: "Linköping"},
      { id: 13, name: "Skåne", city: "Malmö"},
      { id: 14, name: "Södermanland", city: "Nyköping"},
      { id: 15, name: "Stockholm", city: "Närområde"},
      { id: 16, name: "Uppsala", city: "Närområde"},
      { id: 17, name: "Värmland", city: "Karlstad"},
      { id: 18, name: "Västerbotten", city: "Umeå"},
      { id: 19, name: "Västernorrland", city: "Härnösand"},
      { id: 20, name: "Västmanland", city: "Västerås"},
      { id: 21, name: "Västra Götaland", city: "Göteborg"}
    ]

    const allLocations = computed(() => {
        const f = filter.value
        return f ?
            base.filter(c => c.name.toLocaleLowerCase().includes(f.toLocaleLowerCase())) :
            base
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
    isSelectingLocation.value = false
  }

  return { locations, allLocations, filter, isSelectingLocation, selectLocation }

}