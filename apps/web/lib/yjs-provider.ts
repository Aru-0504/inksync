import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

export interface YjsProviders {
  ydoc: Y.Doc
  provider: WebsocketProvider
  persistence: IndexeddbPersistence
}

export function createProviders(roomId: string): YjsProviders {
  const ydoc = new Y.Doc()

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234'

  const provider = new WebsocketProvider(wsUrl, roomId, ydoc, {
    connect: true,
  })

  const persistence = new IndexeddbPersistence(`inksync-doc-${roomId}`, ydoc)

  return { ydoc, provider, persistence }
}