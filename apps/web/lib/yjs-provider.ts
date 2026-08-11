import * as Y from 'yjs'

// A single shared Y.Doc for now — this is our CRDT source of truth.
// Later (Phase 2), this same doc gets synced across clients over WebSocket.
export const ydoc = new Y.Doc()