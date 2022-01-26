const db = require("../../Model");
const _ = require("lodash");

const fs = require("fs");
const jwt = require("jsonwebtoken");

const { validate } = require("../../Model/Chat.models");
const { Console } = require("console");
const Op = db.Sequelize.Op;
const Chats = db.chats;
const users = db.users;

const Friends = db.friends;





class chat {
  
    InserChat = async (req, res) => {
        try {
            
        const { error } = validate(req.body);
            if (error){
            return res
            .status(400)
            .send({ success: false, message: error.details[0].message });
            }
            
            // let _res2 = await Friends.findOne({
            //   where: {
            //     isPending: false,
            //     isFriend: true,
            //     [Op.or]: [
            //       {
            //         senderId: {
            //           [Op.eq]: req.body.SenderId,
            //         },
            //         receiverId: {
            //           [Op.eq]: req.body.ReceiverId,
            //         },
            //       },
            //       {
            //         senderId: {
            //           [Op.eq]: req.body.ReceiverId,
            //         },
            //         receiverId: {
            //           [Op.eq]: req.body.SenderId,
            //         },
            //       },
                  
            //     ],
            //   },
            // });
            
            // if (!(_res2)){
            // return res
            //   .status(404)
            //   .send({ success: false, message: "This Is Not Friend!" });
            // }
            const Chat = _.pick(req.body, ["Friendsid","SenderId","ReceiverId","Message","MessageTypeid","MessageLink"]);
            Console.log(Chat);
            // Chats.create(Chat)
            //   .then((data) => {
            //     res.send(data);
            //   })
            //   .catch((err) => {
            //     res.status(500).send({
            //       success: false,
            //       message:
            //         err.message || "Some error occurred while creating the Role.",
            //     });
            //   });

        } catch (error) {
          res.status(500).send({ success: false, message: error.message });
        }
      };

      GetChat = async (req, res) => {
        try {
          
          let _res2 = await Friends.findOne({
            where: {
              isPending: false,
              isFriend: true,
              [Op.or]: [
                {
                  senderId: {
                    [Op.eq]: req.body.sender,
                  },
                  receiverId: {
                    [Op.eq]: req.body.receiver,
                  },
                },
                {
                  senderId: {
                    [Op.eq]: req.body.receiver,
                  },
                  receiverId: {
                    [Op.eq]: req.body.sender,
                  },
                },
                
              ],
            },
          });
          console.log(_res2);
          if (!(_res2)){
          return res
            .status(404)
            .send({ success: false, message: "This Is Not Friend!" });
          }
          
          let Chatting = await Chats.findAll({
            include: [
              {
                model: users,
                as: "sending"
                
              },
              {
                model: users,
                as: "receiving"
                
              },
              ],
              where: {
                
               [Op.or]: [
                  {
                    senderId: {
                      [Op.eq]: req.body.sender,
                    },
                    receiverId: {
                      [Op.eq]: req.body.receiver,
                    },
                  },
                  {
                    senderId: {
                      [Op.eq]: req.body.receiver,
                    },
                    receiverId: {
                      [Op.eq]: req.body.sender,
                    },
                  },
                ],
              },
          });
          if (Chatting) {
            res.status(200).send({
              success: true,
              message: "",
              data: Chatting,
              
            });
          }
        } catch (error) {
          res.status(500).send({ success: false, message: error.message });
        }
      };

      GetFriendsChat = async (req, res) => {
        try {
          let friendArr = [];
          let Chatting = await Chats.findAll({
            attributes: ['id','Friendsid', 'SenderId','ReceiverId','Message','createdAt'],
            include: [
              {
                model: users,
                as: "sending",
                required: true,
                
              },
              {
                model: users,
                as: "receiving",
                required: true,
                
              },
              {
                model: Friends,
                as: "Friends",
                required: true,
                where: {
                  isPending: false,
                  isFriend: true,
                },

                
              },
              ],

              where: {
                    
                    [Op.or]: [
                      {
                        senderId: {
                          [Op.eq]: 3,
                        },
                       
                      },
                      {
                        
                        receiverId: {
                          [Op.eq]: 3,
                        },
                      },
                      
                    ],
                  },
              order: [
                ['id', 'DESC'],
            ],

            group:[ 'Friendsid'],
          });
          if(Chatting){
            console.log(Chatting)
            
            res.status(200).send({
              success: true,
              message: "",
              data: Chatting,
              
            });

          }
          else res.status(200).send({ success: true, message: 'Nodata' });
        } catch (error) {
          res.status(500).send({ success: false, message: error.message });
        }
      };

     

 
}
module.exports = chat;
