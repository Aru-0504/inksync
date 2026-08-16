import { NextResponse } from 'next/server'
import { listDocuments, createDocument } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  const documents = await listDocuments()
  return NextResponse.json(documents)
}

export async function POST(request: Request) {
  const body = await request.json()
  const title = body.title || 'Untitled Document'
  const roomId = randomUUID()

  await createDocument(roomId, title)

  return NextResponse.json({ roomId, title })
}