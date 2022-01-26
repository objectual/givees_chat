"use strict";
var express = require("express");
var app = express();

// init Routing





app.use("/chat", require("../Router/chat.router"));

module.exports = app;
