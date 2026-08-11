'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import { ydoc, provider } from '@/lib/yjs-provider'

const names = ['Arunima', 'Guest', 'Reviewer', 'Collaborator']
const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24']
const randomIndex = Math.floor(Math.random() * names.length)

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCaret.configure({
        provider: provider,
        user: {
          name: names[randomIndex],
          color: colors[randomIndex],
        },
      }),
    ],
    immediatelyRender: false,
  })

  useEffect(() => {
    // @ts-expect-error - temporary debug hook
    window.ydoc = ydoc
  }, [])

  return (
    <div className="border rounded-lg p-4 min-h-[400px] prose max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}