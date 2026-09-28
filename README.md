# InkSync 🖋️

> Real-time multiplayer collaborative document editor powered by **CRDTs (Conflict-free Replicated Data Types)**, an **uncoordinated dumb WebSocket relay**, and **offline-first local persistence**.

---

## 💡 The Core Engineering Concept

Traditional collaborative apps (like Google Docs) use **Operational Transformation (OT)**, which requires an authoritative centralized server to sequence, transform, and arbitrate competing keystrokes.

**InkSync** uses **CRDTs** via **Yjs**:
- **Deterministic Convergence**: Every character mutation is a uniquely identified operation in a causal tree. Edits made concurrently across multiple clients merge deterministically into the exact same document state without any central coordinator ($A \cup B = B \cup A$).
- **"Dumb" Relay Server**: The WebSocket server on port `1234` is content-agnostic. It treats document changes as opaque binary payloads (`Uint8Array` / `BYTEA`), broadcasting them between connected peers and debouncing database writes to PostgreSQL.
- **Offline-First Resilience**: If a user's network drops, `y-indexeddb` writes all edits locally to the browser's IndexedDB. When reconnecting, a two-step state-vector exchange calculates deltas and synchronizes without data loss or overwrites.
- **Ephemeral Presence / Awareness**: Cursors, user selections, and names are exchanged via an ephemeral awareness protocol rather than polluting the database log.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, React 19), Tailwind CSS v4
- **Editor**: [Tiptap v3](https://tiptap.dev) (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-caret`)
- **CRDT Layer**: [Yjs](https://github.com/yjs/yjs), `y-websocket`, `y-indexeddb`
- **Sync Server**: Node.js + `ws` + `y-websocket` binary relay
- **Database**: PostgreSQL (Neon Serverless) via `pg` (binary `BYTEA` snapshots)

---

## 🚀 Getting Started

### 1. Start the WebSocket Relay Server
In a terminal:
```bash
cd apps/server
node server.js
```
The relay server will run on `ws://localhost:1234` and connect to PostgreSQL.

### 2. Start the Next.js Frontend
In a second terminal:
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Multiplayer & Offline Features

1. **Multiplayer Test**:
   - Open a document at `http://localhost:3000/doc/<id>` in two separate browser windows (or an incognito window).
   - Type in one window: watch characters and colored user carets move live in the other window.
2. **Offline Convergence Test**:
   - In Browser window B, disconnect from the network (e.g. Chrome DevTools -> Network -> **Offline**).
   - Type several paragraphs in Window B (observe the badge switches to *"Offline (Local CRDT)"*).
   - Type different paragraphs in Window A.
   - Re-enable the network in Window B: both clients instantly converge to the union of all changes without conflicts!
