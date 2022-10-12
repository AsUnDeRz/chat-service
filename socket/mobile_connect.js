import { STATIC_CHANNELS, PROFILE_LIST } from "../constance/model.js";
import { io } from "../app.js";

export const onMobileConnect = (socket) => {
  // socket object may be used to send specific messages to the new connected client
  console.log("new client connected");
  socket.emit(connection, null);
  socket.on(disconnect, () => {});
  socket.on("channel-join", (id) => {
    console.log("channel join", id);
    STATIC_CHANNELS.forEach((c) => {
      if (c.id === id) {
        if (c.sockets.indexOf(socket.id) == -1) {
          c.sockets.push(socket.id);
          c.participants++;
          io.emit("channel", c);

          io.emit("message", {
            channel_id: id,
            text: "ยินดีต้อนรับ" + getProfileNameById(socket.id),
            senderName: "System",
            id: Date.now(),
          });
        }
      } else {
        let index = c.sockets.indexOf(socket.id);
        if (index != -1) {
          c.sockets.splice(index, 1);
          c.participants--;
          io.emit("channel", c);
        }
      }
    });

    return id;
  });
  socket.on(sendMessage, (message) => {
    console.log("send_message", message);

    let lastJoin = getSocketLastJoinRoom(socket.id);

    if (lastJoin) {
      let room = getChatRoomById(lastJoin.roomId);
      const model = JSON.parse(message);

      let wrapMessage = {
        roomId: lastJoin.roomId,
        text: model.text,
        senderId: socket.id,
        date: Date.now(),
      };

      if (room) {
        console.log("push message", wrapMessage);
        room.message.push(wrapMessage);
      }

      io.emit("receive", wrapMessage);
    }
  });

  socket.on(customMessage, (message) => {
    console.log("custom_message", message);

    let lastJoin = getSocketLastJoinRoom(socket.id);
    if (lastJoin) {
      let room = getChatRoomById(lastJoin.roomId);
      const model = JSON.parse(message);

      let wrapMessage = {
        roomId: lastJoin.roomId,
        text: model.text,
        senderId: socket.id,
        date: Date.now(),
        data: model.data,
      };

      if (room) {
        console.log("push message", wrapMessage);
        room.message.push(wrapMessage);
      }

      io.emit("receive", wrapMessage);
    }
  });

  socket.on(join, (data) => {
    console.log("client  " + socket.id + "  join room  " + data);

    let room = getChatRoomById(data);
    let lastJoin = getSocketLastJoinRoom(socket.id);
    if (room) {
    } else {
      chatRoomList.push({ id: data, message: [] });
    }
    if (lastJoin) {
    } else {
      profileConnect.push({ socketId: socket.id, roomId: data });
    }
    socket.join(data);
    console.log("update profile connect", profileConnect);
    console.log("update char room list", chatRoomList);
  });

  socket.on(createRoom, (data) => {
    console.log("host  " + socket.id + "  create room  " + data);
    const model = JSON.parse(data);

    let room = getChatRoomById(model.room);
    let lastJoin = getSocketLastJoinRoom(socket.id);
    if (room) {
    } else {
      chatRoomList.push({ id: model.room, message: [] });
    }
    if (lastJoin) {
    } else {
      profileConnect.push({ socketId: socket.id, roomId: model.room });
    }
    socket.join(model.room);
    console.log("client  " + socket.id + "  join room  " + data);
    console.log("update profile connect", profileConnect);
    console.log("update char room list", chatRoomList);
  });

  socket.on(destryoRoom, (data) => {
    const model = JSON.parse(data);

    socket.join(model.room);
    socket.broadcast.to(model.room).emit(roomDestroy);
    io.socketsLeave(model.room);
    console.log("update char room list", chatRoomList);
  });

  socket.on(joinRoom, (data) => {
    console.log("client  " + socket.id + "  join room  " + data);
    const model = JSON.parse(data);

    let room = getChatRoomById(model.room);
    let lastJoin = getSocketLastJoinRoom(socket.id);
    if (room) {
    } else {
      chatRoomList.push({ id: model.room, message: [] });
    }
    if (lastJoin) {
    } else {
      profileConnect.push({ socketId: socket.id, roomId: model.room });
    }
    socket.join(model.room);
    io.to(model.room).emit(onUserJoined, { sender: model.sender });
    console.log("update profile connect", profileConnect);
    console.log("update char room list", chatRoomList);
  });

  socket.on(leaveRoom, (data) => {
    console.log("client  " + socket.id + "  leave room  " + data);
    const model = JSON.parse(data);
    io.to(model.room).emit(onUserLeaved, { sender: model.sender });
  });

  socket.on(sendRoomMessage, (data) => {
    try {
      const model = JSON.parse(data);
      console.log("client  " + socket.id + "  send room message  " + data);

      socket.join(model.room);
      socket.broadcast.to(model.room).emit(receiveRoomMessage, {
        message: model.message,
        sender: model.sender,
        room: model.room,
      });

      // io.to(model.room).emit(receiveRoomMessage, {
      //   message: model.message,
      //   sender: model.sender,
      //   room: model.room,
      // });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(sendCustomMessage, (data) => {
    try {
      console.log(
        "client  " + socket.id + "  send custom room message  " + data
      );
      const model = JSON.parse(data);
      // socket.join(model.room);

      socket.join(model.room);
      socket.broadcast.to(model.room).emit(receiveRoomCustomMessage, {
        message: model.message,
        command: model.command,
        sender: model.sender,
        room: model.room,
      });

      // io.to(model.room).emit(receiveRoomCustomMessage, {
      //   message: model.message,
      //   command: model.command,
      //   sender: model.sender,
      //   room: model.room,
      // });
    } catch (error) {
      console.log(error);
    }
  });

  //Handle calling service
  socket.on(joinCallRoom, (data) => {
    console.log("client  " + socket.id + "  join call room  " + data);
    const model = JSON.parse(data);

    let room = getChatRoomById(model.room);
    let lastJoin = getProfileById(model.userId);
    if (room) {
    } else {
      chatRoomList.push({ id: model.room, message: [] });
    }
    if (lastJoin) {
    } else {
      profileConnect.push({
        socketId: socket.id,
        roomId: model.room,
        userId: model.userId,
      });
    }
    socket.join(model.room);
    console.log("update profile connect", profileConnect);
    console.log("update char room list", chatRoomList);
  });

  socket.on(leaveCallRoom, (data) => {
    console.log("client  " + socket.id + "  leave call room  " + data);
    const model = JSON.parse(data);

    socket.join(model.roomId);
    io.to(model.roomId).emit(onRoomClose, { sender: model.sender });
  });

  socket.on(invite, (data) => {
    console.log("client  " + socket.id + "  user call invite " + data);
    const model = JSON.parse(data);

    let userInvitee = getProfileById(model.invitee);

    if (userInvitee) {
      // String data = mapData['data'] ?? '';
      // String inviteID = mapData['inviteID'] ?? '';
      // String inviter = mapData['inviter'] ?? '';
      // String groupID = mapData['groupID'] ?? '';
      // List<String> inviteeList = mapData['inviteeList'] ?? [];
      io.in(userInvitee.socketId).emit(receiveInvite, {
        data: model.data,
        inviteID: 1,
        inviter: 10,
      });
      console.log(
        "user action receive invite  " +
          userInvitee.userId +
          "  with data " +
          data
      );
    }

    // "invitee": userId,
    //   "data": jsonEncode(map),
    //   "timeout": timeOutCount,
    //   "onlineUserOnly": false
  });

  socket.on(accept, (data) => {
    console.log("client  " + socket.id + "  accept invite  " + data);
    const model = JSON.parse(data);
  });

  socket.on(reject, (data) => {
    console.log("client  " + socket.id + "  reject invite  " + data);
    const model = JSON.parse(data);

    socket.join(model.roomId);
    io.to(model.roomId).emit(onRoomClose, { sender: model.sender });
  });
};

//Event connection
const connection = "connection";
const disconnect = "disconnect";

//Event for chat 1-1
//Listener
const join = "join"; // receive channel client want join
const sendMessage = "send_message";
const customMessage = "custom_message";

//Action
const channel = "channel"; // push channel info when user join
const message = "message"; // push object message to client

//Event for Room
const createRoom = "create_room";
const destryoRoom = "destroy_room";
const joinRoom = "join_room";
const leaveRoom = "leave_room";
const sendRoomMessage = "send_room_message";
const sendCustomMessage = "send_custom_message";

const receiveRoomMessage = "receive_room_message";
const receiveRoomCustomMessage = "receive_room_custom_message";

//Action in Room
const roomDestroy = "room_destroy";
const kickedOffline = "kicked_offline";
const onUserJoined = "on_user_joined";
const onUserLeaved = "on_user_leaved";

//Event calling
const receiveInvite = "receive_invite";
const inviteTimeout = "invite_timeout";
const inviteCancel = "invite_cancel";
const inviteAccept = "invite_accept";
const inviteReject = "invite_reject";

//Action in calling
const invite = "invite";
const accept = "accept";
const reject = "reject";
const joinCallRoom = "join_call_room";
const leaveCallRoom = "leave_call_room";
const onRoomClose = "room_close";

var chatRoomList = [];
var profileConnect = [];

function getChatRoomById(id) {
  let room = chatRoomList.find((c) => {
    return c.id === id;
  });
  return room;
}

function getSocketLastJoinRoom(id) {
  let connected = profileConnect.find((c) => {
    return c.socketId === id;
  });
  return connected;
}

function getProfileById(id) {
  let connected = profileConnect.find((c) => {
    return c.userId === id;
  });
  return connected;
}

function getProfileNameById(id) {
  let profile = PROFILE_LIST.find((c) => {
    return c.id === id;
  });
  if (profile) {
    return profile.name;
  } else {
    return "uname";
  }
}
