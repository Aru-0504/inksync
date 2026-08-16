const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      room_id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled Document',
      state BYTEA,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  console.log('Database ready — documents table exists')
}

async function loadDocState(roomId) {
  const result = await pool.query(
    'SELECT state FROM documents WHERE room_id = $1',
    [roomId]
  )
  return result.rows[0]?.state || null
}

async function saveDocState(roomId, state) {
  await pool.query(
    `INSERT INTO documents (room_id, state, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (room_id)
     DO UPDATE SET state = $2, updated_at = now()`,
    [roomId, state]
  )
}

async function createDocument(roomId, title) {
  await pool.query(
    `INSERT INTO documents (room_id, title) VALUES ($1, $2)`,
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

module.exports = { initDB, loadDocState, saveDocState, createDocument, listDocuments }