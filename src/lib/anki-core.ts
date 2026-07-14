/**
 * Pure Anki-package logic (no wasm/DOM imports) so it can run both in the
 * browser (via ../lib/anki) and under Node for tests. `populate` fills an
 * already-created sql.js Database with the Anki schema-v11 tables and rows for
 * the given decks; the caller exports the DB and zips it into an `.apkg`.
 */
import type { Database } from 'sql.js'

export interface AnkiCard {
  front: string
  back: string
}

export interface AnkiDeck {
  /** Full deck name as it appears in Anki, e.g. "VademAI - Cardiology". */
  name: string
  cards: AnkiCard[]
}

const FIELD_SEP = '\x1f' // Anki separates note fields with the unit separator (U+001F)

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

/** Anki checksum: first 8 hex digits of SHA-1 of the first field, as an int. */
async function fieldChecksum(text: string): Promise<number> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return parseInt(hex.slice(0, 8), 16)
}

function guid(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '').slice(0, 10)
}

export const SCHEMA = `
CREATE TABLE col (id integer PRIMARY KEY, crt integer NOT NULL, mod integer NOT NULL, scm integer NOT NULL,
  ver integer NOT NULL, dty integer NOT NULL, usn integer NOT NULL, ls integer NOT NULL, conf text NOT NULL,
  models text NOT NULL, decks text NOT NULL, dconf text NOT NULL, tags text NOT NULL);
CREATE TABLE notes (id integer PRIMARY KEY, guid text NOT NULL, mid integer NOT NULL, mod integer NOT NULL,
  usn integer NOT NULL, tags text NOT NULL, flds text NOT NULL, sfld integer NOT NULL, csum integer NOT NULL,
  flags integer NOT NULL, data text NOT NULL);
CREATE TABLE cards (id integer PRIMARY KEY, nid integer NOT NULL, did integer NOT NULL, ord integer NOT NULL,
  mod integer NOT NULL, usn integer NOT NULL, type integer NOT NULL, queue integer NOT NULL, due integer NOT NULL,
  ivl integer NOT NULL, factor integer NOT NULL, reps integer NOT NULL, lapses integer NOT NULL, left integer NOT NULL,
  odue integer NOT NULL, odid integer NOT NULL, flags integer NOT NULL, data text NOT NULL);
CREATE TABLE revlog (id integer PRIMARY KEY, cid integer NOT NULL, usn integer NOT NULL, ease integer NOT NULL,
  ivl integer NOT NULL, lastIvl integer NOT NULL, factor integer NOT NULL, time integer NOT NULL, type integer NOT NULL);
CREATE TABLE graves (usn integer NOT NULL, oid integer NOT NULL, type integer NOT NULL);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_notes_csum on notes (csum);
`

function deckObject(id: number, name: string, mod: number) {
  return {
    id, name, mod, usn: -1,
    lrnToday: [0, 0], revToday: [0, 0], newToday: [0, 0], timeToday: [0, 0],
    collapsed: false, browserCollapsed: false, desc: '', dyn: 0, conf: 1, extendRev: 50, extendNew: 10,
  }
}

/** Fill `db` with the Anki tables/rows for the given decks. */
export async function populate(db: Database, decks: AnkiDeck[]): Promise<void> {
  db.run(SCHEMA)

  const now = Date.now()
  const nowSec = Math.floor(now / 1000)
  const modelId = now

  const model = {
    id: modelId,
    name: 'VademAI Basic',
    type: 0,
    mod: nowSec,
    usn: -1,
    sortf: 0,
    did: null as number | null,
    tmpls: [
      { name: 'Card 1', ord: 0, qfmt: '{{Front}}', afmt: '{{FrontSide}}\n\n<hr id="answer">\n\n{{Back}}', did: null, bqfmt: '', bafmt: '' },
    ],
    flds: [
      { name: 'Front', ord: 0, sticky: false, rtl: false, font: 'Arial', size: 20, media: [] },
      { name: 'Back', ord: 1, sticky: false, rtl: false, font: 'Arial', size: 20, media: [] },
    ],
    css: '.card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }',
    latexPre:
      '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
    latexPost: '\\end{document}',
    req: [[0, 'all', [0]]],
    vers: [],
    tags: [],
  }

  const decksJson: Record<string, unknown> = { '1': deckObject(1, 'Default', 0) }
  const conf = {
    nextPos: 1, estTimes: true, activeDecks: [1], sortType: 'noteFld', timeLim: 0, sortBackwards: false,
    addToCur: true, curDeck: 1, newBury: true, newSpread: 0, dueCounts: true, curModel: modelId, collapseTime: 1200,
  }
  const dconf = {
    '1': {
      id: 1, mod: 0, name: 'Default', usn: 0, maxTaken: 60, autoplay: true, timer: 0, replayq: true,
      new: { bury: false, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 0], order: 1, perDay: 20, separate: true },
      rev: { bury: false, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 200 },
      lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 },
      dyn: false,
    },
  }

  let position = 1
  let seq = 0
  const noteStmt = db.prepare('INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,?,?)')
  const cardStmt = db.prepare('INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')

  for (let d = 0; d < decks.length; d++) {
    const deckId = now + 1 + d
    decksJson[String(deckId)] = deckObject(deckId, decks[d].name, nowSec)
    if (model.did === null) model.did = deckId

    for (const card of decks[d].cards) {
      const noteId = now + 1_000_000 + seq
      const cardId = now + 2_000_000 + seq
      const flds = escapeHtml(card.front) + FIELD_SEP + escapeHtml(card.back)
      const csum = await fieldChecksum(card.front)

      noteStmt.run([noteId, guid(), modelId, nowSec, -1, '', flds, card.front, csum, 0, ''])
      cardStmt.run([cardId, noteId, deckId, 0, nowSec, -1, 0, 0, position, 0, 0, 0, 0, 0, 0, 0, 0, ''])
      position++
      seq++
    }
  }
  noteStmt.free()
  cardStmt.free()

  db.run('INSERT INTO col VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [
    1, nowSec, now, now, 11, 0, 0, 0,
    JSON.stringify(conf),
    JSON.stringify({ [String(modelId)]: model }),
    JSON.stringify(decksJson),
    JSON.stringify(dconf),
    '{}',
  ])
}
