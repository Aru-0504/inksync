'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import { ydoc } from '@/lib/yjs-provider'

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    immediatelyRender: false,
  })

  useEffect(() => {
    // @ts-expect-error - temporary debug hook, remove after verifying CRDT wiring
    window.ydoc = ydoc
  }, [])

  return (
    <div className="border rounded-lg p-4 min-h-[400px] prose max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}