'use client'

import React, { useState, useEffect } from 'react'
import { History, Plus, RotateCcw, X, Clock, Check } from 'lucide-react'

export interface VersionItem {
  id: number
  room_id: string
  version_name: string
  author_name: string
  created_at: string
}

interface VersionHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  currentAuthor: string
  onVersionRestored: () => void
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  roomId,
  currentAuthor,
  onVersionRestored,
}: VersionHistoryDrawerProps) {
  const [versions, setVersions] = useState<VersionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newVersionName, setNewVersionName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchVersions = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/documents/${roomId}/versions`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data)
      }
    } catch (err) {
      console.error('Failed to fetch versions', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchVersions()
    }
  }, [isOpen, roomId])

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVersionName.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch(`/api/documents/${roomId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionName: newVersionName.trim(),
          authorName: currentAuthor,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setVersions((prev) => [created, ...prev])
        setNewVersionName('')
        setSuccessMessage('Snapshot saved!')
        setTimeout(() => setSuccessMessage(''), 2500)
      }
    } catch (err) {
      console.error('Failed to create snapshot', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRestoreVersion = async (versionId: number, versionName: string) => {
    if (!window.confirm(`Restore to "${versionName}"? Current unsaved edits will be replaced.`)) {
      return
    }

    setRestoringId(versionId)
    try {
      const res = await fetch(`/api/documents/${roomId}/versions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })

      if (res.ok) {
        setSuccessMessage(`Restored to ${versionName}! Reloading...`)
        setTimeout(() => {
          onVersionRestored()
          window.location.reload()
        }, 800)
      }
    } catch (err) {
      console.error('Failed to restore version', err)
    } finally {
      setRestoringId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 md:w-96 bg-[#FAF6EE] dark:bg-[#1E191C] border-l border-[#E5DAC2] dark:border-[#382E33] shadow-2xl flex flex-col transform transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#E5DAC2] dark:border-[#382E33] flex items-center justify-between bg-white/70 dark:bg-[#181316]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <History size={18} className="text-[#81785A]" />
          <h2 className="text-sm font-semibold text-[#382D27] dark:text-[#F5EFE6]">
            Version History
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EBE1C6] dark:bg-[#382E33] text-[#5D0D18] font-bold">
            {versions.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#81785A] hover:bg-[#EBE1C6]/60 dark:hover:bg-[#382E33] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Save Checkpoint Form */}
      <form
        onSubmit={handleCreateVersion}
        className="p-4 border-b border-[#E5DAC2] dark:border-[#382E33] bg-white dark:bg-[#201A1D] flex flex-col gap-2"
      >
        <span className="text-[11px] font-medium text-[#81785A] dark:text-[#AFA69F]">
          Save Current State as Snapshot
        </span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g., Draft v1, Pre-review"
            value={newVersionName}
            onChange={(e) => setNewVersionName(e.target.value)}
            className="flex-1 bg-[#FAF6EE] dark:bg-[#181316] border border-[#E5DAC2] dark:border-[#382E33] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#81785A] text-[#382D27] dark:text-[#F5EFE6]"
          />
          <button
            type="submit"
            disabled={isCreating || !newVersionName.trim()}
            className="px-3 py-2 rounded-xl bg-[#5D0D18] hover:bg-[#480912] dark:bg-[#C496A1] text-white dark:text-[#2A161D] text-xs font-medium hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} />
            <span>Save</span>
          </button>
        </div>
        {successMessage && (
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Check size={12} />
            <span>{successMessage}</span>
          </div>
        )}
      </form>

      {/* Snapshots Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#81785A]">
            Loading version checkpoints...
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-[#81785A] text-xs">
            <Clock size={28} className="mx-auto mb-2 opacity-40 text-[#81785A]" />
            No version checkpoints recorded yet.
            <div className="mt-1 text-[11px] text-[#81785A]/70">
              Save a checkpoint above to preserve this state for time-travel.
            </div>
          </div>
        ) : (
          versions.map((ver) => (
            <div
              key={ver.id}
              className="p-3.5 rounded-2xl bg-[#FFF9EB] dark:bg-[#241D20] border border-[#E5DAC2] dark:border-[#382E33] shadow-xs flex flex-col gap-2 group hover:border-[#81785A]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#382D27] dark:text-[#F5EFE6]">
                    {ver.version_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#81785A]">
                    <span>By {ver.author_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(ver.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRestoreVersion(ver.id, ver.version_name)}
                  disabled={restoringId === ver.id}
                  className="px-2.5 py-1 rounded-lg border border-[#E5DAC2] dark:border-[#382E33] text-[11px] font-medium text-[#382D27] dark:text-[#F5EFE6] hover:bg-[#EBE1C6]/70 hover:border-[#81785A] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  title="Restore this version"
                >
                  <RotateCcw size={12} className={restoringId === ver.id ? 'animate-spin' : ''} />
                  <span>Restore</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
