import { NextResponse } from 'next/server'
import { getDocument, updateDocumentTitle, createDocument } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    let doc = await getDocument(id)

    // Auto-initialize document in database if it doesn't exist yet
    if (!doc) {
      await createDocument(id, 'Untitled Document')
      doc = await getDocument(id)
    }

    if (doc) return NextResponse.json(doc)
  } catch (error) {
    console.warn('Failed to retrieve document from DB, returning fallback:', error)
  }

  // Graceful fallback for offline / disconnected DB state
  return NextResponse.json({
    room_id: id,
    title: 'Untitled Document',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const title = body.title?.trim() || 'Untitled Document'

    await updateDocumentTitle(id, title)
    return NextResponse.json({ success: true, title })
  } catch (error) {
    console.error('Failed to update document title:', error)
    return NextResponse.json({ error: 'Failed to update document title' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { deleteDocument } = await import('@/lib/db')
    await deleteDocument(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

