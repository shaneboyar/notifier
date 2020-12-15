import firebaseAdmin from "firebase-admin";
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";
import redis from "redis";

const serviceAccount = require("./.gcloud/serviceAccountKey.json");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

var app = express();
app.use(cors());
app.use(express.json());
const db = firebaseAdmin.firestore();
const redisClient = redis.createClient();

var httpServer = http.createServer(app);
var io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket: Socket) => {
  // Save the socket id to Redis so that all processes can access it.
  socket.on("ready", (event) => {
    redisClient.set(event.username, socket.id, function (err) {
      if (err) throw err;
    });
  });
});

app.post("/users", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await db.collection("users").doc(username).get();

  if (user.exists) {
    const userData = user.data()!;
    if (password === userData.password) {
      res.status(200).send({ id: userData.id });
    } else {
      res.sendStatus(403);
    }
  } else {
    const id = uuidv4();
    await db
      .collection("users")
      .doc(username)
      .set({ id, ...req.body });
    res.status(201).send({ id });
  }
});

app.post("/notifications/new", async (req: Request, res: Response) => {
  // const { platformId, recipientId, message } = req.body;
  const id = uuidv4();
  await db.collection("notifications").doc(id).set(req.body);
  res.status(201).send({ id });
});

httpServer.listen(3001, () => {
  console.log("listening on *:3001");
});
