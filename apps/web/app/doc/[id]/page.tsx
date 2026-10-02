'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUserIdentity, UserIdentity } from '@/lib/user-identity'
import { useYjsRoom } from '@/hooks/useYjsRoom'
import Editor from '@/components/Editor'
import ConnectionStatus from '@/components/ConnectionStatus'
import CollaboratorBar from '@/components/CollaboratorBar'
import LiveReactions from '@/components/LiveReactions'
import CommentsDrawer from '@/components/CommentsDrawer'
import VersionHistoryDrawer from '@/components/VersionHistoryDrawer'
import DocumentOutline from '@/components/DocumentOutline'
import CommandPalette from '@/components/CommandPalette'
import {
  AlignLeft,
  MessageSquare,
  History,
  Share2,
  Download,
  Trash2,
  Wifi,
  WifiOff,
  Search,
  Check,
  ChevronLeft,
  FileText,
  Printer,
  Sparkles,
} from 'lucide-react'
import type { Editor as TiptapEditor } from '@tiptap/react'

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template') || undefined
  const { id: roomId } = use(params)
  const [currentUser, setCurrentUser] = useState<UserIdentity>({
    name: 'Collaborator',
    color: '#C496A1',
  })
  const [title, setTitle] = useState('Loading document...')
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Drawers and Modals State
  const [isOutlineOpen, setIsOutlineOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isVersionsOpen, setIsVersionsOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [selectedTextForComment, setSelectedTextForComment] = useState('')
  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(null)

  // Initialize client user profile
  useEffect(() => {
    setCurrentUser(getUserIdentity())
  }, [])

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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

  // Count active comments from Yjs
  const [openCommentsCount, setOpenCommentsCount] = useState(0)
  useEffect(() => {
    if (!ydoc) return
    const ycomments = ydoc.getArray('comments')
    const updateCount = () => {
      const arr = ycomments.toArray() as Array<{ resolved?: boolean }>
      setOpenCommentsCount(arr.filter((c) => !c.resolved).length)
    }
    ycomments.observe(updateCount)
    updateCount()
    return () => ycomments.unobserve(updateCount)
  }, [ydoc])

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

  // Copy shareable link
  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
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

  // Export to HTML
  const handleExportHtml = () => {
    if (!editorInstance) return
    const html = editorInstance.getHTML()
    const docHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:sans-serif;max-width:750px;margin:40px auto;padding:20px;line-height:1.7;color:#382D27;background:#FAF6EE;}h1{color:#5D0D18;}h2,h3{color:#382D27;}blockquote{border-left:4px solid #C496A1;padding-left:16px;color:#81785A;}table{border-collapse:collapse;width:100%;margin:20px 0;}th,td{border:1px solid #E5DAC2;padding:8px;text-align:left;}th{background:#EBE1C6;color:#5D0D18;}</style></head><body><h1>${title}</h1>${html}</body></html>`
    const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`)
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

  const handleOpenComment = (selectedText: string) => {
    setSelectedTextForComment(selectedText)
    setIsCommentsOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#181316] text-[#382D27] dark:text-[#F5EFE6] flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-[#E5DAC2] dark:border-[#2D2429] bg-[#FAF6EE]/90 dark:bg-[#181316]/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-2.5 no-print transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Navigation & Document Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/"
              className="p-2 rounded-xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#81785A] dark:text-[#AFA69F] hover:text-[#5D0D18] dark:hover:text-white hover:bg-[#C496A1]/15 transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
              title="Return to Documents"
            >
              <ChevronLeft size={16} />
              <span className="text-xs font-semibold hidden sm:inline">Docs</span>
            </Link>

            <button
              onClick={() => setIsOutlineOpen(!isOutlineOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isOutlineOpen
                  ? 'bg-[#5D0D18] text-[#FFF9EB] border-[#5D0D18]'
                  : 'border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#81785A] dark:text-[#AFA69F] hover:bg-[#FAF6EE]'
              }`}
              title="Toggle Outline / Table of Contents"
            >
              <AlignLeft size={16} />
            </button>

            <div className="h-4 w-px bg-[#E5DAC2] dark:bg-[#2D2429] hidden sm:block" />

            <div className="flex-1 relative flex items-center max-w-md">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                className="w-full text-sm md:text-base font-bold bg-transparent border-b border-transparent hover:border-[#E5DAC2] dark:hover:border-[#382E33] focus:border-[#C496A1] focus:outline-none px-1.5 py-0.5 transition-colors text-[#382D27] dark:text-[#F5EFE6] truncate"
                placeholder="Untitled Document"
              />
              {isSavingTitle && (
                <span className="absolute right-2 text-[10px] text-[#AFA69F] animate-pulse">
                  saving...
                </span>
              )}
            </div>
          </div>

          {/* Center: Live Multiplayer Reactions Bar */}
          <div className="hidden lg:flex items-center">
            <LiveReactions provider={provider} userName={currentUser.name} />
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2">
            {/* Quick Command Palette Trigger (Cmd+K) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-xs text-[#81785A] dark:text-[#AFA69F] hover:text-[#5D0D18] dark:hover:text-white transition-colors cursor-pointer shadow-xs"
              title="Open Command Palette (⌘K)"
            >
              <Search size={14} />
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#E5DAC2] dark:border-[#382E33] bg-[#FAF6EE] dark:bg-[#181316]">
                ⌘K
              </span>
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isCommentsOpen
                  ? 'bg-[#C496A1] text-white border-[#C496A1]'
                  : 'border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#81785A] dark:text-[#AFA69F] hover:bg-[#FAF6EE]'
              }`}
              title="Open Comments & Discussion"
            >
              <MessageSquare size={16} />
              {openCommentsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C496A1] text-white text-[9px] font-bold flex items-center justify-center">
                  {openCommentsCount}
                </span>
              )}
            </button>

            {/* Version History Toggle */}
            <button
              onClick={() => setIsVersionsOpen(!isVersionsOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isVersionsOpen
                  ? 'bg-[#81785A] text-white border-[#81785A]'
                  : 'border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#81785A] dark:text-[#AFA69F] hover:bg-[#FAF6EE]'
              }`}
              title="Version History & Snapshots"
            >
              <History size={16} />
            </button>

            {/* Share Link */}
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#382D27] dark:text-[#F5EFE6] hover:bg-[#FAF6EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Copy share link to collaborate"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-[#C496A1]" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Chaos / Simulated Offline Mode */}
            <button
              type="button"
              onClick={handleToggleChaosMode}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isSimulatedOffline
                  ? 'bg-[#C496A1]/30 border-[#C496A1] text-[#5D0D18]'
                  : 'border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#81785A] dark:text-[#AFA69F] hover:bg-[#FAF6EE]'
              }`}
              title="Simulate network disconnection to test local CRDT resilience"
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff size={14} className="text-[#5D0D18]" />
                  <span>Offline CRDT</span>
                </>
              ) : (
                <>
                  <Wifi size={14} className="text-[#919D85]" />
                  <span>Live Relay</span>
                </>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#382D27] dark:text-[#F5EFE6] hover:bg-[#FAF6EE] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Export document"
              >
                <Download size={14} className="text-[#81785A] dark:text-[#AFA69F]" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#E5DAC2] dark:border-[#382E33] bg-[#FFF9EB] dark:bg-[#201A1D] shadow-2xl py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FAF6EE] dark:hover:bg-[#2B2327] flex items-center justify-between text-[#382D27] dark:text-[#F5EFE6] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-[#919D85]" />
                      <span>Download Markdown</span>
                    </div>
                    <span className="text-[10px] text-[#81785A] font-mono">.md</span>
                  </button>
                  <button
                    onClick={handleExportHtml}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FAF6EE] dark:hover:bg-[#2B2327] flex items-center justify-between text-[#382D27] dark:text-[#F5EFE6] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-[#8E88A3]" />
                      <span>Download HTML</span>
                    </div>
                    <span className="text-[10px] text-[#81785A] font-mono">.html</span>
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#FAF6EE] dark:hover:bg-[#2B2327] flex items-center justify-between text-[#382D27] dark:text-[#F5EFE6] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Printer size={14} className="text-[#81785A]" />
                      <span>Print / PDF Document</span>
                    </div>
                    <span className="text-[10px] text-[#81785A] font-mono">.pdf</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete Document Button */}
            <button
              type="button"
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="p-2 rounded-xl border border-[#E5DAC2] dark:border-[#2D2429] bg-white dark:bg-[#201A1D] text-[#81785A] hover:text-[#5D0D18] hover:border-[#C496A1] transition-colors cursor-pointer"
              title="Delete document"
            >
              <Trash2 size={15} />
            </button>

            <div className="h-4 w-px bg-[#E5DAC2] dark:bg-[#2D2429] hidden sm:block" />

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

      {/* Drawers */}
      <DocumentOutline
        editor={editorInstance}
        isOpen={isOutlineOpen}
        onClose={() => setIsOutlineOpen(false)}
      />

      <CommentsDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        ydoc={ydoc}
        currentUser={currentUser}
        selectedText={selectedTextForComment}
      />

      <VersionHistoryDrawer
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
        roomId={roomId}
        currentAuthor={currentUser.name}
        onVersionRestored={() => {}}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onToggleOutline={() => setIsOutlineOpen((prev) => !prev)}
        onToggleComments={() => setIsCommentsOpen((prev) => !prev)}
        onToggleVersions={() => setIsVersionsOpen((prev) => !prev)}
        onExportMarkdown={handleExportMarkdown}
        onExportHtml={handleExportHtml}
        onExportPrint={handlePrintPDF}
        onShareLink={handleShareLink}
        onToggleChaosMode={handleToggleChaosMode}
        onInsertTask={() => editorInstance?.chain().focus().toggleTaskList().run()}
        onInsertTable={() =>
          editorInstance
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        onInsertCodeBlock={() => editorInstance?.chain().focus().toggleCodeBlock().run()}
        onInsertImage={() => {
          const url = window.prompt('Enter image URL:')
          if (url) editorInstance?.chain().focus().setImage({ src: url }).run()
        }}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 md:p-12 flex flex-col">
        {ydoc && provider ? (
          <Editor
            ydoc={ydoc}
            provider={provider}
            user={currentUser}
            templateId={templateId}
            onOpenComment={handleOpenComment}
            onEditorReady={(editor) => setEditorInstance(editor)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center min-h-100 text-[#81785A]">
            <div className="w-8 h-8 border-2 border-[#5D0D18] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold">Initializing CRDT document state...</p>
          </div>
        )}
      </main>
    </div>
  )
}
