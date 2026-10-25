#!./node_modules/.bin/ts-node

/**
 * One-off: replace photo URLs that still point straight at a Places API
 * (legacy https://maps.googleapis.com/maps/api/place/photo?... or
 * https://places.googleapis.com/v1/.../media?...) with photos from Places API
 * (New), stored in Cloud Storage like PhotoCache does for new places.
 *
 * Those legacy URLs now return a 403 error tile ("legacy API not enabled")
 * and embed the API key in public Firestore data. The new photo reference
 * can't be derived from the old one, so each place is looked up again by its
 * stored place id (ids are the same in both APIs).
 *
 * Per place: one Place Details request (photos field) and one photo request;
 * the 256px copy is resized locally.
 *
 * Needs Places API (New) enabled on the project and a key allowed to call it:
 *
 *   PLACES_API_KEY=... npx ts-node scripts/migrate_place_photos.ts                 # dry run
 *   PLACES_API_KEY=... npx ts-node scripts/migrate_place_photos.ts --apply --limit 5
 *   PLACES_API_KEY=... npx ts-node scripts/migrate_place_photos.ts --apply
 *   ... --host places.googleapis.com   # only one kind of URL
 */
import sharp from 'sharp'
import { database } from '../src/lib/utils/database'
import { PhotoCache } from '../src/lib/google/maps/photo_cache'
import { PlacesApi } from '../src/lib/google/maps/places_api'

// Legacy photo endpoint (dead, 403) and direct Places API (New) media URLs
// (work, but are billed on every view and embed the key)
const DIRECT_HOSTS = ['maps.googleapis.com', 'places.googleapis.com']

const { table } = database()

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

type PlaceDetails = { photos?: { name: string, authorAttributions?: { displayName: string, uri: string }[] }[] }

async function run(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const limit = Number(arg('--limit') ?? Infinity)
  const hosts = arg('--host') ? [arg('--host') as string] : DIRECT_HOSTS
  const apiKey = process.env.PLACES_API_KEY

  const snapshot = await table('metadata_places').get()

  const candidates = snapshot.docs.flatMap(doc => {
    const api = doc.get('places_api') as { id?: string, photo_large?: string } | undefined
    if (!api?.id || !api.photo_large || !hosts.includes(new URL(api.photo_large).host)) return []
    return [{ ref: doc.ref, name: doc.id, placeId: api.id }]
  })

  const todo = candidates.slice(0, limit)
  console.log(`${snapshot.size} places, ${candidates.length} with direct Places API photo URLs, migrating ${todo.length}`)
  console.log(`Places API (New) requests: up to ${todo.length} Place Details + ${todo.length} photos`)
  if (!apply) {
    console.log('Dry run, pass --apply (and PLACES_API_KEY) to download, upload and update Firestore')
    return
  }
  if (!apiKey) throw new Error('PLACES_API_KEY is required with --apply')

  let ok = 0
  const failed: string[] = []
  const withoutPhoto: string[] = []
  for (const { ref, name, placeId } of todo) {
    try {
      const details = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=photos`, { headers: { 'X-Goog-Api-Key': apiKey } })
      if (!details.ok) throw new Error(`place details failed: ${details.status} ${details.statusText}`)
      const [photo] = ((await details.json()) as PlaceDetails).photos ?? []
      if (!photo) {
        withoutPhoto.push(name)
        continue
      }

      const resp = await fetch(PlacesApi.photoUrl(apiKey, photo.name, '1024'))
      if (!resp.ok) throw new Error(`photo download failed: ${resp.status} ${resp.statusText}`)
      const original = Buffer.from(await resp.arrayBuffer())
      const small = await sharp(original).resize(256, 256, { fit: 'inside' }).jpeg().toBuffer()

      const photo_large = await PhotoCache.store(original, resp.headers.get('content-type'), placeId, '1024')
      const photo_small = await PhotoCache.store(small, 'image/jpeg', placeId, '256')
      const photo_attributions = (photo.authorAttributions ?? []).map(({ displayName, uri }) => `<a href="${uri}">©${displayName}</a>`)

      await ref.update({
        'places_api.photo_large': photo_large,
        'places_api.photo_small': photo_small,
        'places_api.photo_attributions': photo_attributions
      })
      ok += 1
      console.log(`[${ok}/${todo.length}] ${name}`)
    } catch (err) {
      failed.push(name)
      console.warn(`FAILED ${name}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`Migrated ${ok}, no photo available ${withoutPhoto.length}, failed ${failed.length}`, { withoutPhoto, failed })
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
