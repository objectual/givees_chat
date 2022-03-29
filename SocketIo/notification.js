const db = require("../Model/index");
const _ = require("lodash");

const countNotificationNumer = async (id) => {
  let notifycount = 0;
  let countNotification = await db.sequelize.query(`SELECT COUNT(Notifications.NotificationId) as NewNotificationCount FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId left JOIN imagedata ON sender.id = imagedata.userId WHERE Notifications.receiverId = 4 && Notifications.IsCount = 1`);
   countNotification[0].forEach((x) =>  {
    notifycount = x.NewNotificationCount;
  });
   
  return { notifycount };
}


const GetNotifications = async (id, pageno, pagesize) => {
  console.log("Pagesize", pagesize, "pageno", pageno)
    let totalrecords = 0; 
    let pageNumber = pageno;
    let pageCount = pagesize;
    let end = (pageNumber * pageCount) ;
    let start = end - pageCount;
    
    
    let GetSearchChatUserlist = await db.sequelize.query(`SELECT Notifications.*, sender.userName AS SenderName, imagedata.imageId, imagedata.imageUrl, receiver.userName AS ReceiverNAME, NotificationRoutes.Route, products.name as ProductName FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId LEFT JOIN vouchergens ON Notifications.voucherId = vouchergens.id LEFT JOIN products ON vouchergens.productId = products.id left JOIN imagedata ON sender.id = imagedata.userId AND imagedata.imageType = "User" WHERE Notifications.receiverId = ${id} ORDER BY Notifications.NotificationId DESC LIMIT ${start}, ${pageCount};`);

   let countsearchuser = await db.sequelize.query(`SELECT COUNT(Notifications.NotificationId) as TotalRecords  FROM Notifications INNER JOIN users sender ON sender.id = Notifications.senderId INNER JOIN users receiver ON receiver.id = Notifications.receiverId INNER JOIN NotificationRoutes ON NotificationRoutes.RouteId = Notifications.RouteId left JOIN imagedata ON sender.id = imagedata.userId WHERE Notifications.receiverId = ${id}`);
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
 
const ReadNotifications = (id) => {
  
  let ReadNotification = db.sequelize.query(`UPDATE Notifications SET Notifications.IsReed = 1 WHERE Notifications.NotificationId = ${id}`);
  return { ReadNotification };
 }



module.exports = { GetNotifications, UpdateNotifications, GetNewNotification, countNotificationNumer, ReadNotifications };  