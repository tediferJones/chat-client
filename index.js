// Can we run the express app in a different port?  And then have the websocket and website run in the same app?
// If we dont need express, then uninstall it
const express = require('express');
const WebSocket = require('ws');

const port = 3000

// Create home.html
// Should allow user to choose a chatroom (i.e. port number !== 3000) and username
// Server should make sure username is not already in use in the current chatroom
//  - Add a users attr to the server, and run server.users.includes(username)
const server = new WebSocket.Server({ port: port })

server.on('connection', socket => {
  // console.log('hello? UPDATED')
  // console.log(server.clients)
  // console.log(socket.id)
  socket.on('message', message => {
    // console.log(message);
    // socket.send(message)

    // Send message to all clients on this server
    server.clients.forEach(clientSocket => {
      clientSocket.send(message)
    })
  })
})

const app = express()
app.use(express.static('pages'))
app.get('/', (req, res) => {
  // res.send('hello world')
  // res.sendFile(__dirname + '/client.html')
  // console.log(__dirname)
  res.sendFile(__dirname + '/pages/client.html')
})
app.listen(8000, () => {
  console.log(`Running on port 8000`)
})
// app.listen(port, () => {
//   console.log(`Running on port ${port}`)
// })
