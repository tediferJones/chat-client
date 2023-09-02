// TO-DO
// Clean up varibale names
//    server => webSocket
//    In client.js
//    server => servername
//    Consider rename index.js to server.js
// Do we want to allow the user to be in multiple chats at once?
//    - i.e. merge two seperate chat feeds into one

const express = require('express');
const WebSocket = require('ws');

const webSocketPort = 8000
const websitePort = 3000

// Is it possible to create a server for each individual chat room?
// if we can pull this off, then we dont have to use the protocol string in this weird hacky way
// To do this:
//    create a /connect GET route (should act like an api route i.e. respond with JSON)
//    request 'body' should contain username and servername
//    create websocket and append to servers obj on request
//    response should contain port
//    on the client, use port from reponse to setup a new webSocket
const server = new WebSocket.Server({ port: webSocketPort })

// { servername: usersArray }
const servers = {};

server.on('connection', socket => {
  // console.log(server.clients)
  // console.log(socket.test)
  // console.log('CONNECTING')
  // console.log(socket.protocol)

  // Add user info to the servers obj
  const i = socket.protocol.indexOf('-');
  const servername = socket.protocol.slice(0, i);
  const username = socket.protocol.slice(i + 1);
  socket.username = username;
  console.log(username, servername)
  const currentServer = servers[servername];
  // ADD TO SERVERS OBJECT HERE
  if (currentServer) {
    for (let i = 0; i < currentServer.length; i++) {
      if (username === currentServer[i].username) {
        socket.close();
        return
      }
    }
    currentServer.push(socket)
  } else {
    servers[servername] = [socket];
  }
  // console.log('DIDNT RETURN')
  // servers[servername] = servers[servername] ? servers[servername].concat(socket) : servers[servername] = [socket]

  // Send messages to the right chatRooms
  socket.on('message', message => {
    // console.log(message);
    // socket.send(message)

    const data = JSON.parse(message.toString());
    servers[data.server].forEach(socket => {
      socket.send(message)
    })

    // Send message to all clients on this server
    // server.clients.forEach(clientSocket => {
    //   console.log(clientSocket.protocol)
    //   // clientSocket.send(message)
    //   if (clientSocket.protocol === socket.protocol) {
    //     clientSocket.send(message)
    //   }
    // })
  })
})

const app = express()
app.use(express.static('pages'))
app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/client.html')
  res.sendFile(__dirname + '/pages/client.html')
  // res.sendFile(__dirname + '/pages/home.html')
})
// app.get('/chat', (req, res) => {
//   // SEND SERVER AND USERNAME IN REQ BODY, then use that info on server to sort users into chatrooms
//   res.sendFile(__dirname + '/pages/client.html')
// })
// app.get('/connect', (req, res) => {
//   const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
//   console.log(params)
//   const username = params.get('username');
//   const server = params.get('server');
//   if (server in servers) {
//     servers[server].push(username)
//   } else {
//     servers[server] = [username]
//   }
// 
//   console.log(username, server)
//   res.json('this is a message from the connect route')
// })
app.listen(websitePort, () => {
  console.log(`Running on port ${websitePort}`)
})
