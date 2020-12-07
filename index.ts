import { Request, Response } from "express";
import { Socket } from "socket.io";

var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req: Request, res: Response) => {
  // res.sendFile(__dirname + "/index.html");
  res.sendStatus(200);
});

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  socket.on("event", (event) => {
    console.log("🚀 ~ file: index.ts ~ line 21 ~ socket.on ~ event", event);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
