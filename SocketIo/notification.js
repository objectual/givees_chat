const db = require("../Model/index");
const _ = require("lodash");

const countNotificationNumer = async (id) => {
  let countNotification = await db.sequelize.query(`SELECT COUNT(Notifications.NotificationId) as NewNotificationCount FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId left JOIN imagedata ON sender.id = imagedata.userId WHERE Notifications.receiverId = 4 && Notifications.IsAction = 1`);
   countNotification[0].forEach((x) =>  {
    totalrecords = x.NewNotificationCount;
  });
   
  return { countNotification };
}


const GetNotifications = async (id, pageno, pagesize) => {
  
    let totalrecords = 0; 
    let pageNumber = pageno;
    let pageCount = pagesize;
    let end = (pageNumber * pageCount) ;
    let start = end - pageCount;
    console.log("sagsfa",start, pageCount );
    
    let GetSearchChatUserlist = await db.sequelize.query(`SELECT  Notifications.*, sender.userName AS SenderName, imagedata.imageId, imagedata.imageUrl, receiver.userName AS ReceiverNAME, NotificationRoutes.Route  FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId left JOIN imagedata ON sender.id = imagedata.userId WHERE Notifications.receiverId = 4 ORDER BY Notifications.NotificationId DESC LIMIT ${start}, ${pageCount};`);




    //  if(GetSearchChatUserlist){
      
     
    //  }

     let countsearchuser = await db.sequelize.query(`SELECT COUNT(Notifications.NotificationId) as TotalRecords  FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId left JOIN imagedata ON sender.id = imagedata.userId WHERE Notifications.receiverId = 4`);
     countsearchuser[0].forEach((x) =>  {
      totalrecords = x.TotalRecords;
    });
     
     countuser = {
      page: parseInt(pageNumber),
      pages: Math.ceil(totalrecords / pageCount),
      totalRecords: totalrecords,
    };
    let NotificationArr = {
      searchuserlist: GetSearchChatUserlist[0],
      countsearchuserlist: countuser,
    }

  return { NotificationArr };
}

const UpdateNotifications = (id) => {
  
  
    db.sequelize.query(`UPDATE Notifications SET Notifications.IsCount = 0 WHERE Notifications.receiverId = ${id}`);
  }

  const GetNewNotification = async (id) => {
  
   
    
    let NewNotification = await db.sequelize.query(`SELECT  Notifications.*, sender.userName AS SenderName, imagedata.imageId, imagedata.imageUrl, receiver.userName AS ReceiverNAME, NotificationRoutes.Route  FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId left JOIN imagedata ON sender.id = imagedata.userId WHERE Notifications.NotificationId = ${id};`);

  return { NewNotification };
} 



module.exports = { GetNotifications, UpdateNotifications, GetNewNotification, countNotificationNumer };  