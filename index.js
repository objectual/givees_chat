"use strict";
//const app = require('express')();
//const http = require('http').Server(app);

global.ROOTPATH = __dirname;

const express = require("express");

var moment = require("moment");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketioJwt   = require('socketio-jwt');
//const io = require('socket.io')(http);
const app = express();

const { connect_cache } = require("./cache/redis.service");
const handle = require("./Middleware/error");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
const { default_settings } = require("./user_default_settings");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use(express.json({ limit: "1000mb" }));

app.use(express.static(__dirname + "views"));
app.use(express.static("public"));

app.set("view engine", "ejs");




const socketio = require('socket.io');
const io = socketio(server);
const fs = require("fs");
var publicKEY = fs.readFileSync("config/cert/public.key", "utf8");
const { addUser, removeUser, getUser, getUsersInRoom, addChat, getChat, ChatFriendlist, UpdateReadMessages, LeaveRoom, SearchFriends } = require('./SocketIo/users');






io.use(socketioJwt.authorize({
      secret: publicKEY,
      handshake: true
    }));
 io.on('connection', async (socket) => {
  
  socket.on('userlist', async (pageno, pagesize ,callback) => {
  console.log("new data",pageno, pagesize);
  const { FriendListArr } = await ChatFriendlist(socket.decoded_token.id, pageno, pagesize);
  
  socket.emit("users", FriendListArr);
   
    callback();
  });
  

  socket.on('Searchuserlist', async (pageno , pagesize , name ,callback) => {
    console.log("Searchuser", name);
    const { FriendsArr } = await SearchFriends(socket.decoded_token.id, name, pageno, pagesize);
    
    socket.emit("Searchusers", FriendsArr);
     
      callback();
    });
  
   
  socket.on('join', async (data, callback) => {
    console.log("receiverid",data);

    
    const { error, user } = await addUser({ id: socket.decoded_token.id, data });
    
    
    if(error) return callback(error);
    console.log("hgdshd",user.roomid);
    socket.join(user.roomid);

    
    //Send Old messages in DB
    const { history } = await getChat(user.roomid);
    socket.emit('message', history[0]);
    
    //All message Read
    UpdateReadMessages(socket.decoded_token.id);
    
    socket.broadcast.to(user.roomid).emit('message',  {});

    io.to(user.roomid).emit('roomData', { room: user.roomid, users: getUsersInRoom(user.roomid) });
    
    callback();
  });

  

  socket.on('sendMessage', async (roomid, message,callback) => {
    console.log("eeeeeeeee",message, roomid);
  const user = await getUser(socket.decoded_token.id, roomid);
  
  if(!user){
    let error = "This user is not connected";
    return callback(error);
  }  
  const useravailable = await getUser(user.data, roomid);
  let read = 0; 
   if(!useravailable){
     read = 1;
   }
    let time = new Date();
    io.to(user.roomid).emit('message', { SenderId: socket.decoded_token.id, ReceiverId: user.data,Message: message, createdAt: time});
   
    addChat({senderid:socket.decoded_token.id, receiverid:user.data, roomid:user.roomid, message, Isread: read});
    
   
    callback();
  });

  
  socket.on('leave', async (roomid, callback) => {
    const user = LeaveRoom(socket.decoded_token.id,roomid);
    console.log("disconnected", user);
  callback();
  });

  socket.on('disconnect', () => {
    
    const user = removeUser(socket.decoded_token.id);
    
    
    // if(user) {
    //   io.to(user.roomid).emit('message', { user: 'Admin', text: `${user.name} has left.` });
    //   io.to(user.roomid).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    // }
  })

});

const db = require("./Model");
const { users } = require("./Model");
db.sequelize
  .sync({
    force: false, // To create table if exists , so make it false
  })
  .then(async () => {
    console.info(`✔️ Database Connected`);

    connect_cache()
      .then(() => {
        console.info("✔️ Redis Cache Connected");
        /**
         * Listen on provided port, on all network interfaces.
         */
        server.listen(PORT, async function () {
          console.log(PORT, "PORTPORTPORTPORT");
          console.info(`✔️ Server Started (listening on PORT : ${PORT})`);
          if (process.env.NODE_ENV) {
            console.info(`✔️ (${process.env.NODE_ENV}) ENV Loaded`);
          }
          console.info(`⌚`, moment().format("DD-MM-YYYY hh:mm:ss a"));
          default_settings()
            .then(() => {
              console.log(`✔️ Default Data Set`);
            })
            .catch((e) => {
              if (e) {
                console.error("❗️ Could not execute properly", e);
              }
              console.log(`✔️ Default Data Exists`);
            });
        });
      })
      .catch((err) => {
        console.error(`❌ Server Stopped (listening on PORT : ${PORT})`);
        console.info(`⌚ `, moment().format("DD-MM-YYYY hh:mm:ss a"));
        console.error("❗️ Could not connect to redis database...", err);
        process.exit();
      });
  })
  .catch((err) => {
    console.error(`❌ Server Stopped (listening on PORT : ${PORT})`);
    console.info(`⌚`, moment().format("DD-MM-YYYY hh:mm:ss a"));
    console.error("❗️ Could not connect to database...", err);
    process.exit();
  });

// check for expiry voucher and campaign at every 6th hour


app.use("/api", require("./Startup/api"));
app.use("/cache", require("./cache"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/", require("./Startup/web"));


app.use(handle);
require("./Startup/exceptions")();

app.use(express.static(path.join(__dirname, "public")));

module.exports = server;
