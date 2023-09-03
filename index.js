// TO-DO
// Clean up varibale names
//    server => webSocket
//    In client.js
//    server => servername
//    Consider rename index.js to server.js
// Do we want to allow the user to be in multiple chats at once?
//    - i.e. merge two seperate chat feeds into one
// Can we create a webSocket for each chatRoom?
//    - Some ports may be blocked so maybe not a good idea
//    - Cant send a checker request from client then act on that result
//      - AS LONG AS we dont add the socket to servers[servername], their messages wont be sent to other users
//      - user could just change the JS and force a return of true
//    - So since we cant choose any port, and this bypasses username checking, it seems like a bad idea
// IF YOU WANT TO GET RID OF WEIRD PROTOCOL MANIPULATION
// USE THE WEBSOCKET TO COMMUNICATE USERNAME/SERVERNAME
// from the client js, send this obj { username, servername }
// then send a response to that specific client as to weather or not they are valid
// If they are valid, THEN append event listener that will append new messages to the user

// NEW STRATEGY FOR VERIFY CONNECTIONS
// User sends username and password in url params on connection
// Verify username is valid, and if so, add socket to server
//
// Try to remove all global variables from client.js, then the user cant manually change them?

const express = require('express');
const WebSocket = require('ws');

const webSocketPort = 8000 // Might need to use 443 in production
const websitePort = 3000

const server = new WebSocket.Server({ port: webSocketPort })

// { servername: usersArray }
const servers = {};

server.on('connection', (socket, req) => {
  // Add user info to the servers obj
  // console.log(socket)
  console.log(new URLSearchParams(req.url))
  // const searchParams = new URLSearchParams(req.url);
  const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
  const username = params.get('username');
  const servername = params.get('server');
  // const i = socket.protocol.indexOf('-');
  // const servername = socket.protocol.slice(0, i);
  // const username = socket.protocol.slice(i + 1);
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
  // idk = JSON.stringify({ test: 'validationTest' })
  // socket.send(new Blob([idk], {
  //   type: "text/plain"
  // }))

  // Send messages to the right chatRooms
  socket.on('message', message => {
    const data = JSON.parse(message.toString());
    servers[data.server].forEach(socket => {
      socket.send(message)
    })
  })
})

const app = express()
app.use(express.static('pages'))
app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/client.html')
  res.sendFile(__dirname + '/pages/client.html')
  // res.sendFile(__dirname + '/pages/home.html')
})
function usernameIsValid(sockets, username) {
  if (sockets === undefined) return true
  for (let i = 0; i < sockets.length; i++) {
    if (username === sockets[i].username) {
      return false;
    }
  }
  return true;
}
// app.get('/connect', (req, res) => {
//   const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
//   console.log(params)
//   const username = params.get('username');
//   const server = params.get('server');
//   const currentServer = servers[server]
//   let connected = false;
//   console.log(currentServer)
//   console.log(usernameIsValid(currentServer, username))
//   if (usernameIsValid(currentServer, username)) {
//     connected = true;
//     // if (currentServer) {
//     //   currentServer.push(socket)
//     // } else {
//     //   servers[server] = [socket];
//     // }
//   }
//   // res.json('this is a message from the connect route')
//   res.json({
//     connected
//   })
// })
app.listen(websitePort, () => {
  console.log(`Running on port ${websitePort}`)
})
