"use strict";
//const app = require('express')();
//const http = require('http').Server(app);

global.ROOTPATH = __dirname;

const express = require("express");

var moment = require("moment");
const cors = require("cors");
const http = require("http");
const path = require("path");
const socketioJwt = require("socketio-jwt");
//const io = require('socket.io')(http);
const app = express();

const { connect_cache } = require("./cache/redis.service");
const handle = require("./Middleware/error");
const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
// const { default_settings } = require("./user_default_settings");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(cors());

app.use("/uploads", express.static("uploads"));

app.use(express.json({ limit: "1000mb" }));

app.use(express.static(__dirname + "views"));
app.use(express.static("public"));

app.set("view engine", "ejs");

const socketio = require("socket.io");
const io = socketio(server);
const fs = require("fs");
var publicKEY = fs.readFileSync("config/cert/public.key", "utf8");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  addChat,
  getChat,
  ChatFriendlist,
  UpdateReadMessages,
  LeaveRoom,
  SearchFriends,
  UpdateDeleteMessages,
} = require("./SocketIo/users");

const {
  GetNotifications,
  UpdateNotifications,
  GetNewNotification,
  countNotificationNumer,
} = require("./SocketIo/notification");

const {
  fcm,
  GetFCMToken,
} = require("./SocketIo/fcmnotifications");




io.use(
  socketioJwt.authorize({
    secret: publicKEY,
    handshake: true,
  })
);
io.on("connection", async (socket) => {

  socket.on("NotificationCount", async ( callback) => {
    const { notifycount } = await countNotificationNumer(
      socket.decoded_token.id,
    );

    socket.emit("CountNotification", notifycount);
    
    callback();
  });
  
  
  socket.on("Notificationlist", async (pageno, pagesize, callback) => {
    const { NotificationArr } = await GetNotifications(
      socket.decoded_token.id,
      pageno,
      pagesize
    );

    socket.emit("Notifications", NotificationArr);
    //All NotificationCount Read
    UpdateNotifications(socket.decoded_token.id);
    callback();
  });

  socket.on("SendNotification", async (Notificationid, callback) => {
    const { NewNotification } = await GetNewNotification(Notificationid);

    socket.emit("NewNotification", NewNotification);
    
    
    callback();
  });


  socket.on("userlist", async (pageno, pagesize, callback) => {
    const { FriendListArr, error } = await ChatFriendlist(
      socket.decoded_token.id,
      pageno,
      pagesize
    );
    if(error){
      return callback(error);
    }

    socket.emit("users", FriendListArr);

    callback();
  });

  socket.on("Searchuserlist", async (pageno, pagesize, name, callback) => {
    const { FriendsArr } = await SearchFriends(
      socket.decoded_token.id,
      name,
      pageno,
      pagesize
    );

    socket.emit("Searchusers", FriendsArr);

    callback();
  });

  socket.on("join", async (data, callback) => {
    const { error, user } = await addUser({
      id: socket.decoded_token.id,
      data,
    });

    if (error) return callback(error);

    socket.join(user.roomid);

    //Send Old messages in DB
    const { history } = await getChat(user.roomid);
    socket.emit("message", history[0]);

    //All message Read
    UpdateReadMessages(socket.decoded_token.id);

    socket.broadcast.to(user.roomid).emit("message", {});

    io.to(user.roomid).emit("roomData", {
      room: user.roomid,
      users: getUsersInRoom(user.roomid),
    });

    callback();
  });

  socket.on("sendMessage", async (roomid, message, callback) => {
    const user = await getUser(socket.decoded_token.id, roomid);

    if (!user) {
      let error = "This user is not connected";
      return callback(error);
    }
    const useravailable = await getUser(user.data, roomid);
    let read = 0;
    if (!useravailable) {
      read = 1;
    }
    let time = new Date();
    const { messageid } = await addChat({
      senderid: socket.decoded_token.id,
      receiverid: user.data,
      roomid: user.roomid,
      message,
      Isread: read,
    });

    io.to(user.roomid).emit("message", {
      Messageid: messageid,
      SenderId: socket.decoded_token.id,
      ReceiverId: user.data,
      Message: message,
      createdAt: time,
    });

    

    if (!useravailable) {
      const { messagepayload } = await GetFCMToken(user.data);
       fcm.send(messagepayload, function(err, response){
           if (err) {
               console.log("Something has gone wrong!");
               console.log("error: ", err);
              
           } else {
               console.log("Successfully sent with response: ", response);
               
           }
       });
       
     }

    callback();
  });

  socket.on("DeleteMessage", async ( messageid, callback) => {
    console.log("eeeeeeeeeee",messageid)
     UpdateDeleteMessages(
      messageid
    );

    
    callback();
  });

  socket.on("leave", async (roomid, callback) => {
    const user = LeaveRoom(socket.decoded_token.id, roomid);

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.decoded_token.id);

    // if(user) {
    //   io.to(user.roomid).emit('message', { user: 'Admin', text: `${user.name} has left.` });
    //   io.to(user.roomid).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    // }
  });
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
          // default_settings()
          //   .then(() => {
          //     console.log(`✔️ Default Data Set`);
          //   })
          //   .catch((e) => {
          //     if (e) {
          //       console.error("❗️ Could not execute properly", e);
          //     }
          //     console.log(`✔️ Default Data Exists`);
          //   });
        });
      })
      .catch((err) => {
        console.error(`❌ Server Stopped (listening on PORT : ${PORT})`);
        console.info(`⌚ `, moment().format("DD-MM-YYYY hh:mm:ss a"));
        console.error("❗️ Could not connect to redis database...", err);
        process.exit();
      });
    /**
     * Normalize a port into a number, string, or false.
     */
    function normalizePort(val) {
      var port = parseInt(val, 10);
      if (isNaN(port)) {
        return val;
      }
      if (port >= 0) {
        return port;
      }
      return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    function terminate(server, options = { coredump: false, timeout: 500 }) {
      // Exit function
      const exit = (code) => {
        options.coredump ? process.abort() : process.exit(code);
      };

      return (code, reason) => (err, promise) => {
        if (err && err instanceof Error) {
          // Log error information, use a proper logging library here :)
          fs.appendFileSync("access.log", err.message);
          console.log(err.message, err.stack);
        }

        // Attempt a graceful shutdown
        // server.close(exit);
        // setTimeout(exit, options.timeout).unref();
      };
    }

    function exitHandler(options, exitCode) {
      terminate(server, {
        coredump: false,
        timeout: 500,
      });
      console.log("⚠️ Gracefully shutting down");
      server.close();
      process.exit();
    }

    process.on("uncaughtException", (err) => {
      fs.appendFile(
        "access.log",
        `Uncaught Exception: ${err.message}`,
        () => {}
      );
      console.log(`Uncaught Exception: ${err.message}`);
    });
    process.on("unhandledRejection", (reason, promise) => {
      fs.appendFile(
        "access.log",
        `Unhandled rejection, reason: ${reason}`,
        () => {}
      );
      console.log("Unhandled rejection at", promise, `reason: ${reason}`);
    });
    process.on("SIGINT", exitHandler.bind(null, { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
    process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
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
