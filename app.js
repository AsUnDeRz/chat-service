import express from "express";
import { Server } from "socket.io";
import http from "http";
import bodyParser from "body-parser";

import { onConnection } from "./socket/connection.js";
import { onMobileConnect } from "./socket/mobile_connect.js";
import { STATIC_CHANNELS, PROFILE_LIST } from "./constance/model.js";
import adminRoute from "./routes/admin.js";
import { networkInterfaces } from "os";

import { instrument } from "@socket.io/admin-ui";
const PORT = 3001;
const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.socket.io"],
    credentials: true,
  },
}); //in case server and client run on different urls

instrument(io, {
  auth: false,
});

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
app.use("/admin", adminRoute);

server.listen(PORT, (err) => {
  if (err) console.log(err);

  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  console.log("Server running on Port ", [results["en0"][0], PORT]);
});

io.on("connection", onMobileConnect);

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

app.post("/create-room", (req, res) => {
  let body = req.body;

  console.log(body);
  if (body) {
    let name = req.body.name;

    STATIC_CHANNELS.push({
      name: name,
      participants: 0,
      id: STATIC_CHANNELS.length + 1,
      sockets: [],
      messages: [],
    });
  }
  res.json({
    data: "success",
  });
});

export default app;
