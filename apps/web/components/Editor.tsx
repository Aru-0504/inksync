'use client'

import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { UserIdentity } from '@/lib/user-identity'
import EditorToolbar from './EditorToolbar'
import SlashCommandMenu from './SlashCommandMenu'

interface EditorProps {
  ydoc: Y.Doc
  provider: WebsocketProvider
  user: UserIdentity
}

export default function Editor({ ydoc, provider, user }: EditorProps) {
  const [stats, setStats] = useState({ words: 0, characters: 0, readTimeMinutes: 0 })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Yjs Collaboration extension manages undo/redo history natively
        undoRedo: false,
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
          'tiptap focus:outline-none min-h-125 text-[#2D2327] dark:text-[#F5EFE6] leading-relaxed font-normal selection:bg-[#F6DF88]/50 selection:text-[#2D2327]',
      },
    },
    immediatelyRender: false,
  })

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

      {/* Editor Canvas Card (Warm Linen Paper Sheet) */}
      <div className="w-full bg-white border border-[#EDE8E1] rounded-3xl p-8 md:p-14 min-h-150 shadow-sm transition-colors">
        <EditorContent editor={editor} />
      </div>

      {/* Live Document Stats Footer */}
      <div className="flex items-center justify-between text-[11px] text-[#7D726D] mt-4 px-2 font-sans">
        <div className="flex items-center gap-3.5 font-mono">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.characters} chars</span>
          <span>•</span>
          <span>~{stats.readTimeMinutes} min read</span>
        </div>
        <div className="text-[#AFA69F] italic">
          Type <kbd className="px-1.5 py-0.5 rounded-md border border-[#EDE8E1] font-mono text-[10px] bg-[#FDFBF7] text-[#2D2327]">/</kbd> for blocks
        </div>
      </div>
    </div>
  )
}