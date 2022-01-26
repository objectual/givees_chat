const Joi = require("joi");
const db = require("./index");

function ChatModel(sequelize, Sequelize) {
  const Chatschema = {
    
    Friendsid: {
      type: Sequelize.INTEGER,
      references: {
        model: "friends",
        key: "id",
      },
      
    },
    
    SenderId: {
        type: Sequelize.INTEGER,
       
        references: {
          model: "users",
          key: "id",
        },
        
      },
      ReceiverId: {
        type: Sequelize.INTEGER,
        
        references: {
          model: "users",
          key: "id",
        },
      },
      Message: {
      type: Sequelize.STRING,
    },
    MessageTypeid: {
        type: Sequelize.INTEGER,
        
      },
   
    MessageLink: {
      type: Sequelize.STRING,
    },
    
    SoftDelete: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    IsReed: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
    
  };

  let Chat = sequelize.define("Chat", Chatschema);

  return Chat;
}

exports.ChatModel = ChatModel;

function validate(Chat) {
  const schema = {
    Friendsid: Joi.number().required().max(255),
    SenderId: Joi.number().required().max(255),
    ReceiverId: Joi.number().required().max(255),
    Message: Joi.string().required().max(255),
    MessageTypeid: Joi.number().required().max(255),
    MessageLink: Joi.string().required().max(255),
    SoftDelete: Joi.bool(),
    IsReed: Joi.bool(),
    
  };
  return Joi.validate(Chat, schema);
}

exports.validate = validate;
