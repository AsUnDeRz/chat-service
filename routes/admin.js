import {
  createRoom,
  getRoomList,
  moveAllSocketJoinRoom,
  moveSocketByIdJoinRoomByName,
} from "../controllers/admin-controller.js";
import express from "express";
const adminRoute = express.Router();

adminRoute.post("/create-room", createRoom);
adminRoute.post("/join-room-all", moveAllSocketJoinRoom);
adminRoute.post("/join-room", moveSocketByIdJoinRoomByName);

adminRoute.get("/", getRoomList);

export default adminRoute;
