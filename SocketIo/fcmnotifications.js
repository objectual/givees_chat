const FCM = require('fcm-node');
const db = require("../Model/index");
const _ = require("lodash");
const request = require('request-promise');
const serverKey = 'AAAA5crgjXY:APA91bGt8GgdQUKS05URenjGVdW3j2L5nllRHm70B3EKpdoIxEa06T-wI7TlUbwtUOiYky7-b5CW3xU-50-ShkqhjkzouzHfRxyqoewpRjytJMJth0oHT7LquEF54bZw6qeptSA23Nz9'; //put your server key here
const fcm = new FCM(serverKey);
    

    const GetFCMToken = async (id) => {
        let fcmtoken = "";
        let username = "";
       let res = await db.sequelize.query(`SELECT userName, fcmtoken FROM users WHERE users.id = ${id}`);

       res[0].forEach((x) =>  {
            fcmtoken = x.fcmtoken;
            username = x.userName;
          });

        var messagepayload = { 
            to: fcmtoken, 
            
            
            notification: {
                title: "New Message", 
                body: `${username} Send a Message` 
            },
            
            
        };
        return { messagepayload };

      }

    
    
    module.exports ={ fcm , GetFCMToken};