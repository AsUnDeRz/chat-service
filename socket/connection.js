import { STATIC_CHANNELS, PROFILE_LIST } from "../constance/model.js";
import { io } from "../app.js";

export const onConnection = (socket) => {
  // socket object may be used to send specific messages to the new connected client
  console.log("new client connected");
  socket.emit("connection", null);
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
  socket.on("send-message", (message) => {
    console.log("send-message", message);

    let wrapMessage = {
      channel_id: message.channel_id,
      text: message.text,
      senderName: getProfileNameById(socket.id),
      senderId: socket.id,
      id: Date.now(),
      image: message.image,
    };

    let id = message.channel_id;
    STATIC_CHANNELS.forEach((c) => {
      if (c.id === id) {
        console.log("push message", wrapMessage);
        c.messages.push(wrapMessage);
      }
    });

    io.emit("message", wrapMessage);
  });

  socket.on("disconnect", () => {
    STATIC_CHANNELS.forEach((c) => {
      let index = c.sockets.indexOf(socket.id);
      if (index != -1) {
        c.sockets.splice(index, 1);
        c.participants--;
        io.emit("channel", c);
      }
    });
  });
};

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
