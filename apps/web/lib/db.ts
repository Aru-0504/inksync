import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
})

export interface DocumentRow {
  room_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface DocumentVersionRow {
  id: number
  room_id: string
  version_name: string
  author_name: string
  created_at: string
}

let tableInitialized = false

async function ensureTable() {
  if (tableInitialized) return
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        room_id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT 'Untitled Document',
        state BYTEA,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS document_versions (
        id SERIAL PRIMARY KEY,
        room_id TEXT NOT NULL,
        version_name TEXT NOT NULL,
        state BYTEA NOT NULL,
        author_name TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    tableInitialized = true
  } catch (err) {
    console.warn('Could not initialize documents table:', err)
  }
}

export async function listDocuments(): Promise<DocumentRow[]> {
  await ensureTable()
  try {
    const result = await pool.query(
      `SELECT room_id, title, created_at, updated_at
       FROM documents
       ORDER BY updated_at DESC`
    )
    return result.rows
  } catch (err) {
    console.error('Failed to list documents from DB:', err)
    return []
  }
}

export async function getDocument(roomId: string): Promise<DocumentRow | null> {
  await ensureTable()
  try {
    const result = await pool.query(
      `SELECT room_id, title, created_at, updated_at
       FROM documents
       WHERE room_id = $1`,
      [roomId]
    )
    return result.rows[0] || null
  } catch (err) {
    console.error('Failed to get document from DB:', err)
    return null
  }
}

export async function createDocument(roomId: string, title: string) {
  await ensureTable()
  try {
    await pool.query(
      `INSERT INTO documents (room_id, title)
       VALUES ($1, $2)
       ON CONFLICT (room_id) DO NOTHING`,
      [roomId, title]
    )
  } catch (err) {
    console.error('Failed to insert document into DB:', err)
  }
}

export async function updateDocumentTitle(roomId: string, title: string) {
  await ensureTable()
  try {
    await pool.query(
      `UPDATE documents
       SET title = $2, updated_at = now()
       WHERE room_id = $1`,
      [roomId, title]
    )
  } catch (err) {
    console.error('Failed to update document title in DB:', err)
  }
}

export async function deleteDocument(roomId: string) {
  await ensureTable()
  try {
    await pool.query(
      `DELETE FROM documents WHERE room_id = $1`,
      [roomId]
    )
    await pool.query(
      `DELETE FROM document_versions WHERE room_id = $1`,
      [roomId]
    )
  } catch (err) {
    console.error('Failed to delete document from DB:', err)
  }
}

export async function createDocumentVersion(
  roomId: string,
  versionName: string,
  authorName: string = 'Anonymous'
): Promise<DocumentVersionRow | null> {
  await ensureTable()
  try {
    const docRes = await pool.query(
      `SELECT state FROM documents WHERE room_id = $1`,
      [roomId]
    )
    const state = docRes.rows[0]?.state
    if (!state) return null

    const result = await pool.query(
      `INSERT INTO document_versions (room_id, version_name, state, author_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, room_id, version_name, author_name, created_at`,
      [roomId, versionName, state, authorName]
    )
    return result.rows[0]
  } catch (err) {
    console.error('Failed to create version in DB:', err)
    return null
  }
}

export async function listDocumentVersions(roomId: string): Promise<DocumentVersionRow[]> {
  await ensureTable()
  try {
    const result = await pool.query(
      `SELECT id, room_id, version_name, author_name, created_at
       FROM document_versions
       WHERE room_id = $1
       ORDER BY created_at DESC`,
      [roomId]
    )
    return result.rows
  } catch (err) {
    console.error('Failed to list versions from DB:', err)
    return []
  }
}

export async function getDocumentVersionState(versionId: number): Promise<Buffer | null> {
  await ensureTable()
  try {
    const result = await pool.query(
      `SELECT state FROM document_versions WHERE id = $1`,
      [versionId]
    )
    return result.rows[0]?.state || null
  } catch (err) {
    console.error('Failed to get version state from DB:', err)
    return null
  }
}

export async function restoreDocumentVersion(roomId: string, versionId: number): Promise<boolean> {
  await ensureTable()
  try {
    const verRes = await pool.query(
      `SELECT state FROM document_versions WHERE id = $1 AND room_id = $2`,
      [versionId, roomId]
    )
    const state = verRes.rows[0]?.state
    if (!state) return false

    await pool.query(
      `UPDATE documents
       SET state = $2, updated_at = now()
       WHERE room_id = $1`,
      [roomId, state]
    )
    return true
  } catch (err) {
    console.error('Failed to restore document version:', err)
    return false
  }
}