'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Plus,
  Trash2,
  Share2,
  Check,
  FileText,
  Clock,
  LayoutGrid,
  List,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { TEMPLATE_PRESETS } from '@/lib/template-presets'

interface DocumentItem {
  room_id: string
  title: string
  created_at: string
  updated_at: string
}

const TEMPLATES = Object.values(TEMPLATE_PRESETS)

export default function Home() {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [customRoom, setCustomRoom] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const handleCreateDocument = async (
    customTitle = 'Untitled Document',
    templateId?: string
  ) => {
    setIsCreating(true)
    const querySuffix = templateId ? `?template=${templateId}` : ''
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: customTitle }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.roomId) {
          router.push(`/doc/${data.roomId}${querySuffix}`)
          return
        }
      }
      const fallbackId = crypto.randomUUID()
      router.push(`/doc/${fallbackId}${querySuffix}`)
    } catch (err) {
      console.warn('Document creation API failed, navigating directly:', err)
      const fallbackId = crypto.randomUUID()
      router.push(`/doc/${fallbackId}${querySuffix}`)
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

  const handleCopyLink = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/doc/${roomId}`
    navigator.clipboard.writeText(url)
    setCopiedId(roomId)
    setTimeout(() => setCopiedId(null), 2000)
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
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#181316] text-[#382D27] dark:text-[#F5EFE6] flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-[#E5DAC2] dark:border-[#2D2429] bg-[#FAF6EE]/90 dark:bg-[#181316]/90 backdrop-blur-md sticky top-0 z-20 px-6 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo with Vintage Swatch */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-7 w-9 rounded-xl overflow-hidden shadow-xs border border-[#382D27]/20">
              <span className="w-1/5 h-full bg-[#5D0D18]" title="Bloodstone" />
              <span className="w-1/5 h-full bg-[#C496A1]" title="Dusty Rose" />
              <span className="w-1/5 h-full bg-[#919D85]" title="Muted Sage" />
              <span className="w-1/5 h-full bg-[#8E88A3]" title="Lavender Purple" />
              <span className="w-1/5 h-full bg-[#EBE1C6]" title="Vintage Cream" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#382D27] dark:text-[#F5EFE6] group-hover:text-[#5D0D18] dark:group-hover:text-[#C496A1] transition-colors">
              InkSync
            </span>
          </Link>

          {/* New Document Button */}
          <button
            onClick={() => handleCreateDocument()}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#5D0D18] hover:bg-[#480912] dark:bg-[#C496A1] dark:text-[#2A161D] text-[#FFF9EB] text-xs font-semibold active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Plus size={15} />
            <span>New Document</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-6 py-10 flex-1 flex flex-col gap-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl p-8 md:p-12 border border-[#E5DAC2] dark:border-[#2D2429] bg-linear-to-br from-[#FFF9EB] via-[#FAF6EE] to-[#C496A1]/15 dark:from-[#22181C] dark:via-[#1A1417] dark:to-[#5D0D18]/15 shadow-xs">
          <div className="max-w-2xl py-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#382D27] dark:text-[#F5EFE6] leading-tight">
              Write together seamlessly.
              <br />
              <span className="text-[#81785A] dark:text-[#C496A1] font-normal">
                Online, offline, or anywhere in between.
              </span>
            </h1>
          </div>
        </section>

        {/* Quick Templates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold tracking-tight uppercase text-[11px] text-[#81785A] dark:text-[#AFA69F]">
              Start with a Template
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleCreateDocument(tmpl.title, tmpl.id)}
                className="group p-5 rounded-2xl bg-white dark:bg-[#1E191C] border border-[#E5DAC2] dark:border-[#2D2429] hover:border-[#C496A1] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl select-none">{tmpl.icon}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBE1C6]/60 dark:bg-[#2D2429] text-[#81785A] dark:text-[#AFA69F]">
                      {tmpl.category}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#382D27] dark:text-[#F5EFE6] group-hover:text-[#5D0D18] transition-colors mb-1">
                    {tmpl.title}
                  </h3>
                  <p className="text-[11px] text-[#81785A] dark:text-[#AFA69F] leading-relaxed">
                    {tmpl.subtitle}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E5DAC2] dark:border-[#2D2429] flex items-center justify-between text-[11px] font-medium text-[#81785A] group-hover:text-[#5D0D18] dark:group-hover:text-white">
                  <span>Create page</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Documents Workspace Area */}
        <section className="flex-1 flex flex-col">
          {/* Controls Bar: Search, View Switcher, Direct Room Join */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-64">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#81785A]" />
                <input
                  type="text"
                  placeholder="Search documents by title or room ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#1E191C] border border-[#E5DAC2] dark:border-[#2D2429] text-xs outline-none focus:border-[#C496A1] text-[#382D27] dark:text-[#F5EFE6] placeholder:text-[#AFA69F] shadow-2xs"
                />
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-white dark:bg-[#1E191C] border border-[#E5DAC2] dark:border-[#2D2429] rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#5D0D18] text-[#FFF9EB] dark:bg-[#C496A1] dark:text-[#2A161D]'
                      : 'text-[#81785A] hover:text-[#382D27]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#5D0D18] text-[#FFF9EB] dark:bg-[#C496A1] dark:text-[#2A161D]'
                      : 'text-[#81785A] hover:text-[#382D27]'
                  }`}
                  title="List View"
                >
                  <List size={14} />
                </button>
              </div>
            </div>

            {/* Join Room by ID Input */}
            <form onSubmit={handleJoinCustomRoom} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Join by room ID..."
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                className="w-44 px-3 py-2 rounded-xl bg-white dark:bg-[#1E191C] border border-[#E5DAC2] dark:border-[#2D2429] text-xs outline-none focus:border-[#C496A1] text-[#382D27] dark:text-[#F5EFE6] placeholder:text-[#AFA69F] shadow-2xs"
              />
              <button
                type="submit"
                disabled={!customRoom.trim()}
                className="px-3 py-2 rounded-xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#1E191C] text-[#382D27] dark:text-[#F5EFE6] text-xs font-semibold hover:bg-[#FAF6EE] disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                Join
              </button>
            </form>
          </div>

          {/* Document Content List / Grid */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-xs text-[#81785A]">
              <div className="w-6 h-6 border-2 border-[#C496A1] border-t-transparent rounded-full animate-spin mb-3" />
              <span>Loading saved documents...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white/60 dark:bg-[#1E191C]/60">
              <FileText size={36} className="text-[#C496A1] opacity-60 mb-3" />
              <h3 className="text-sm font-bold text-[#382D27] dark:text-[#F5EFE6] mb-1">
                {search ? 'No matching documents found' : 'No documents created yet'}
              </h3>
              <p className="text-xs text-[#81785A] dark:text-[#AFA69F] max-w-sm mb-4">
                {search
                  ? `We couldn't find any documents matching "${search}". Try a different keyword or create a new document.`
                  : 'Get started by creating your first real-time collaborative document or choosing a template above.'}
              </p>
              <button
                onClick={() => handleCreateDocument()}
                className="px-4 py-2 rounded-xl bg-[#5D0D18] hover:bg-[#480912] dark:bg-[#C496A1] dark:text-[#2A161D] text-[#FFF9EB] text-xs font-semibold transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Create Document</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <Link
                  key={doc.room_id}
                  href={`/doc/${doc.room_id}`}
                  className="group p-5 rounded-2xl bg-white dark:bg-[#1E191C] border border-[#E5DAC2] dark:border-[#2D2429] hover:border-[#C496A1] dark:hover:border-[#C496A1]/60 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#C496A1]/20 flex items-center justify-center text-[#5D0D18] dark:text-[#C496A1] shrink-0 font-serif font-bold text-sm">
                        ¶
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCopyLink(e, doc.room_id)}
                          className="p-1.5 rounded-lg text-[#81785A] hover:text-[#5D0D18] dark:hover:text-white hover:bg-[#EBE1C6]/40 transition-colors"
                          title="Copy share link"
                        >
                          {copiedId === doc.room_id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Share2 size={14} />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteDoc(e, doc.room_id, doc.title)}
                          className="p-1.5 rounded-lg text-[#81785A] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#382D27] dark:text-[#F5EFE6] group-hover:text-[#5D0D18] dark:group-hover:text-[#C496A1] transition-colors line-clamp-1 mb-1">
                      {doc.title || 'Untitled Document'}
                    </h3>

                    <p className="text-[11px] font-mono text-[#81785A] dark:text-[#AFA69F] truncate">
                      {doc.room_id}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-[#E5DAC2]/60 dark:border-[#2D2429] flex items-center justify-between text-[11px] text-[#81785A] dark:text-[#AFA69F]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>
                        {new Date(doc.updated_at || doc.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="text-[#C496A1] group-hover:translate-x-1 transition-transform font-bold">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1E191C] border border-[#E5DAC2] dark:border-[#2D2429] rounded-2xl overflow-hidden shadow-xs">
              <div className="divide-y divide-[#E5DAC2] dark:divide-[#2D2429]">
                {filteredDocs.map((doc) => (
                  <Link
                    key={doc.room_id}
                    href={`/doc/${doc.room_id}`}
                    className="flex items-center justify-between p-4 hover:bg-[#FAF6EE] dark:hover:bg-[#201A1D] transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                      <div className="w-8 h-8 rounded-lg bg-[#C496A1]/15 flex items-center justify-center text-[#5D0D18] dark:text-[#C496A1] shrink-0 font-serif font-bold text-sm">
                        ¶
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#382D27] dark:text-[#F5EFE6] group-hover:text-[#5D0D18] dark:group-hover:text-[#C496A1] transition-colors truncate">
                          {doc.title || 'Untitled Document'}
                        </h4>
                        <span className="text-[10px] font-mono text-[#81785A] dark:text-[#AFA69F]">
                          {doc.room_id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#81785A] dark:text-[#AFA69F] shrink-0">
                      <span className="hidden sm:inline text-[11px]">
                        {new Date(doc.updated_at || doc.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleCopyLink(e, doc.room_id)}
                          className="p-1.5 rounded-lg text-[#81785A] hover:text-[#5D0D18] dark:hover:text-white hover:bg-[#EBE1C6]/40 transition-colors"
                          title="Copy share link"
                        >
                          {copiedId === doc.room_id ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Share2 size={14} />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteDoc(e, doc.room_id, doc.title)}
                          className="p-1.5 rounded-lg text-[#81785A] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5DAC2] dark:border-[#2D2429] py-6 px-6 text-center text-xs text-[#81785A] dark:text-[#AFA69F] no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span className="font-semibold text-[#2D2327] dark:text-[#F5EFE6]">InkSync</span>
          <span>—</span>
          <span>Real-time collaborative document editor</span>
        </div>
      </footer>
    </div>
  )
}
