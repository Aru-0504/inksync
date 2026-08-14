const { WebSocketServer } = require('ws')
const http = require('http')
const { setupWSConnection, docs } = require('y-websocket/bin/utils')
const Y = require('yjs')
const { initDB, loadDocState, saveDocState } = require('./db')

const port = process.env.PORT || 1234

const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('InkSync sync server is running')
})

const wss = new WebSocketServer({ server })

// Extracts the room name from the connection URL, e.g. ws://localhost:1234/my-room
function getRoomName(req) {
  return req.url.slice(1).split('?')[0] || 'default-room'
}

wss.on('connection', async (ws, req) => {
  const roomName = getRoomName(req)

  // Let y-websocket set up the connection and create the Y.Doc for this room (if not already created)
  setupWSConnection(ws, req)

  const ydoc = docs.get(roomName)
  if (!ydoc) return

  // Only load + attach save-listener once per room (the first time it's created),
  // not on every single client connection to an already-active room
  if (!ydoc._persistenceLoaded) {
    ydoc._persistenceLoaded = true

    // Load previously saved state, if any, and apply it to the fresh doc
    const savedState = await loadDocState(roomName)
    if (savedState) {
      Y.applyUpdate(ydoc, savedState)
      console.log(`Loaded saved state for room: ${roomName}`)
    }

    // Debounced save: wait 2 seconds after the last change before writing to DB,
    // so rapid typing doesn't trigger a database write on every keystroke
    let saveTimeout = null
    ydoc.on('update', () => {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(async () => {
        const state = Y.encodeStateAsUpdate(ydoc)
        await saveDocState(roomName, Buffer.from(state))
        console.log(`Saved state for room: ${roomName}`)
      }, 2000)
    })
  }
})

initDB().catch((err) => {
  console.error('Failed to initialize database:', err)
})

server.listen(port, () => {
  console.log(`InkSync WebSocket server running on port ${port}`)
})