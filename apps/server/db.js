const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Creates the table if it doesn't already exist — safe to run every time the server starts
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      room_id TEXT PRIMARY KEY,
      state BYTEA NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `)
  console.log('Database ready — documents table exists')
}

// Loads a saved snapshot for a room, if one exists
async function loadDocState(roomId) {
  const result = await pool.query(
    'SELECT state FROM documents WHERE room_id = $1',
    [roomId]
  )
  return result.rows[0]?.state || null
}

// Saves (or updates) a room's current document state
async function saveDocState(roomId, state) {
  await pool.query(
    `INSERT INTO documents (room_id, state, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (room_id)
     DO UPDATE SET state = $2, updated_at = now()`,
    [roomId, state]
  )
}

module.exports = { initDB, loadDocState, saveDocState }