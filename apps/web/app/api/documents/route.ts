import { NextResponse } from 'next/server'
import { listDocuments, createDocument } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  try {
    const documents = await listDocuments()
    return NextResponse.json(documents)
  } catch (error) {
    console.error('GET /api/documents error:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const roomId = randomUUID()
  let title = 'Untitled Document'

  try {
    const body = await request.json()
    if (body?.title && typeof body.title === 'string' && body.title.trim()) {
      title = body.title.trim()
    }
  } catch {
    // request body was empty or not json, proceed with default title
  }

  try {
    await createDocument(roomId, title)
  } catch (err) {
    console.warn('DB createDocument failed, returning roomId anyway:', err)
  }

  return NextResponse.json({ roomId, title })
}