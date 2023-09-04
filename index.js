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
// Do we even need express?  Node should have its own http lib, use that instead of express
//    - We literally just need to send a single HTML file and its JS to the user
// Try to remove all global variables from client.js, then the user cant manually change them?
//    - Removed username and servername, websocket still exists but changing its props doesnt affect server so we're good?
//    - the socket var could be deleted now that we can manually close the socket
// Client side validation doesnt seem to be working, maybe change from onClick event to onSubmit

// [ DONE ] IF YOU WANT TO GET RID OF WEIRD PROTOCOL MANIPULATION
// [ DONE ] USE THE WEBSOCKET TO COMMUNICATE USERNAME/SERVERNAME
// [ DONE ] from the client js, send this obj { username, servername }
// [ DONE ] then send a response to that specific client as to weather or not they are valid
// [ DONE ] If they are valid, THEN append event listener that will append new messages to the user
//
// [ DONE ] NEW STRATEGY FOR VERIFY CONNECTIONS
// [ DONE ] User sends username and password in url params on connection
// [ DONE ] Verify username is valid, and if so, add socket to server
//
// DONE: user connects and is verified via websocket url params, no more sending server/username from client to server

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
  // console.log(new URLSearchParams(req.url))
  // const searchParams = new URLSearchParams(req.url);
  const params = new URLSearchParams(req.url.slice(req.url.indexOf('?')))
  const username = params.get('username');
  const servername = params.get('server');
  socket.username = username;
  socket.servername = servername;
  console.log(username, servername)
  const currentServer = servers[servername];

  // ADD TO SERVERS OBJECT HERE
  // THIS SHOULD LITERALLY BE THE LAST THING WE DO
  if (currentServer) {
    for (let i = 0; i < currentServer.length; i++) {
      if (username === currentServer[i].username) {
        socket.send('Username is already taken, please join a different chatroom or change your username')
        socket.close();
        return
      }
    }
    currentServer.push(socket)
  } else {
    servers[servername] = [socket];
  }

  // When socket closes, remove socket from servers obj 
  // (this will free the username for future connections)
  // This only applies to sockets that have passed username checking, 
  // if your username is a duplicate you wont get added to servers obj anyways
  socket.on('close', () => {
    for (let i = 0; i < servers[servername].length; i++) {
      if (servers[servername][i].username === username) {
        servers[servername].splice(i, 1);
        break;
      }
    }
  })

  // Send messages to the right chatRooms
  socket.on('message', message => {
    const newMessage = message.toString();
    console.log(newMessage)
    const username = socket.username;
    const servername = socket.servername;
    servers[servername].forEach(socket => {
      socket.send(`${username}: ${newMessage}`)
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
// function usernameIsValid(sockets, username) {
//   if (sockets === undefined) return true
//   for (let i = 0; i < sockets.length; i++) {
//     if (username === sockets[i].username) {
//       return false;
//     }
//   }
//   return true;
// }
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
