import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function listDocuments() {
  const result = await pool.query(
    `SELECT room_id, title, created_at, updated_at
     FROM documents
     ORDER BY updated_at DESC`
  )
  return result.rows
}

export async function createDocument(roomId: string, title: string) {
  await pool.query(
    `INSERT INTO documents (room_id, title) VALUES ($1, $2)`,
    [roomId, title]
  )
}