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
      )
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
  } catch (err) {
    console.error('Failed to delete document from DB:', err)
  }
}