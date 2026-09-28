'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import {
  BoldIcon,
  ItalicIcon,
  StrikeIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  UndoIcon,
  RedoIcon,
} from './Icons'

interface EditorToolbarProps {
  editor: Editor | null
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const btnClass = (isActive: boolean) =>
    `p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
      isActive
        ? 'bg-[#2D2327] text-[#F6DF88] shadow-xs'
        : 'text-[#7D726D] hover:bg-[#FDFBF7] hover:text-[#2D2327]'
    }`

  const divider = <div className="w-px h-4 bg-[#EDE8E1] my-auto mx-1" />

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5 border border-[#EDE8E1] rounded-2xl bg-white/95 backdrop-blur-md sticky top-3 z-20 shadow-xs mb-6 max-w-fit mx-auto transition-all">
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-lg text-[#7D726D] dark:text-[#AFA69F] hover:bg-[#FAF7F2] dark:hover:bg-[#1C1619] disabled:opacity-20 disabled:hover:bg-transparent transition-opacity cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-lg text-[#7D726D] dark:text-[#AFA69F] hover:bg-[#FAF7F2] dark:hover:bg-[#1C1619] disabled:opacity-20 disabled:hover:bg-transparent transition-opacity cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <RedoIcon size={15} />
      </button>

      {divider}

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1 (#)"
      >
        <Heading1Icon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2 (##)"
      >
        <Heading2Icon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3 (###)"
      >
        <Heading3Icon size={16} />
      </button>

      {divider}

      {/* Formatting Marks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <BoldIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <ItalicIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <StrikeIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive('code'))}
        title="Inline Code (`)"
      >
        <CodeIcon size={15} />
      </button>

      {divider}

      {/* Lists & Block formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Bullet List (-)"
      >
        <ListIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Numbered List (1.)"
      >
        <ListOrderedIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Quote (>)"
      >
        <QuoteIcon size={15} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive('codeBlock'))}
        title="Code Block (```)"
      >
        <span className="text-[11px] font-mono px-1 font-bold">{'{ }'}</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded-lg text-[#7D726D] dark:text-[#AFA69F] hover:bg-[#FAF7F2] dark:hover:bg-[#1C1619] transition-colors cursor-pointer"
        title="Horizontal Divider (---)"
      >
        <span className="text-xs font-bold leading-none">—</span>
      </button>
    </div>
  )
}
