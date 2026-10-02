'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { UserIdentity } from '@/lib/user-identity'
import EditorToolbar from './EditorToolbar'
import SlashCommandMenu from './SlashCommandMenu'
import { Bold, Italic, Strikethrough, Code, Highlighter, MessageSquare } from 'lucide-react'
import { TEMPLATE_PRESETS } from '@/lib/template-presets'

interface EditorProps {
  ydoc: Y.Doc
  provider: WebsocketProvider
  user: UserIdentity
  templateId?: string
  onOpenComment?: (selectedText: string) => void
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void
}

export default function Editor({
  ydoc,
  provider,
  user,
  templateId,
  onOpenComment,
  onEditorReady,
}: EditorProps) {
  const [stats, setStats] = useState({ words: 0, characters: 0, readTimeMinutes: 0 })
  const [bubblePosition, setBubblePosition] = useState<{
    visible: boolean
    top: number
    left: number
    selectedText: string
  }>({
    visible: false,
    top: 0,
    left: 0,
    selectedText: '',
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Yjs Collaboration extension manages undo/redo history natively
        undoRedo: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider: provider,
        user: {
          name: user.name,
          color: user.color,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'tiptap focus:outline-none min-h-125 text-[#382D27] dark:text-[#FAF6EE] leading-relaxed font-normal selection:bg-[#C496A1]/40 selection:text-inherit',
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  // Seed template content on first load if the document is empty
  useEffect(() => {
    if (!editor || !templateId) return
    const preset = TEMPLATE_PRESETS[templateId]
    if (!preset) return

    let applied = false
    const applyTemplate = () => {
      if (applied) return
      const isEmpty = editor.isEmpty || editor.getText().trim() === ''
      if (isEmpty) {
        applied = true
        editor.commands.setContent(preset.content)
      }
    }

    if (provider.synced) {
      applyTemplate()
    } else {
      provider.once('synced', applyTemplate)
      const timer = setTimeout(applyTemplate, 400)
      return () => clearTimeout(timer)
    }
  }, [editor, templateId, provider])

  // Track selection for floating bubble menu
  useEffect(() => {
    if (!editor) return

    const updateSelection = () => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, ' ')

      if (from !== to && text.trim().length > 0) {
        const domSelection = window.getSelection()
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setBubblePosition({
            visible: true,
            top: rect.top - 48,
            left: rect.left + rect.width / 2,
            selectedText: text,
          })
          return
        }
      }

      setBubblePosition((prev) => (prev.visible ? { ...prev, visible: false } : prev))
    }

    editor.on('selectionUpdate', updateSelection)
    return () => {
      editor.off('selectionUpdate', updateSelection)
    }
  }, [editor])

  // Update statistics on change
  useEffect(() => {
    if (!editor) return

    const updateStats = () => {
      const text = editor.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const characters = text.length
      const readTimeMinutes = Math.ceil(words / 200)
      setStats({ words, characters, readTimeMinutes })
    }

    editor.on('update', updateStats)
    updateStats()

    return () => {
      editor.off('update', updateStats)
    }
  }, [editor])

  // Keep local user profile updated in awareness if user renames themselves
  useEffect(() => {
    if (editor && provider) {
      provider.awareness.setLocalStateField('user', {
        name: user.name,
        color: user.color,
      })
    }
  }, [editor, provider, user.name, user.color])

  return (
    <div className="w-full flex flex-col relative">
      <EditorToolbar editor={editor} />
      <SlashCommandMenu editor={editor} />

      {/* Floating Selection Bubble Menu */}
      {bubblePosition.visible && editor && (
        <div
          className="fixed z-50 flex items-center gap-0.5 bg-[#2D2327] dark:bg-[#1A1417] text-[#FAF6EE] p-1 rounded-xl shadow-2xl border border-[#44383E] -translate-x-1/2 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: `${bubblePosition.top}px`, left: `${bubblePosition.left}px` }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
              editor.isActive('bold') ? 'text-[#C496A1]' : 'text-white'
            }`}
            title="Bold"
          >
            <Bold size={13} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
              editor.isActive('italic') ? 'text-[#C496A1]' : 'text-white'
            }`}
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
              editor.isActive('strike') ? 'text-[#C496A1]' : 'text-white'
            }`}
            title="Strikethrough"
          >
            <Strikethrough size={13} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
              editor.isActive('code') ? 'text-[#C496A1]' : 'text-white'
            }`}
            title="Code"
          >
            <Code size={13} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#C496A1' }).run()}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
              editor.isActive('highlight') ? 'text-[#C496A1]' : 'text-white'
            }`}
            title="Highlight"
          >
            <Highlighter size={13} />
          </button>

          <div className="w-px h-3.5 bg-white/20 mx-1" />

          <button
            onClick={() => {
              if (onOpenComment) {
                onOpenComment(bubblePosition.selectedText)
              }
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#C496A1]/25 text-[#C496A1] hover:bg-[#C496A1]/35 transition-colors cursor-pointer"
          >
            <MessageSquare size={12} />
            <span>Comment</span>
          </button>
        </div>
      )}

      {/* Editor Canvas Card (Warm Linen Paper Sheet) */}
      <div className="w-full bg-[#FFFDF9] dark:bg-[#1E191C] text-[#382D27] dark:text-[#FAF6EE] border border-[#E5DAC2] dark:border-[#382E33] rounded-3xl p-8 md:p-14 min-h-150 shadow-sm transition-colors">
        <EditorContent editor={editor} />
      </div>

      {/* Live Document Stats Footer */}
      <div className="flex items-center justify-between text-[11px] text-[#81785A] dark:text-[#AFA69F] mt-4 px-2 font-sans">
        <div className="flex items-center gap-3.5 font-mono">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.characters} chars</span>
          <span>•</span>
          <span>~{stats.readTimeMinutes} min read</span>
        </div>
        <div className="text-[#81785A] italic flex items-center gap-2">
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded-md border border-[#E5DAC2] dark:border-[#382E33] font-mono text-[10px] bg-[#FAF6EE] dark:bg-[#201A1D] text-[#382D27] dark:text-[#F5EFE6]">⌘K</kbd> for actions
          </span>
          <span>•</span>
          <span>
            Type <kbd className="px-1.5 py-0.5 rounded-md border border-[#E5DAC2] dark:border-[#382E33] font-mono text-[10px] bg-[#FAF6EE] dark:bg-[#201A1D] text-[#382D27] dark:text-[#F5EFE6]">/</kbd> for blocks
          </span>
        </div>
      </div>
    </div>
  )
}