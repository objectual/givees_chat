const users = [];
const db = require("../Model/index");
const _ = require("lodash");



const addUser = async ({ id, data }) => {
  
  let res2 = await db.sequelize.query(`SELECT * FROM friends WHERE friends.isPending = 0 && friends.isFriend = 1 && (friends.senderId = ${id} && friends.receiverId = ${data}) OR (friends.receiverId = ${id} && friends.senderId = ${data});`);
  let roomid = 0;
  if(!res2) return { error: ' This is not a friend.' };
  
  res2[0].forEach((res) =>  {
    roomid = res.id;
  });
 
    const existingUser = await users.find((user) => user.roomid === roomid && user.id === id);
    
   
    if(!existingUser) {
    const user = { id, data, roomid };
    users.push(user);
    
    return  { user };
    }
    const user = { id, data, roomid };
    // console.log("C-U",users);
     return  { user };
    
  }

const LeaveRoom = (id,roomid) => {
  
  const index = users.findIndex((user) => user.id === id && user.roomid === roomid);

  if(index !== -1) return users.splice(index, 1)[0];
  //console.log("L-R",users)
}

const removeUser = (id) => {
  
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) return users.splice(index, 1)[0];
  //console.log("R-U",users)
}

const getUser = (id, roomid) => users.find((user) => user.id === id && user.roomid === roomid );
  
const getUsersInRoom = (roomid) => users.filter((user) => user.roomid === roomid);


const addChat = async ({senderid,receiverid,roomid,message,Isread}) => {
  let messageid = 0;
  
  let resaddchat = await db.sequelize.query(`INSERT INTO Chats (Chats.Friendsid, Chats.senderId, Chats.receiverId, Chats.Message, Chats.MessageTypeid, Chats.IsReed ) VALUES (${roomid},${senderid},${receiverid},"${message}",${roomid},${Isread})`);
  messageid = (resaddchat.id)
    return { messageid };
}

const getChat = async (roomid) => {
  
  
 let history = await db.sequelize.query(`SELECT id as Messageid, senderId AS SenderId , receiverId AS ReceiverId , Message, createdAt FROM Chats WHERE Chats.Friendsid = ${roomid} && Chats.SoftDelete = 0 ORDER BY Chats.id DESC`);
 
 return { history };
}

const ChatFriendlist = async (id, pageno, pagesize) => {
  let totalrecords = 0; 
  let Isactive = 0;
  let pageNumber = pageno;
  let pageCount = pagesize;
  let friendArr = [];
  let end = (pageNumber * pageCount) ;
  let start = end - pageCount;
   
  let ChatOption = await db.sequelize.query("SELECT AppSettings.IsActive FROM AppSettings WHERE AppSettings.Id = 1");
  ChatOption[0].forEach((x) =>  {
    Isactive = x.IsActive;
  });
  if(Isactive === 0)
  {
    return { error: ({error: "Chat Option Temporary Unavailable.", Statuscode: 503 }) };
  }
  
  let GetChatUserlist = await db.sequelize.query(`select Chats.Friendsid, Chats.senderId AS SenderId, Chats.receiverId AS ReceiverId, Chats.Message, Chats.IsReed, Chats.createdAt, sender.userName as Sendername, senderimage.imageId AS SenderImageId, senderimage.imageUrl AS SenderImageurl, receiver.userName AS receiverName, receiverimage.imageId AS ReceiverImageId, receiverimage.imageUrl AS ReceiverImageurl from Chats INNER JOIN friends on friends.id = Chats.Friendsid INNER JOIN users sender ON Chats.senderId = sender.id INNER JOIN users receiver ON Chats.receiverId = receiver.id LEFT JOIN imagedata senderimage ON sender.id = senderimage.userId LEFT JOIN imagedata receiverimage ON receiver.id = receiverimage.userId WHERE Chats.id IN ( SELECT MAX(Chats.id) FROM Chats GROUP BY Chats.Friendsid ) AND (Chats.senderId = ${id} OR Chats.receiverId = ${id}) AND friends.isPending = 0 AND friends.isFriend = 1 ORDER BY Chats.id DESC LIMIT ${start}, ${pageCount};`);
 
  
          if(GetChatUserlist){
            
            GetChatUserlist[0].forEach((res) =>  {
              if (res.SenderId === id) {
                friendArr.push({"Friendsid":res.Friendsid,"Userid":res.ReceiverId,"UserName":res.receiverName ,"UserImageid":res.ReceiverImageId,"UserImageurl":res.ReceiverImageurl, "lastmessage":res.Message,"lastmessagestatus":0,"lastmessagedatetime": res.createdAt});
              } else {
                friendArr.push({"Friendsid":res.Friendsid,"Userid":res.SenderId,"UserName":res.Sendername ,"UserImageid":res.SenderImageId,"UserImageurl":res.SenderImageurl, "lastmessage":res.Message,"lastmessagestatus":res.IsReed,"lastmessagedatetime": res.createdAt});
              }
            });
          }
          
          let TotalUserlist = await db.sequelize.query(`select COUNT(Chats.Friendsid) as TotalRecords from Chats INNER JOIN friends on friends.id = Chats.Friendsid INNER JOIN users sender ON Chats.senderId = sender.id INNER JOIN users receiver ON Chats.receiverId = receiver.id LEFT JOIN imagedata senderimage ON sender.id = senderimage.userId LEFT JOIN imagedata receiverimage ON receiver.id = receiverimage.userId WHERE Chats.id IN ( SELECT MAX(Chats.id) FROM Chats GROUP BY Chats.Friendsid ) AND (Chats.senderId = ${id} OR Chats.receiverId = ${id}) AND friends.isPending = 0 AND friends.isFriend = 1 ORDER BY Chats.id DESC;`);
          TotalUserlist[0].forEach((x) =>  {
            totalrecords = x.TotalRecords;
          });
          countuser = {
            page: parseInt(pageNumber),
            pages: Math.ceil(totalrecords / pageCount),
            totalRecords: totalrecords,
          };
          let FriendListArr = {
            userlist: friendArr,
            countuserlist: countuser,
          }
          
          return { FriendListArr };
 }

 const UpdateReadMessages = (id) => {
  
  
  db.sequelize.query(`UPDATE Chats SET Chats.IsReed = 0 WHERE Chats.receiverId = ${id}`);
}

const UpdateDeleteMessages = (messageid) => {
  
  messageid.map((x, i, arr) => {
  db.sequelize.query(`UPDATE Chats SET Chats.SoftDelete = 1 WHERE Chats.id = ${x}`);
});
}

const SearchFriends = async (id, name, pageno, pagesize) => {
  
        let totalrecords = 0; 
        let pageNumber = pageno;
        let pageCount = pagesize;
        let end = (pageNumber * pageCount) ;
        let start = end - pageCount;

        let searchfriend = [];
        let GetSearchChatUserlist = await db.sequelize.query(`SELECT friends.id, friends.senderId, sender.userName AS SenderName, friends.receiverId, receiver.userName AS ReceiverName FROM friends INNER JOIN users sender ON friends.senderId = sender.id INNER JOIN users receiver ON friends.receiverId = receiver.id WHERE friends.isPending = 0 AND friends.isFriend = 1 AND (friends.senderId = ${id} OR friends.receiverId = ${id}) AND (sender.userName LIKE '${name}%' OR receiver.userName LIKE '${name}%') GROUP BY friends.id LIMIT ${start}, ${pageCount};`);



 
         if(GetSearchChatUserlist){
          
          GetSearchChatUserlist[0].forEach((res) =>  {
             if (res.senderId === id) {
              searchfriend.push({"Friendsid":res.id,"Userid":res.receiverId,"UserName":res.ReceiverName });
             } else {
              searchfriend.push({"Friendsid":res.id,"Userid":res.senderId,"UserName":res.SenderName });
             }
           });
         }

         let countsearchuser = await db.sequelize.query(`SELECT COUNT(friends.id) as TotalRecords FROM friends INNER JOIN users sender ON friends.senderId = sender.id INNER JOIN users receiver ON friends.receiverId = receiver.id WHERE friends.isPending = 0 AND friends.isFriend = 1 AND (friends.senderId = ${id} OR friends.receiverId = ${id}) AND (sender.userName LIKE '${name}%' OR receiver.userName LIKE '${name}%') GROUP BY friends.id;`);
         countsearchuser[0].forEach((x) =>  {
          totalrecords = x.TotalRecords;
        });
         
         countuser = {
          page: parseInt(pageNumber),
          pages: Math.ceil(totalrecords / pageCount),
          totalRecords: totalrecords,
        };
        let FriendsArr = {
          searchuserlist: searchfriend,
          countsearchuserlist: countuser,
        }

      return { FriendsArr };
}


module.exports = { addUser, removeUser, getUser, getUsersInRoom, addChat, getChat, ChatFriendlist, UpdateReadMessages, LeaveRoom, SearchFriends, UpdateDeleteMessages};

