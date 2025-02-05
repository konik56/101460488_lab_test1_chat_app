const socket = io("http://localhost:5055");
const username = localStorage.getItem("username");

if (!username) {
  alert("You must login first");
  window.location.href = "login.html";
}

document.getElementById("user-name").innerText = username;

let currentRoom = "";
let isSendingMessage = false;

$("#join-room").click(() => {
  const room = $("#room-select").val();
  if (room) {
    currentRoom = room;
    socket.emit("joinRoom", { username, room });

    $.get(`http://localhost:5055/api/chat/messages/${room}`, (messages) => {
      $("#chat-box").empty();

      messages.forEach((message) => {
        $("#chat-box").append(
          `<p><strong>${message.from_user}:</strong> ${message.message}</p>`
        );
      });
    });

    $("#room-interface").hide();
    $("#chat-interface").show();
    $("#chat-box").append(`<p><strong>System:</strong> Joined ${room}</p>`);
  }
});

$("#leave-room").click(() => {
  if (currentRoom) {
    socket.emit("leaveRoom", { username, room: currentRoom });
    $("#chat-box").append(
      `<p><strong>System:</strong> Left ${currentRoom}</p>`
    );
    currentRoom = "";

    $("#chat-interface").hide();
    $("#room-interface").show();
  }
});

$("#send-message").click(() => {
  const message = $("#message-input").val();
  if (message && currentRoom && !isSendingMessage) {
    isSendingMessage = true;

    socket.emit("chatMessage", {
      from_user: username,
      room: currentRoom,
      message,
    });

    $("#message-input").val("");

    setTimeout(() => {
      isSendingMessage = false;
    }, 1000);
  }
});

socket.on("message", (data) => {
  $("#chat-box").append(
    `<p><strong>${data.from_user}:</strong> ${data.message}</p>`
  );
});

$("#message-input").on("input", () => {
  if (currentRoom) {
    socket.emit("typing", { username, room: currentRoom });
  }
});

socket.on("userTyping", (data) => {
  if (data.room === currentRoom) {
    $("#typing-indicator").text(`${data.username} is typing...`);
    setTimeout(() => $("#typing-indicator").text(""), 2500);
  }
});

$("#logout").click(() => {
  localStorage.clear();
  window.location.href = "login.html";
});
