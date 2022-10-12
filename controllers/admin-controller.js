import { io } from "../app.js";

export const createRoom = async (req, res, next) => {
  try {
    return res.json({ msg: "Create room successfully." });
  } catch (ex) {
    next(ex);
  }
};

export const getRoomList = async (req, res, next) => {
  try {
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
      console.log("socjet id ", socket.id);
      console.log("socket join room ", socket.rooms);
    }

    return res.json({ data: sockets.toString() });
  } catch (ex) {
    next(ex);
  }
};

export const moveAllSocketJoinRoom = async (req, res, next) => {
  try {
    let roomName = req.body.name;
    if (roomName) {
      io.socketsJoin(roomName);
    }

    return res.json({ message: "success" });
  } catch (ex) {
    next(ex);
  }
};

export const moveSocketByIdJoinRoomByName = async (req, res, next) => {
  try {
    let id = req.body.id;
    let roomName = req.body.name;
    if (roomName && id) {
      io.in(id).socketsJoin(roomName);
    }

    return res.json({ message: "success" });
  } catch (ex) {
    next(ex);
  }
};
