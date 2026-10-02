'use client'

import React, { useState } from 'react'
import { Collaborator } from '@/hooks/useYjsRoom'
import { UserIdentity, saveUserIdentity } from '@/lib/user-identity'
import { ShareIcon } from './Icons'

interface CollaboratorBarProps {
  collaborators: Collaborator[]
  currentUser: UserIdentity
  onUpdateCurrentUser: (updated: UserIdentity) => void
  roomId: string
}

export default function CollaboratorBar({
  collaborators,
  currentUser,
  onUpdateCurrentUser,
  roomId,
}: CollaboratorBarProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(currentUser.name)
  const [copied, setCopied] = useState(false)

  const handleNameSave = () => {
    const trimmed = tempName.trim()
    if (trimmed && trimmed !== currentUser.name) {
      const updated = { ...currentUser, name: trimmed }
      saveUserIdentity(updated)
      onUpdateCurrentUser(updated)
    }
    setIsEditingName(false)
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Follow Mode: Jump to collaborator's caret in the editor
  const handleFollowCollaborator = (name: string) => {
    const labels = document.querySelectorAll('.collaboration-carets__label')
    for (const label of Array.from(labels)) {
      if (label.textContent?.trim() === name.trim()) {
        label.scrollIntoView({ behavior: 'smooth', block: 'center' })
        label.classList.add('ring-2', 'ring-[#C496A1]', 'scale-110')
        setTimeout(() => {
          label.classList.remove('ring-2', 'ring-[#C496A1]', 'scale-110')
        }, 1200)
        return
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Share / Copy Room Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-[#E5DAC2] bg-[#FFF9EB] text-[#382D27] hover:bg-[#FAF6EE] transition-all shadow-xs cursor-pointer"
        title="Copy room URL to clipboard"
      >
        <ShareIcon size={13} className="text-[#81785A]" />
        <span>{copied ? 'Copied link!' : 'Share'}</span>
      </button>

      {/* Collaborator Avatars (with Follow Mode on click) */}
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {collaborators.map((user, idx) => (
          <button
            key={`${user.clientId}-${idx}`}
            type="button"
            onClick={() => handleFollowCollaborator(user.name)}
            title={`Click to jump to ${user.name}'s cursor`}
            className="group relative inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold text-[#382D27] shadow-xs border-2 border-[#FAF6EE] transition-transform hover:scale-115 hover:z-20 cursor-pointer"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>

      {/* Current User Badge & Rename */}
      <div className="flex items-center text-xs">
        {isEditingName ? (
          <div className="flex items-center gap-1 bg-[#FFF9EB] p-1.5 rounded-xl border border-[#E5DAC2] shadow-lg z-30">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave()
                if (e.key === 'Escape') setIsEditingName(false)
              }}
              className="px-2 py-0.5 text-xs border rounded-lg border-[#E5DAC2] bg-transparent text-[#382D27] focus:outline-none focus:ring-1 focus:ring-[#5D0D18]"
              autoFocus
            />
            <button
              onClick={handleNameSave}
              className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#5D0D18] text-[#FFF9EB] hover:bg-[#480912] font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTempName(currentUser.name)
              setIsEditingName(true)
            }}
            className="group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-[#E5DAC2] hover:bg-[#FFF9EB] transition-all cursor-pointer"
            title="Click to customize your nickname"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow-xs"
              style={{ backgroundColor: currentUser.color }}
            />
            <span className="font-bold text-[#382D27] group-hover:text-[#5D0D18]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-[#81785A]/70 font-mono">(You)</span>
          </button>
        )}
      </div>
    </div>
  )
}
