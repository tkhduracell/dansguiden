#!./node_modules/.bin/ts-node

/**
 * One-off: move place photos that still point straight at the Places API
 * (https://maps.googleapis.com/maps/api/place/photo?...) into Cloud Storage.
 *
 * Every app view of such a URL is a billed Places "Place Details Photos"
 * request. `MetadataPlaces` only caches photos for places it has not seen
 * before, so entries written before PhotoCache existed were never migrated.
 *
 * Costs ONE photo request per place (the 256px copy is resized locally), and
 * reuses the photo_reference + key already stored in the doc, so no Text
 * Search is needed.
 *
 *   npx ts-node scripts/migrate_place_photos.ts                 # dry run
 *   npx ts-node scripts/migrate_place_photos.ts --apply         # write
 *   npx ts-node scripts/migrate_place_photos.ts --apply --limit 25
 */
import sharp from 'sharp'
import { database } from '../src/lib/utils/database'
import { PhotoCache } from '../src/lib/google/maps/photo_cache'

const LEGACY_HOST = 'maps.googleapis.com'

const { table } = database()

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

async function run(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const limit = Number(arg('--limit') ?? Infinity)

  const snapshot = await table('metadata_places').get()

  const candidates = snapshot.docs.flatMap(doc => {
    const api = doc.get('places_api') as { id?: string, photo_small?: string, photo_large?: string } | undefined
    const large = api?.photo_large
    if (!api?.id || !large || !new URL(large).host.endsWith(LEGACY_HOST)) return []
    return [{ ref: doc.ref, name: doc.id, placeId: api.id, large }]
  })

  const todo = candidates.slice(0, limit)
  console.log(`${snapshot.size} places, ${candidates.length} with direct Places API photo URLs, migrating ${todo.length}`)
  console.log(`Billable Places photo requests: ${todo.length}`)
  if (!apply) {
    console.log('Dry run, pass --apply to download, upload and update Firestore')
    return
  }

  let ok = 0
  const failed: string[] = []
  for (const { ref, name, placeId, large } of todo) {
    try {
      // Reuse the stored reference/key, only ask for a bigger image
      const url = new URL(large)
      url.searchParams.set('maxheight', '1024')
      url.searchParams.delete('maxwith') // sic: typo in the legacy URLs

      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`photo download failed: ${resp.status} ${resp.statusText}`)
      const original = Buffer.from(await resp.arrayBuffer())
      const small = await sharp(original).resize(256, 256, { fit: 'inside' }).jpeg().toBuffer()

      const contentType = resp.headers.get('content-type')
      const photo_large = await PhotoCache.store(original, contentType, placeId, '1024')
      const photo_small = await PhotoCache.store(small, 'image/jpeg', placeId, '256')

      await ref.update({ 'places_api.photo_large': photo_large, 'places_api.photo_small': photo_small })
      ok += 1
      console.log(`[${ok}/${todo.length}] ${name}`)
    } catch (err) {
      failed.push(name)
      console.warn(`FAILED ${name}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`Migrated ${ok}, failed ${failed.length}`, failed)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
