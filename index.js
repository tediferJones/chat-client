// Can we run the express app in a different port?  And then have the websocket and website run in the same app?
// If we dont need express, then uninstall it
const express = require('express');
const WebSocket = require('ws');

const port = 3000

const server = new WebSocket.Server({ port: port })

server.on('connection', socket => {
  console.log('hello? UPDATED')
  socket.on('message', message => {
    console.log(message);
    socket.send('MSG FROM SERVER')
  })
})

const app = express()
app.get('/', (req, res) => {
  res.send('hello world')
})
app.listen(8000, () => {
  console.log(`Running on port 8000`)
})
// app.listen(port, () => {
//   console.log(`Running on port ${port}`)
// })
