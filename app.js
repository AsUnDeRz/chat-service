// const express = require("express");
// const socketIo = require("socket.io");
// const http = require("http");
// const bodyParser = require("body-parser");
import express from "express";
import { Server } from "socket.io";
import http from "http";
import bodyParser from "body-parser";

import { onConnection } from "./socket/connection.js";
import { STATIC_CHANNELS, PROFILE_LIST } from "./constance/model.js";

const PORT = 3001;
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
}); //in case server and client run on different urls
// io.on("connection", (socket) => {
//   console.log("client connected: ", socket.id);

//   socket.join("clock-room");

//   socket.on("disconnect", (reason) => {
//     console.log(reason);
//   });
// });

// setInterval(() => {
//   io.to("clock-room").emit("time", new Date().toString());
// }, 1000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

server.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", PORT);
});

io.on("connection", onConnection);

app.get("/", (req, res) => {
  io.to("clock-room").emit("receive", "Send broadcast from server");
  res.send("broadcast");
});

app.get("/getChannels", (req, res) => {
  res.json({
    channels: STATIC_CHANNELS,
  });
});

app.post("/profile", (req, res) => {
  let body = req.body;

  console.log(body);
  if (body) {
    let id = req.body.id;
    let name = req.body.name;
    let profile = PROFILE_LIST.find((c) => {
      return c.id === id;
    });
    if (profile) {
      PROFILE_LIST.forEach((c) => {
        if (c.id === id) {
          c.name = name;
        }
      });
    } else {
      PROFILE_LIST.push({
        name: name,
        id: id,
      });
    }
  }
  res.json({
    data: "success",
  });
});

app.get("/profile", (req, res) => {
  res.json({
    profiles: PROFILE_LIST,
  });
});

export default app;
