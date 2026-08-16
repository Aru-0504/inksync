'use client'

import { useEffect, useState } from 'react'
import { provider } from '@/lib/yjs-provider'

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    // Set the real status only after mounting in the browser —
    // avoids server/client mismatch since the server has no real WebSocket state.
    setStatus(provider.wsconnected ? 'connected' : 'disconnected')

    const handleStatus = ({ status }: { status: string }) => {
      setStatus(status === 'connected' ? 'connected' : 'disconnected')
    }

    provider.on('status', handleStatus)

    return () => {
      provider.off('status', handleStatus)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm mb-4">
      <span
        className={`w-2 h-2 rounded-full ${
          status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
        }`}
      />
      <span className="text-gray-500">
        {status === 'connected'
          ? 'Synced'
          : 'Offline — changes saved locally'}
      </span>
    </div>
  )
}