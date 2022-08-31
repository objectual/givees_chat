const dbConfig = require("../config/db.config.js");
// const { UsersModel } = require("./user.model");
// const { ChatModel } = require("./Chat.models");

// const { FriendsModel } = require("./friends.model");


const Sequelize = require("sequelize");
const sequelize = new Sequelize("givees_stage", "root", "givees123@2020", {
  host: "34.130.168.220",
  dialect: "mysql",
  operatorsAliases: false,
  //   dialectOptions: dbConfig.dialectOptions,
  pool: {
    max: 100,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
// db.users = UsersModel(sequelize, Sequelize);
// db.friends = FriendsModel(sequelize, Sequelize);



//db.chats = ChatModel(sequelize, Sequelize);

//Chats
// db.friends.hasMany(db.chats, { foreignKey: "Friendsid", as: "Friends" });
// db.chats.belongsTo(db.friends, { foreignKey: "Friendsid" , as: "Friends" });

// db.users.hasMany(db.chats, { foreignKey: "receiverId", as: "receiving" });
// db.chats.belongsTo(db.users, { foreignKey: "receiverId", as: "receiving"});

// db.users.hasMany(db.chats, { foreignKey: "senderId", as: "sending" });
// db.chats.belongsTo(db.users, { foreignKey: "senderId" , as: "sending" });



// FRIEND RELATE WITH USERS



// db.users.hasMany(db.friends, { foreignKey: "receiverId", as: "receiver" });
// db.friends.belongsTo(db.users, { foreignKey: "receiverId" });

// db.users.hasMany(db.friends, { foreignKey: "senderId", as: "sender" });
// db.friends.belongsTo(db.users, { foreignKey: "senderId" });



module.exports = db;
