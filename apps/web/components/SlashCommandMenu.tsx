'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import {
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  CodeIcon,
} from './Icons'

interface CommandItem {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  keywords: string[]
  execute: (editor: Editor) => void
}

const COMMAND_ITEMS: CommandItem[] = [
  {
    id: 'h1',
    title: 'Heading 1',
    subtitle: 'Big section heading',
    icon: <Heading1Icon size={18} className="text-[#2D2327] dark:text-[#F5EFE6]" />,
    keywords: ['h1', 'heading', 'title', 'big'],
    execute: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    subtitle: 'Medium subsection heading',
    icon: <Heading2Icon size={18} className="text-[#2D2327] dark:text-[#F5EFE6]" />,
    keywords: ['h2', 'heading', 'subtitle', 'medium'],
    execute: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    subtitle: 'Small subsection heading',
    icon: <Heading3Icon size={18} className="text-[#2D2327] dark:text-[#F5EFE6]" />,
    keywords: ['h3', 'heading', 'small'],
    execute: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    subtitle: 'Simple bulleted list',
    icon: <ListIcon size={18} className="text-[#96B3CE]" />,
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    execute: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    subtitle: 'Numbered step-by-step list',
    icon: <ListOrderedIcon size={18} className="text-[#96B3CE]" />,
    keywords: ['numbered', 'list', 'ol', 'ordered', 'step'],
    execute: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'quote',
    title: 'Quote',
    subtitle: 'Capture a quote or callout',
    icon: <QuoteIcon size={18} className="text-[#F6DF88]" />,
    keywords: ['quote', 'blockquote', 'callout'],
    execute: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code-block',
    title: 'Code Block',
    subtitle: 'Syntax-friendly code snippet',
    icon: <CodeIcon size={18} className="text-[#D48C70]" />,
    keywords: ['code', 'codeblock', 'snippet', 'pre'],
    execute: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'divider',
    title: 'Divider',
    subtitle: 'Visually divide blocks',
    icon: <span className="text-sm font-bold text-[#7D726D]">—</span>,
    keywords: ['divider', 'hr', 'line', 'rule', 'separator'],
    execute: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
]

interface SlashCommandMenuProps {
  editor: Editor | null
}

export default function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredCommands = COMMAND_ITEMS.filter((cmd) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q))
    )
  })

  const executeCommand = useCallback(
    (item: CommandItem) => {
      if (!editor) return

      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        '\n',
        '\0'
      )
      const slashIndex = textBefore.lastIndexOf('/')
      if (slashIndex !== -1) {
        const deleteFrom = from - (textBefore.length - slashIndex)
        editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run()
      }

      item.execute(editor)
      setIsOpen(false)
      setSearch('')
    },
    [editor]
  )

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const { from } = editor.state.selection
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        '\n',
        '\0'
      )

      const slashIndex = textBefore.lastIndexOf('/')

      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1)
        if (!query.includes(' ')) {
          setSearch(query)
          setSelectedIndex(0)

          try {
            const coords = editor.view.coordsAtPos(from)
            setPosition({
              top: coords.bottom + 8,
              left: Math.max(16, coords.left),
            })
            setIsOpen(true)
            return
          } catch {
            // coordsAtPos might fail if unmounted
          }
        }
      }

      setIsOpen(false)
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleUpdate)
    }
  }, [editor])

  useEffect(() => {
    if (!isOpen || !editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(
          (prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)
        )
      } else if (e.key === 'Enter') {
        if (filteredCommands[selectedIndex]) {
          e.preventDefault()
          executeCommand(filteredCommands[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, selectedIndex, filteredCommands, executeCommand, editor])

  if (!isOpen || filteredCommands.length === 0) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="z-50 w-72 max-h-80 overflow-y-auto rounded-2xl border border-[#EDE8E1] bg-white shadow-2xl p-1.5 transition-all text-[#2D2327]"
    >
      <div className="px-2.5 py-1 text-[11px] font-bold text-[#7D726D] uppercase tracking-wider">
        Blocks & Formats
      </div>

      <div className="flex flex-col gap-0.5">
        {filteredCommands.map((item, index) => {
          const isSelected = index === selectedIndex
          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => executeCommand(item)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#FDFBF7] text-[#2D2327]'
                  : 'text-[#7D726D] hover:bg-[#FDFBF7]/60'
              }`}
            >
              <div className="w-8 h-8 rounded-lg border border-[#EDE8E1] bg-[#FDFBF7] flex items-center justify-center shrink-0 shadow-2xs">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-[#2D2327]">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#7D726D] truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
