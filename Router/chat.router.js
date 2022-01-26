const ChatController = require("../Controller/Chat/Chat.controller.js");
let  Chat = new ChatController();
const fileUpload = require("../Controller/extras/Savemultiplefiles.js");
const upload = fileUpload.array('docs',12);
var router = require("express").Router();
router.post("/InsrtChat", upload,  Chat.InserChat);
router.post("/GetChat", Chat.GetChat);

module.exports = router;