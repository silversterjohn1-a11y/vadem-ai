/**
 * Generate a valid Anki `.apkg` deck in the browser and trigger a download.
 * An `.apkg` is a ZIP containing a SQLite database (`collection.anki2`, Anki
 * schema v11) plus a `media` manifest. We build the SQLite file with sql.js
 * (via the pure `populate` in ./anki-core) and zip it with JSZip.
 */
import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import JSZip from 'jszip'
import { populate, type AnkiDeck } from './anki-core'

export type { AnkiCard, AnkiDeck } from './anki-core'

/** Build the `.apkg` bytes for one or more decks. */
export async function buildApkg(decks: AnkiDeck[]): Promise<Blob> {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const db = new SQL.Database()
  await populate(db, decks)
  const bytes = db.export()
  db.close()

  const zip = new JSZip()
  zip.file('collection.anki2', bytes)
  zip.file('media', '{}')
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

/** Build an `.apkg` from the given decks and start a browser download. */
export async function downloadApkg(fileName: string, decks: AnkiDeck[]): Promise<void> {
  const blob = await buildApkg(decks)
  const safe = fileName.replace(/[^a-z0-9\-_. ]/gi, '_').replace(/\s+/g, '_')
  const name = safe.toLowerCase().endsWith('.apkg') ? safe : `${safe}.apkg`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
