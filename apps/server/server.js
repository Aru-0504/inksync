const { WebSocketServer } = require('ws')
const http = require('http')
const { setupWSConnection } = require('y-websocket/bin/utils')

const port = process.env.PORT || 1234

const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('InkSync sync server is running')
})

const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req)
})

server.listen(port, () => {
  console.log(`InkSync WebSocket server running on port ${port}`)
})