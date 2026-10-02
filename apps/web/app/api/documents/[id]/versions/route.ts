import { NextResponse } from 'next/server'
import { listDocumentVersions, createDocumentVersion, restoreDocumentVersion } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const versions = await listDocumentVersions(id)
    return NextResponse.json(versions)
  } catch (error) {
    console.error('Failed to get versions:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { versionName, authorName } = body

    if (!versionName || typeof versionName !== 'string') {
      return NextResponse.json({ error: 'versionName is required' }, { status: 400 })
    }

    const version = await createDocumentVersion(
      id,
      versionName.trim(),
      authorName || 'Anonymous'
    )

    if (!version) {
      return NextResponse.json({ error: 'Could not create version' }, { status: 400 })
    }

    return NextResponse.json(version)
  } catch (error) {
    console.error('Failed to create version:', error)
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { versionId } = body

    if (!versionId) {
      return NextResponse.json({ error: 'versionId is required' }, { status: 400 })
    }

    const ok = await restoreDocumentVersion(id, Number(versionId))
    if (!ok) {
      return NextResponse.json({ error: 'Failed to restore version' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to restore version:', error)
    return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 })
  }
}
