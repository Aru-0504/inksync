'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SearchIcon, TrashIcon } from '@/components/Icons'

interface DocumentItem {
  room_id: string
  title: string
  created_at: string
  updated_at: string
}

const TEMPLATES = [
  {
    title: '📝 Meeting Notes',
    subtitle: 'Agenda, discussion items, takeaways',
    accent: '#F6DF88',
  },
  {
    title: '🚀 Engineering RFC',
    subtitle: 'Design spec, tradeoffs, architecture',
    accent: '#96B3CE',
  },
  {
    title: '🎯 Sprint Roadmap',
    subtitle: 'Milestones, key deliverables, dates',
    accent: '#D48C70',
  },
]

export default function Home() {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [customRoom, setCustomRoom] = useState('')

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch('/api/documents')
        if (res.ok) {
          const data = await res.json()
          setDocuments(data)
        }
      } catch (err) {
        console.error('Failed to load documents', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleCreateDocument = async (customTitle = 'Untitled Document') => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: customTitle }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.roomId) {
          router.push(`/doc/${data.roomId}`)
          return
        }
      }
      // Fallback: direct navigation with client UUID
      const fallbackId = crypto.randomUUID()
      router.push(`/doc/${fallbackId}`)
    } catch (err) {
      console.warn('Document creation API failed, navigating directly:', err)
      const fallbackId = crypto.randomUUID()
      router.push(`/doc/${fallbackId}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteDoc = async (e: React.MouseEvent, roomId: string, docTitle: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Delete "${docTitle}"?`)) return

    try {
      const res = await fetch(`/api/documents/${roomId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.room_id !== roomId))
      }
    } catch (err) {
      console.error('Failed to delete document', err)
    }
  }

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = customRoom.trim()
    if (clean) {
      router.push(`/doc/${encodeURIComponent(clean)}`)
    }
  }

  const filteredDocs = documents.filter((doc) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.room_id.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2327] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#EDE8E1] bg-[#FDFBF7]/90 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo with Pantone Swatch badge */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-8 w-8 rounded-lg overflow-hidden shadow-xs border border-[#2D2327]/15">
              <span className="w-1/3 h-full bg-[#2D2327]" title="Pantone Espresso" />
              <span className="w-1/3 h-full bg-[#F6DF88]" title="Pantone Popcorn" />
              <span className="w-1/3 h-full bg-[#96B3CE]" title="Pantone Sky Blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-[#2D2327]">
                  InkSync
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F6DF88]/40 text-[#2D2327] font-bold border border-[#F6DF88]">
                  CRDT v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#7D726D]">
                Collaborative Editorial Canvas
              </p>
            </div>
          </div>

          {/* New Document Button */}
          <button
            onClick={() => handleCreateDocument()}
            disabled={isCreating}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F6DF88] hover:bg-[#EED066] text-[#2D2327] shadow-xs border border-[#2D2327]/15 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span className="text-sm leading-none">+</span>
            <span>{isCreating ? 'Creating...' : 'New Document'}</span>
          </button>
        </div>
      </header>

      {/* Hero & Workspace Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-9">
        {/* Editorial Pantone Hero Card */}
        <section className="relative overflow-hidden rounded-3xl border border-[#EDE8E1] bg-white p-8 md:p-10 shadow-xs">
          {/* Subtle warm accent glows in the background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-[#F6DF88]/40 via-[#96B3CE]/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="max-w-2xl relative z-10">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDFBF7] border border-[#EDE8E1] text-[#2D2327] mb-5 shadow-xs">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-[#2D2327]" />
                <span className="w-2 h-2 rounded-full bg-[#F6DF88]" />
                <span className="w-2 h-2 rounded-full bg-[#96B3CE]" />
              </span>
              <span className="text-[11px] font-mono tracking-tight font-bold">Pantone Editorial Canvas</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-[#2D2327] mb-3 leading-tight">
              Real-time collaboration with zero central coordination.
            </h2>
            <p className="text-sm text-[#7D726D] leading-relaxed mb-7">
              Type concurrently with peers across the globe. Powered by mathematical CRDT convergence, dumb WebSocket relays, and instant offline caching in IndexedDB.
            </p>

            {/* Quick Room Launcher */}
            <form onSubmit={handleJoinCustomRoom} className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                placeholder="Enter or create custom room..."
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-[#EDE8E1] bg-[#FDFBF7] text-[#2D2327] placeholder-[#AFA69F] focus:outline-none focus:ring-2 focus:ring-[#F6DF88] transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#2D2327] text-white hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shadow-xs"
              >
                Join Room
              </button>
            </form>
          </div>
        </section>

        {/* Quick Starters / Templates Styled as Pantone Swatches */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-bold tracking-wider text-[#7D726D] uppercase">
              Curated Starters
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.title}
                type="button"
                onClick={() => handleCreateDocument(tmpl.title)}
                className="p-5 rounded-2xl border border-[#EDE8E1] bg-white hover:border-[#2D2327]/30 transition-all text-left group shadow-xs cursor-pointer relative overflow-hidden"
              >
                {/* Pantone color strip top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                  style={{ backgroundColor: tmpl.accent }}
                />
                <div className="pt-1">
                  <div className="text-sm font-bold text-[#2D2327] group-hover:text-[#96B3CE] transition-colors">
                    {tmpl.title}
                  </div>
                  <div className="text-xs text-[#7D726D] mt-1.5 leading-relaxed">
                    {tmpl.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Documents Grid & Instant Search */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2D2327]">
                All Documents
              </h3>
              <span className="text-xs text-[#7D726D] font-mono">
                ({filteredDocs.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-64">
              <SearchIcon
                size={14}
                className="absolute left-3 top-2.5 text-[#7D726D] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#EDE8E1] bg-white text-[#2D2327] placeholder-[#AFA69F] focus:outline-none focus:ring-2 focus:ring-[#F6DF88] transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-14 text-center text-[#7D726D] text-sm">
              <div className="w-7 h-7 border-2 border-[#F6DF88] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading documents from PostgreSQL...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-14 text-center rounded-2xl border border-dashed border-[#EDE8E1] bg-white/70">
              <p className="text-sm text-[#7D726D] mb-4">
                {search ? 'No documents match your search query.' : 'No documents created yet.'}
              </p>
              <button
                onClick={() => handleCreateDocument()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#F6DF88] text-[#2D2327] hover:bg-[#EED066] shadow-xs cursor-pointer"
              >
                Create your first document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <Link
                  key={doc.room_id}
                  href={`/doc/${doc.room_id}`}
                  className="group relative p-5 rounded-2xl border border-[#EDE8E1] bg-white hover:border-[#2D2327]/30 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="pr-7">
                    <h4 className="font-bold text-sm text-[#2D2327] group-hover:text-[#96B3CE] transition-colors line-clamp-1">
                      {doc.title || 'Untitled Document'}
                    </h4>
                    <p className="font-mono text-[11px] text-[#7D726D] mt-1 truncate">
                      id: {doc.room_id}
                    </p>
                  </div>

                  {/* Delete Button on Hover */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteDoc(e, doc.room_id, doc.title)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-[#AFA69F] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <TrashIcon size={14} />
                  </button>

                  <div className="mt-6 pt-3 border-t border-[#EDE8E1] flex items-center justify-between text-[11px] text-[#7D726D]">
                    <span>
                      {doc.updated_at
                        ? `Updated ${new Date(doc.updated_at).toLocaleDateString()}`
                        : 'Recently'}
                    </span>
                    <span className="font-bold text-[#2D2327] group-hover:translate-x-0.5 transition-transform">
                      Open →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
