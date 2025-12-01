const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", (event) => {
  socket.send("Hello Server!");
});

socket.addEventListener("message", (event) => {
  console.log(event.data);
});

socket.addEventListener("close", (event) => {
  console.log("Socket is closed.", event.reason);
});
