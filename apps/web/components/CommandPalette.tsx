'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  FileText,
  Download,
  Share2,
  History,
  MessageSquare,
  AlignLeft,
  CheckSquare,
  Table,
  Image,
  Code,
  Wifi,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onToggleOutline: () => void
  onToggleComments: () => void
  onToggleVersions: () => void
  onExportMarkdown: () => void
  onExportHtml: () => void
  onExportPrint: () => void
  onShareLink: () => void
  onToggleChaosMode: () => void
  onInsertTask: () => void
  onInsertTable: () => void
  onInsertCodeBlock: () => void
  onInsertImage: () => void
}

interface PaletteAction {
  id: string
  title: string
  subtitle: string
  category: 'Navigation & Panels' | 'Insert Content' | 'Export & Share' | 'Actions'
  icon: React.ReactNode
  execute: () => void
}

export default function CommandPalette({
  isOpen,
  onClose,
  onToggleOutline,
  onToggleComments,
  onToggleVersions,
  onExportMarkdown,
  onExportHtml,
  onExportPrint,
  onShareLink,
  onToggleChaosMode,
  onInsertTask,
  onInsertTable,
  onInsertCodeBlock,
  onInsertImage,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const actions: PaletteAction[] = [
    {
      id: 'outline',
      title: 'Toggle Document Outline',
      subtitle: 'View headings and table of contents',
      category: 'Navigation & Panels',
      icon: <AlignLeft size={16} className="text-[#919D85]" />,
      execute: () => {
        onToggleOutline()
        onClose()
      },
    },
    {
      id: 'comments',
      title: 'Toggle Discussion & Comments',
      subtitle: 'View and add inline comments',
      category: 'Navigation & Panels',
      icon: <MessageSquare size={16} className="text-[#C496A1]" />,
      execute: () => {
        onToggleComments()
        onClose()
      },
    },
    {
      id: 'versions',
      title: 'Open Version History',
      subtitle: 'Browse snapshots and restore past states',
      category: 'Navigation & Panels',
      icon: <History size={16} className="text-[#81785A]" />,
      execute: () => {
        onToggleVersions()
        onClose()
      },
    },
    {
      id: 'task',
      title: 'Insert Task List',
      subtitle: 'Interactive collaborative checkbox checklist',
      category: 'Insert Content',
      icon: <CheckSquare size={16} className="text-[#5D0D18] dark:text-[#EBE1C6]" />,
      execute: () => {
        onInsertTask()
        onClose()
      },
    },
    {
      id: 'table',
      title: 'Insert Table (3x3 Grid)',
      subtitle: 'Clean data table with rows and columns',
      category: 'Insert Content',
      icon: <Table size={16} className="text-[#8E88A3]" />,
      execute: () => {
        onInsertTable()
        onClose()
      },
    },
    {
      id: 'image',
      title: 'Insert Image',
      subtitle: 'Embed an image from URL',
      category: 'Insert Content',
      icon: <Image size={16} className="text-[#919D85]" />,
      execute: () => {
        onInsertImage()
        onClose()
      },
    },
    {
      id: 'code',
      title: 'Insert Code Snippet',
      subtitle: 'Monospace pre-formatted block',
      category: 'Insert Content',
      icon: <Code size={16} className="text-[#81785A]" />,
      execute: () => {
        onInsertCodeBlock()
        onClose()
      },
    },
    {
      id: 'share',
      title: 'Copy Shareable Link',
      subtitle: 'Invite peers to collaborate real-time',
      category: 'Export & Share',
      icon: <Share2 size={16} className="text-[#C496A1]" />,
      execute: () => {
        onShareLink()
        onClose()
      },
    },
    {
      id: 'export-md',
      title: 'Export as Markdown (.md)',
      subtitle: 'Download formatted markdown file',
      category: 'Export & Share',
      icon: <Download size={16} className="text-[#81785A]" />,
      execute: () => {
        onExportMarkdown()
        onClose()
      },
    },
    {
      id: 'export-html',
      title: 'Export as Clean HTML (.html)',
      subtitle: 'Download clean web-ready markup',
      category: 'Export & Share',
      icon: <Download size={16} className="text-[#81785A]" />,
      execute: () => {
        onExportHtml()
        onClose()
      },
    },
    {
      id: 'print-pdf',
      title: 'Print / Export to PDF',
      subtitle: 'Browser print layout matching editorial styling',
      category: 'Export & Share',
      icon: <FileText size={16} className="text-[#81785A]" />,
      execute: () => {
        onExportPrint()
        onClose()
      },
    },
    {
      id: 'chaos',
      title: 'Toggle Chaos Mode (Simulate Offline)',
      subtitle: 'Disconnect WebSocket to verify local IndexedDB CRDT edits',
      category: 'Actions',
      icon: <Wifi size={16} className="text-[#5D0D18]" />,
      execute: () => {
        onToggleChaosMode()
        onClose()
      },
    },
  ]

  const filtered = actions.filter((a) =>
    `${a.title} ${a.subtitle} ${a.category}`.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].execute()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#FAF6EE] dark:bg-[#201A1D] border border-[#E5DAC2] dark:border-[#3E342B] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5DAC2] dark:border-[#3E342B] bg-[#FFF9EB]/80 dark:bg-[#1C1619]/80 backdrop-blur-md">
          <Search size={18} className="text-[#81785A]/70" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none text-[#382D27] dark:text-[#FAF6EE] placeholder:text-[#81785A]/60"
          />
          <kbd className="px-2 py-0.5 rounded-lg border border-[#E5DAC2] dark:border-[#3E342B] text-[10px] font-mono text-[#81785A] bg-[#FFF9EB] dark:bg-[#251E22]">
            ESC
          </kbd>
        </div>

        {/* Action list */}
        <div className="max-h-84 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#81785A]">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action, idx) => (
              <div
                key={action.id}
                onClick={action.execute}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  selectedIndex === idx
                    ? 'bg-[#EBE1C6]/70 dark:bg-[#382E33]'
                    : 'hover:bg-[#EBE1C6]/35 dark:hover:bg-[#2B2327]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFF9EB] dark:bg-[#241D20] border border-[#E5DAC2] dark:border-[#3E342B] flex items-center justify-center shrink-0 shadow-xs">
                    {action.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-[#382D27] dark:text-[#FAF6EE]">
                      {action.title}
                    </h5>
                    <p className="text-[11px] text-[#81785A]">
                      {action.subtitle}
                    </p>
                  </div>
                </div>
                {selectedIndex === idx && (
                  <ArrowRight size={14} className="text-[#5D0D18] shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#E5DAC2] dark:border-[#3E342B] bg-[#FFF9EB]/60 dark:bg-[#181316]/60 flex items-center justify-between text-[11px] text-[#81785A] font-mono">
          <span>Use &uarr;&darr; to navigate</span>
          <span>&crarr; to select</span>
        </div>
      </div>
    </div>
  )
}
