'use client'

import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { createProviders } from '@/lib/yjs-provider'
import { UserIdentity } from '@/lib/user-identity'

export interface Collaborator {
  clientId: number
  name: string
  color: string
}

export type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected'

export interface UseYjsRoomReturn {
  ydoc: Y.Doc | null
  provider: WebsocketProvider | null
  persistence: IndexeddbPersistence | null
  status: ConnectionStatusType
  collaborators: Collaborator[]
  isSynced: boolean
}

export function useYjsRoom(roomId: string, user: UserIdentity): UseYjsRoomReturn {
  const [providers, setProviders] = useState<{
    ydoc: Y.Doc
    provider: WebsocketProvider
    persistence: IndexeddbPersistence
  } | null>(null)

  const [status, setStatus] = useState<ConnectionStatusType>('connecting')
  const [isSynced, setIsSynced] = useState<boolean>(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  useEffect(() => {
    if (!roomId) return

    const { ydoc, provider, persistence } = createProviders(roomId)
    setProviders({ ydoc, provider, persistence })

    // Set local awareness for presence & cursors
    provider.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
    })

    const updateCollaborators = () => {
      const states = provider.awareness.getStates()
      const users: Collaborator[] = []
      states.forEach((state, clientId) => {
        if (state && state.user && state.user.name) {
          users.push({
            clientId,
            name: state.user.name,
            color: state.user.color || '#3b82f6',
          })
        }
      })
      setCollaborators(users)
    }

    const handleStatus = (event: { status: string }) => {
      setStatus(event.status as ConnectionStatusType)
    }

    const handleSync = (isSyncedEvent: boolean) => {
      setIsSynced(isSyncedEvent)
    }

    provider.on('status', handleStatus)
    provider.on('synced', handleSync)
    provider.awareness.on('change', updateCollaborators)

    // Initial check
    setStatus(provider.wsconnected ? 'connected' : 'connecting')
    setIsSynced(provider.synced)
    updateCollaborators()

    return () => {
      provider.off('status', handleStatus)
      provider.off('synced', handleSync)
      provider.awareness.off('change', updateCollaborators)

      provider.destroy()
      persistence.destroy()
      ydoc.destroy()
    }
  }, [roomId, user.name, user.color])

  return {
    ydoc: providers?.ydoc ?? null,
    provider: providers?.provider ?? null,
    persistence: providers?.persistence ?? null,
    status,
    collaborators,
    isSynced,
  }
}
