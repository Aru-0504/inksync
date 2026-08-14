import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

export const ydoc = new Y.Doc()

export const provider = new WebsocketProvider(
  'ws://localhost:1234',
  'inksync-demo-room',
  ydoc
)

export const persistence = new IndexeddbPersistence('inksync-demo-room', ydoc)

persistence.on('synced', () => {
  console.log('Content loaded from local IndexedDB storage')
})