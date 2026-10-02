'use client'

import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { AlignLeft, Hash, X } from 'lucide-react'

interface OutlineItem {
  text: string
  level: number
  id: string
}

interface DocumentOutlineProps {
  editor: Editor | null
  isOpen: boolean
  onClose: () => void
}

export default function DocumentOutline({ editor, isOpen, onClose }: DocumentOutlineProps) {
  const [headings, setHeadings] = useState<OutlineItem[]>([])

  useEffect(() => {
    if (!editor) return

    const updateHeadings = () => {
      const items: OutlineItem[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const text = node.textContent.trim()
          if (text) {
            items.push({
              text,
              level: node.attrs.level,
              id: `pos-${pos}`,
            })
          }
        }
      })
      setHeadings(items)
    }

    editor.on('update', updateHeadings)
    updateHeadings()

    return () => {
      editor.off('update', updateHeadings)
    }
  }, [editor])

  const scrollToHeading = (text: string) => {
    if (!editor) return
    const elements = Array.from(document.querySelectorAll('.tiptap h1, .tiptap h2, .tiptap h3'))
    const match = elements.find((el) => el.textContent?.trim() === text)
    if (match) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-72 bg-[#FAF6EE] dark:bg-[#1E191C] border-r border-[#E5DAC2] dark:border-[#382E33] shadow-2xl flex flex-col transform transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#E5DAC2] dark:border-[#382E33] flex items-center justify-between bg-white/70 dark:bg-[#181316]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <AlignLeft size={18} className="text-[#919D85]" />
          <h2 className="text-sm font-semibold text-[#382D27] dark:text-[#F5EFE6]">
            Document Outline
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EBE1C6] dark:bg-[#382E33] text-[#5D0D18] font-bold">
            {headings.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#81785A] hover:bg-[#EBE1C6]/60 dark:hover:bg-[#382E33] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Headings List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {headings.length === 0 ? (
          <div className="text-center py-12 text-[#81785A] text-xs">
            <Hash size={24} className="mx-auto mb-2 opacity-40 text-[#919D85]" />
            No headings yet.
            <div className="mt-1 text-[11px] text-[#81785A]/70">
              Add H1, H2, or H3 headings using <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#201A1D] border border-[#E5DAC2] dark:border-[#382E33] text-[10px]">#</kbd> or <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#201A1D] border border-[#E5DAC2] dark:border-[#382E33] text-[10px]">/</kbd>
            </div>
          </div>
        ) : (
          headings.map((h, i) => (
            <button
              key={`${h.id}-${i}`}
              onClick={() => scrollToHeading(h.text)}
              className="w-full text-left py-1.5 px-2.5 rounded-xl hover:bg-[#EBE1C6]/50 dark:hover:bg-[#382E33]/60 transition-colors text-xs text-[#382D27] dark:text-[#F5EFE6] cursor-pointer group flex items-baseline gap-2"
              style={{ paddingLeft: `${(h.level - 1) * 14 + 10}px` }}
            >
              <span className="text-[10px] text-[#919D85] group-hover:text-[#5D0D18] font-mono shrink-0">
                H{h.level}
              </span>
              <span className="truncate">{h.text}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
