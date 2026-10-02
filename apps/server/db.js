const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null

async function initDB() {
  if (!pool) {
    console.warn('DATABASE_URL not configured. Running WebSocket relay in memory.')
    return
  }
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
    console.log('Database ready — documents and document_versions tables exist')
  } catch (err) {
    console.warn('Database initialization warning (relay still active):', err.message)
  }
}

async function loadDocState(roomId) {
  if (!pool) return null
  try {
    const result = await pool.query(
      'SELECT state FROM documents WHERE room_id = $1',
      [roomId]
    )
    return result.rows[0]?.state || null
  } catch (err) {
    console.warn(`Could not load doc state for ${roomId}:`, err.message)
    return null
  }
}

async function saveDocState(roomId, state) {
  if (!pool) return
  try {
    await pool.query(
      `INSERT INTO documents (room_id, state, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (room_id)
       DO UPDATE SET state = $2, updated_at = now()`,
      [roomId, state]
    )
  } catch (err) {
    console.warn(`Could not save doc state for ${roomId}:`, err.message)
  }
}

async function createDocument(roomId, title) {
  await pool.query(
    `INSERT INTO documents (room_id, title) VALUES ($1, $2)
     ON CONFLICT (room_id) DO NOTHING`,
    [roomId, title]
  )
}

async function listDocuments() {
  const result = await pool.query(
    `SELECT room_id, title, created_at, updated_at
     FROM documents
     ORDER BY updated_at DESC`
  )
  return result.rows
}

async function createVersion(roomId, versionName, state, authorName = 'Anonymous') {
  const result = await pool.query(
    `INSERT INTO document_versions (room_id, version_name, state, author_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, room_id, version_name, author_name, created_at`,
    [roomId, versionName, state, authorName]
  )
  return result.rows[0]
}

async function listVersions(roomId) {
  const result = await pool.query(
    `SELECT id, room_id, version_name, author_name, created_at
     FROM document_versions
     WHERE room_id = $1
     ORDER BY created_at DESC`,
    [roomId]
  )
  return result.rows
}

async function getVersion(id) {
  const result = await pool.query(
    `SELECT id, room_id, version_name, state, author_name, created_at
     FROM document_versions
     WHERE id = $1`,
    [id]
  )
  return result.rows[0] || null
}

module.exports = {
  initDB,
  loadDocState,
  saveDocState,
  createDocument,
  listDocuments,
  createVersion,
  listVersions,
  getVersion,
}