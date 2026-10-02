'use client'

import React, { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import confetti from 'canvas-confetti'

interface LiveReactionsProps {
  provider: WebsocketProvider | null
  userName: string
}

interface FloatingReaction {
  id: string
  emoji: string
  sender: string
  x: number
}

const EMOJIS = ['👏', '🔥', '❤️', '💡', '✨', '🎉']

export default function LiveReactions({ provider, userName }: LiveReactionsProps) {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])

  const triggerReaction = (emoji: string) => {
    // If it's confetti or celebration, trigger celebratory burst
    if (emoji === '🎉' || emoji === '🔥' || emoji === '✨') {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.85 },
        colors: ['#C496A1', '#919D85', '#8E88A3', '#EBE1C6', '#5D0D18', '#81785A'],
      })
    }

    const newReaction: FloatingReaction = {
      id: Math.random().toString(),
      emoji,
      sender: 'You',
      x: 35 + Math.random() * 30,
    }

    setFloatingReactions((prev) => [...prev, newReaction])
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id))
    }, 2400)

    // Broadcast via awareness
    if (provider?.awareness) {
      provider.awareness.setLocalStateField('reaction', {
        emoji,
        sender: userName,
        timestamp: Date.now(),
      })
    }
  }

  // Listen for peer reactions
  useEffect(() => {
    if (!provider?.awareness) return

    const handleAwarenessChange = () => {
      const states = provider.awareness.getStates()
      states.forEach((state, clientId) => {
        if (clientId === provider.awareness.clientID) return
        const reaction = state.reaction
        if (reaction && Date.now() - reaction.timestamp < 1500) {
          // Check if we've already displayed this exact timestamp
          const reactionKey = `${clientId}-${reaction.timestamp}`
          setFloatingReactions((prev) => {
            if (prev.some((r) => r.id === reactionKey)) return prev
            return [
              ...prev,
              {
                id: reactionKey,
                emoji: reaction.emoji,
                sender: reaction.sender || 'Peer',
                x: 20 + Math.random() * 60,
              },
            ]
          })

          setTimeout(() => {
            setFloatingReactions((prev) => prev.filter((r) => r.id !== `${clientId}-${reaction.timestamp}`))
          }, 2400)
        }
      })
    }

    provider.awareness.on('change', handleAwarenessChange)
    return () => {
      provider.awareness.off('change', handleAwarenessChange)
    }
  }, [provider])

  return (
    <div className="relative">
      {/* Floating Reaction Bubbles Animation */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 animate-float-fade flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#201A1D]/95 border border-[#E5DAC2] dark:border-[#3A3236] shadow-xl backdrop-blur-md"
            style={{ left: `${r.x}%` }}
          >
            <span className="text-2xl select-none">{r.emoji}</span>
            <span className="text-[11px] font-medium text-[#81785A] dark:text-[#AFA69F]">
              {r.sender}
            </span>
          </div>
        ))}
      </div>

      {/* Pill Reactions Bar */}
      <div className="flex items-center gap-1 bg-white/80 dark:bg-[#201A1D]/80 backdrop-blur-md border border-[#E5DAC2] dark:border-[#3A3236] px-1.5 py-1 rounded-full shadow-xs">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => triggerReaction(emoji)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:scale-125 hover:bg-[#C496A1]/20 transition-all text-sm cursor-pointer select-none active:scale-95"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
