const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const fs = require("fs");
var publicKEY = fs.readFileSync("config/cert/public.key", "utf8");
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);


// io.use(socketioJwt.authorize({
//       secret: publicKEY,
//       handshake: true
//     }));
io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log(error);
    console.log(user);
    
    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});

