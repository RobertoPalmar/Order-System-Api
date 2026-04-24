import 'reflect-metadata';
import http from 'http';
import app from "./app";
import "src/database/connection";
import { separator } from '@global/logs';
import { initSocketServer } from '@realtime/socketServer';

const port = process.env.PORT;

//HTTP SERVER — wrapping Express so Socket.IO can share the same listen port
const server = http.createServer(app);

//REAL-TIME LAYER — must be attached before server.listen so the upgrade
//handler is in place when the first client connects.
initSocketServer(server);

server.listen(port, () => {
    console.clear(); // Clear the console
    console.log(separator);
    console.log(`🌐 Server is running at http://localhost:${port}`);
    console.log(`📡 Socket.IO listening on the same port`);
    console.log(separator);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("❌ Unhandled Rejection at:", promise, "reason:", reason);
  if (process.env.NODE_ENV === "production") process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception:", err);
  if (process.env.NODE_ENV === "production") process.exit(1);
});
