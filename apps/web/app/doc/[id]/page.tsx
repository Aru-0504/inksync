'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getUserIdentity, UserIdentity } from '@/lib/user-identity'
import { useYjsRoom } from '@/hooks/useYjsRoom'
import Editor from '@/components/Editor'
import ConnectionStatus from '@/components/ConnectionStatus'
import CollaboratorBar from '@/components/CollaboratorBar'
import { DownloadIcon, TrashIcon, WifiIcon, WifiOffIcon } from '@/components/Icons'

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id: roomId } = use(params)
  const [currentUser, setCurrentUser] = useState<UserIdentity>({
    name: 'Collaborator',
    color: '#96B3CE',
  })
  const [title, setTitle] = useState('Loading document...')
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Initialize client user profile
  useEffect(() => {
    setCurrentUser(getUserIdentity())
  }, [])

  // Fetch document title
  useEffect(() => {
    let isMounted = true
    async function fetchDoc() {
      try {
        const res = await fetch(`/api/documents/${roomId}`)
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data.title) {
            setTitle(data.title)
          }
        }
      } catch (err) {
        console.error('Failed to load document title', err)
      }
    }
    fetchDoc()
    return () => {
      isMounted = false
    }
  }, [roomId])

  const { ydoc, provider, status, collaborators, isSynced } = useYjsRoom(
    roomId,
    currentUser
  )

  // Save document title
  const handleTitleBlur = async () => {
    const cleanTitle = title.trim() || 'Untitled Document'
    setTitle(cleanTitle)
    setIsSavingTitle(true)
    try {
      await fetch(`/api/documents/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle }),
      })
    } catch (err) {
      console.error('Failed to update title', err)
    } finally {
      setIsSavingTitle(false)
    }
  }

  // Chaos Mode: Toggle WebSocket disconnect to test offline local CRDT edits
  const handleToggleChaosMode = () => {
    if (!provider) return
    if (provider.wsconnected) {
      provider.disconnect()
      setIsSimulatedOffline(true)
    } else {
      provider.connect()
      setIsSimulatedOffline(false)
    }
  }

  // Export to Markdown
  const handleExportMarkdown = () => {
    if (!ydoc) return
    const text = ydoc.getText('prosemirror')?.toString() || ''
    const blob = new Blob([`# ${title}\n\n${text}`], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowExportMenu(false)
  }

  // Export / Print to PDF
  const handlePrintPDF = () => {
    setShowExportMenu(false)
    window.print()
  }

  // Delete Document
  const handleDeleteDocument = async () => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/documents/${roomId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/')
      }
    } catch (err) {
      console.error('Failed to delete document', err)
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2327] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#EDE8E1] bg-[#FDFBF7]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-3 no-print">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Back & Editable Title */}
          <div className="flex items-center gap-3.5 flex-1 min-w-70">
            <Link
              href="/"
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#EDE8E1] bg-white text-[#2D2327] hover:bg-[#F6DF88]/30 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              title="Return to documents list"
            >
              <span>←</span>
              <span>All Docs</span>
            </Link>

            <div className="h-4 w-px bg-[#EDE8E1]" />

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                className="w-full text-base font-bold bg-transparent border-b border-transparent hover:border-[#EDE8E1] focus:border-[#F6DF88] focus:outline-none px-1.5 py-0.5 transition-colors text-[#2D2327]"
                placeholder="Untitled Document"
              />
              {isSavingTitle && (
                <span className="absolute right-2 text-[10px] text-[#AFA69F] animate-pulse">
                  saving...
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions, Status & Collaboration */}
          <div className="flex items-center gap-3">
            {/* Chaos / Simulated Offline Mode */}
            <button
              type="button"
              onClick={handleToggleChaosMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isSimulatedOffline
                  ? 'bg-[#F6DF88]/40 border-[#F6DF88] text-[#2D2327]'
                  : 'border-[#EDE8E1] bg-white text-[#7D726D] hover:bg-[#FDFBF7]'
              }`}
              title="Simulate network disconnection to test local CRDT resilience"
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOffIcon size={14} className="text-[#2D2327]" />
                  <span>Reconnect Relay</span>
                </>
              ) : (
                <>
                  <WifiIcon size={14} className="text-[#96B3CE]" />
                  <span>Simulate Offline</span>
                </>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDE8E1] bg-white text-[#2D2327] hover:bg-[#FDFBF7] text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Export document"
              >
                <DownloadIcon size={13} className="text-[#7D726D]" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#EDE8E1] bg-white shadow-xl py-2 z-40 text-xs">
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FDFBF7] flex items-center justify-between text-[#2D2327] cursor-pointer"
                  >
                    <span>Download Markdown</span>
                    <span className="text-[10px] text-[#AFA69F] font-mono">.md</span>
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FDFBF7] flex items-center justify-between text-[#2D2327] cursor-pointer"
                  >
                    <span>Print / Save as PDF</span>
                    <span className="text-[10px] text-[#AFA69F] font-mono">.pdf</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete Document Button */}
            <button
              type="button"
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="p-2 rounded-xl border border-[#EDE8E1] bg-white text-[#AFA69F] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
              title="Delete document"
            >
              <TrashIcon size={14} />
            </button>

            <div className="h-4 w-px bg-[#EDE8E1]" />

            <ConnectionStatus
              status={isSimulatedOffline ? 'disconnected' : status}
              isSynced={isSynced}
              collaboratorCount={collaborators.length}
            />

            <CollaboratorBar
              collaborators={collaborators}
              currentUser={currentUser}
              onUpdateCurrentUser={setCurrentUser}
              roomId={roomId}
            />
          </div>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 flex flex-col">
        {ydoc && provider ? (
          <Editor ydoc={ydoc} provider={provider} user={currentUser} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-100 text-[#7D726D]">
            <div className="w-8 h-8 border-2 border-[#F6DF88] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Initializing CRDT document state...</p>
          </div>
        )}

        {/* Distributed Architecture Explainer Pill */}
        <section className="mt-12 p-6 rounded-3xl border border-[#EDE8E1] bg-white text-xs text-[#7D726D] no-print shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 font-bold text-[#2D2327]">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-[#2D2327]" />
                <span className="w-2 h-2 rounded-full bg-[#F6DF88]" />
                <span className="w-2 h-2 rounded-full bg-[#96B3CE]" />
              </span>
              <span>
                Room: <code className="font-mono text-[11px] bg-[#FDFBF7] border border-[#EDE8E1] px-2 py-0.5 rounded-lg text-[#2D2327]">{roomId}</code>
              </span>
            </div>
            <span className="text-[11px] text-[#7D726D] font-mono">
              Yjs CRDT + Dumb WebSocket Relay
            </span>
          </div>
          <p className="leading-relaxed">
            Concurrent edits converge deterministically via Yjs operation trees without a central coordinator. Edits are persisted offline to IndexedDB and synchronized to the relay server with debounced PostgreSQL persistence.
          </p>
        </section>
      </main>
    </div>
  )
}
