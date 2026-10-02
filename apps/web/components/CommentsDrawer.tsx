'use client'

import React, { useState, useEffect } from 'react'
import * as Y from 'yjs'
import { UserIdentity } from '@/lib/user-identity'
import { MessageSquare, CheckCircle2, Send, X, CornerDownRight, Check, Trash2 } from 'lucide-react'

export interface CommentReply {
  id: string
  author: { name: string; color: string }
  text: string
  createdAt: string
}

export interface DocumentComment {
  id: string
  author: { name: string; color: string }
  text: string
  quote?: string
  resolved: boolean
  createdAt: string
  replies: CommentReply[]
}

interface CommentsDrawerProps {
  isOpen: boolean
  onClose: () => void
  ydoc: Y.Doc | null
  currentUser: UserIdentity
  selectedText?: string
}

export default function CommentsDrawer({
  isOpen,
  onClose,
  ydoc,
  currentUser,
  selectedText,
}: CommentsDrawerProps) {
  const [comments, setComments] = useState<DocumentComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open')
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({})

  // Listen to Yjs comments array
  useEffect(() => {
    if (!ydoc) return

    const ycomments = ydoc.getArray<DocumentComment>('comments')

    const updateState = () => {
      setComments(ycomments.toArray())
    }

    ycomments.observe(updateState)
    updateState()

    return () => {
      ycomments.unobserve(updateState)
    }
  }, [ydoc])

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ydoc || !newCommentText.trim()) return

    const ycomments = ydoc.getArray<DocumentComment>('comments')
    const newComment: DocumentComment = {
      id: crypto.randomUUID(),
      author: { name: currentUser.name, color: currentUser.color },
      text: newCommentText.trim(),
      quote: selectedText?.trim() || undefined,
      resolved: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: [],
    }

    ycomments.push([newComment])
    setNewCommentText('')
  }

  const handleToggleResolve = (id: string) => {
    if (!ydoc) return
    const ycomments = ydoc.getArray<DocumentComment>('comments')
    const arr = ycomments.toArray()
    const index = arr.findIndex((c) => c.id === id)
    if (index !== -1) {
      const item = { ...arr[index], resolved: !arr[index].resolved }
      ydoc.transact(() => {
        ycomments.delete(index, 1)
        ycomments.insert(index, [item])
      })
    }
  }

  const handleDeleteComment = (id: string) => {
    if (!ydoc) return
    const ycomments = ydoc.getArray<DocumentComment>('comments')
    const arr = ycomments.toArray()
    const index = arr.findIndex((c) => c.id === id)
    if (index !== -1) {
      ycomments.delete(index, 1)
    }
  }

  const handleAddReply = (commentId: string) => {
    const text = (replyText[commentId] || '').trim()
    if (!ydoc || !text) return

    const ycomments = ydoc.getArray<DocumentComment>('comments')
    const arr = ycomments.toArray()
    const index = arr.findIndex((c) => c.id === commentId)
    if (index !== -1) {
      const target = arr[index]
      const updatedReply: CommentReply = {
        id: crypto.randomUUID(),
        author: { name: currentUser.name, color: currentUser.color },
        text,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      const updated = {
        ...target,
        replies: [...(target.replies || []), updatedReply],
      }
      ydoc.transact(() => {
        ycomments.delete(index, 1)
        ycomments.insert(index, [updated])
      })
      setReplyText((prev) => ({ ...prev, [commentId]: '' }))
    }
  }

  if (!isOpen) return null

  const filteredComments = comments.filter((c) =>
    activeTab === 'open' ? !c.resolved : c.resolved
  )

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 md:w-96 bg-[#FAF6EE] dark:bg-[#1E191C] border-l border-[#E5DAC2] dark:border-[#382E33] shadow-2xl flex flex-col transform transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[#E5DAC2] dark:border-[#382E33] flex items-center justify-between bg-white/70 dark:bg-[#181316]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-[#C496A1]" />
          <h2 className="text-sm font-semibold text-[#382D27] dark:text-[#F5EFE6]">
            Comments & Discussion
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EBE1C6] dark:bg-[#382E33] text-[#5D0D18] dark:text-[#C496A1] font-bold">
            {comments.filter((c) => !c.resolved).length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#81785A] hover:bg-[#EBE1C6]/60 dark:hover:bg-[#382E33] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5DAC2] dark:border-[#382E33] px-4 pt-2 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('open')}
          className={`pb-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'open'
              ? 'border-[#5D0D18] dark:border-[#C496A1] text-[#5D0D18] dark:text-[#C496A1] font-bold'
              : 'border-transparent text-[#81785A] hover:text-[#382D27]'
          }`}
        >
          Open ({comments.filter((c) => !c.resolved).length})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`pb-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'resolved'
              ? 'border-[#5D0D18] dark:border-[#C496A1] text-[#5D0D18] dark:text-[#C496A1] font-bold'
              : 'border-transparent text-[#81785A] hover:text-[#382D27]'
          }`}
        >
          Resolved ({comments.filter((c) => c.resolved).length})
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredComments.length === 0 ? (
          <div className="text-center py-12 text-[#81785A] text-xs">
            <MessageSquare size={28} className="mx-auto mb-2 opacity-40 text-[#C496A1]" />
            No {activeTab} comments.
            <div className="mt-1 text-[11px] text-[#81785A]/70">
              Select text in the editor and click &ldquo;Comment&rdquo; to start a discussion.
            </div>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                comment.resolved
                  ? 'bg-white/40 dark:bg-[#181316]/40 border-[#E5DAC2] dark:border-[#2B2327] opacity-75'
                  : 'bg-[#FFF9EB] dark:bg-[#241D20] border-[#E5DAC2] dark:border-[#382E33] shadow-xs'
              }`}
            >
              {/* Author & Actions Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: comment.author.color }}
                  >
                    {comment.author.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-[#382D27] dark:text-[#F5EFE6]">
                    {comment.author.name}
                  </span>
                  <span className="text-[10px] text-[#81785A]/70">{comment.createdAt}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleResolve(comment.id)}
                    className="p-1 rounded text-[#7D726D] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                    title={comment.resolved ? 'Reopen comment' : 'Resolve comment'}
                  >
                    <CheckCircle2
                      size={15}
                      className={comment.resolved ? 'text-emerald-500 fill-emerald-100' : ''}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 rounded text-[#7D726D] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete thread"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Quote if exists */}
              {comment.quote && (
                <div className="mb-2 pl-2.5 border-l-2 border-[#C496A1] text-[11px] italic text-[#5D0D18] dark:text-[#C496A1] line-clamp-2 bg-[#C496A1]/10 py-1 pr-2 rounded-r-md">
                  &ldquo;{comment.quote}&rdquo;
                </div>
              )}

              {/* Comment text */}
              <p className="text-xs text-[#382D27] dark:text-[#E8E2D9] leading-relaxed">
                {comment.text}
              </p>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-3 space-y-2 border-l border-[#E5DAC2] dark:border-[#382E33]">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-[11px] text-[#382D27] dark:text-[#F5EFE6]">
                          {reply.author.name}
                        </span>
                        <span className="text-[10px] text-[#81785A] dark:text-[#AFA69F]">{reply.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-[#554A50] dark:text-[#C5BCB6]">{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {!comment.resolved && (
                <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-[#E5DAC2]/60 dark:border-[#382E33]/60">
                  <CornerDownRight size={13} className="text-[#81785A] shrink-0" />
                  <input
                    type="text"
                    placeholder="Reply..."
                    value={replyText[comment.id] || ''}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddReply(comment.id)
                      }
                    }}
                    className="flex-1 bg-transparent text-[11px] outline-none text-[#382D27] dark:text-[#F5EFE6] placeholder:text-[#AFA69F]"
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    className="text-[10px] font-medium text-[#5D0D18] hover:text-[#C496A1] cursor-pointer px-1.5 py-0.5"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Comment Input Form */}
      <form
        onSubmit={handleAddComment}
        className="p-3.5 border-t border-[#E5DAC2] dark:border-[#382E33] bg-white dark:bg-[#201A1D] flex flex-col gap-2"
      >
        {selectedText && (
          <div className="flex items-center justify-between text-[11px] bg-[#C496A1]/15 px-2.5 py-1 rounded-md text-[#5D0D18] dark:text-[#C496A1] line-clamp-1">
            <span>Replying to: &ldquo;{selectedText}&rdquo;</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add a comment to document..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 bg-[#FAF6EE] dark:bg-[#181316] border border-[#E5DAC2] dark:border-[#382E33] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#C496A1] text-[#382D27] dark:text-[#F5EFE6]"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="w-8 h-8 rounded-xl bg-[#5D0D18] hover:bg-[#480912] dark:bg-[#C496A1] text-white dark:text-[#2A161D] flex items-center justify-center hover:opacity-90 disabled:opacity-30 cursor-pointer transition-opacity shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </form>
    </div>
  )
}
