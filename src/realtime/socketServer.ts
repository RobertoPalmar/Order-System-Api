import http from "http";
import { Server, Socket } from "socket.io";
import TokenUtils, { TOKEN_TYPE_BUSINESS_ACCESS } from "@utils/token.utils";

// ----------------------------------------------------------------------------
// SOCKET SERVER SINGLETON
// ----------------------------------------------------------------------------
// `io` is module-scoped so the emitters in orderEvents.ts can read it via
// getIo(). When the server has not been initialized (e.g. unit tests that
// import a controller without booting the HTTP server) getIo() returns
// `undefined` and the emitters no-op gracefully.
// ----------------------------------------------------------------------------

let io: Server | undefined;

// MongoID regex used to validate `subscribe:area` payloads from the client —
// prevents joining arbitrary rooms and avoids room-name pollution.
const MONGO_ID_REGEX = /^[a-f0-9]{24}$/i;

/**
 * Attach a Socket.IO server to the provided HTTP server and register the
 * auth + connection handlers. Must be called once at boot, after
 * `http.createServer(app)` but before `server.listen(...)`.
 *
 * Authentication:
 *   Clients pass the BUSINESS access token either via the handshake `auth`
 *   object (recommended — `io({ auth: { token } })`) or in the
 *   `Authorization: Bearer <token>` header. The middleware verifies JWT
 *   signature + expiry, rejects any token whose `type` is not
 *   `business-access`, and stashes `{ userID, role, businessUnitID }` on
 *   `socket.data` for downstream use.
 *
 * Rooms:
 *   On connection the socket auto-joins:
 *     - `bu:<businessUnitID>`                       (tenant-wide)
 *     - `bu:<businessUnitID>:user:<userID>`         (personal channel)
 *   Area subscriptions are opt-in — the kitchen UI calls
 *     socket.emit("subscribe:area", "<areaID>")
 *   to receive events for a production area, and
 *     socket.emit("unsubscribe:area", "<areaID>")
 *   to drop that subscription. A single user may subscribe to several
 *   areas concurrently.
 */
export function initSocketServer(httpServer: http.Server): Server {
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        // Mobile / native apps typically do not send an Origin header.
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin not allowed: ${origin}`));
      },
      credentials: true,
    },
  });

  //AUTH MIDDLEWARE — runs once per handshake
  io.use((socket, next) => {
    try {
      const authToken =
        (socket.handshake.auth as { token?: string } | undefined)?.token ??
        socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

      if (!authToken) return next(new Error("Missing token"));

      // The project exposes a single JWT verifier (`verifyToken`) and
      // distinguishes token shapes by inspecting the decoded `type` claim
      // (see auth.middleware.ts for the HTTP-side equivalent).
      const { decoded, expired } = TokenUtils.verifyToken(authToken);
      if (expired) return next(new Error("Expired token"));
      if (decoded == null) return next(new Error("Invalid token"));

      const payload = decoded as {
        type?: string;
        userID?: string;
        role?: number;
        businessUnitID?: string;
      };

      if (payload.type !== TOKEN_TYPE_BUSINESS_ACCESS) {
        return next(new Error("Invalid token type (business-access required)"));
      }
      if (!payload.userID || !payload.businessUnitID) {
        return next(new Error("Invalid business token payload"));
      }

      socket.data.userID = payload.userID;
      socket.data.role = payload.role;
      socket.data.businessUnitID = payload.businessUnitID;
      return next();
    } catch (err) {
      return next(new Error("Auth failed"));
    }
  });

  //CONNECTION HANDLER
  io.on("connection", (socket: Socket) => {
    const { businessUnitID, userID } = socket.data as {
      businessUnitID: string;
      userID: string;
    };

    //AUTO-JOIN TENANT + PERSONAL ROOMS
    socket.join(`bu:${businessUnitID}`);
    socket.join(`bu:${businessUnitID}:user:${userID}`);

    //OPT-IN PRODUCTION AREA SUBSCRIPTIONS
    socket.on("subscribe:area", (areaID: unknown) => {
      if (typeof areaID !== "string" || !MONGO_ID_REGEX.test(areaID)) return;
      socket.join(`bu:${businessUnitID}:area:${areaID}`);
    });
    socket.on("unsubscribe:area", (areaID: unknown) => {
      if (typeof areaID !== "string" || !MONGO_ID_REGEX.test(areaID)) return;
      socket.leave(`bu:${businessUnitID}:area:${areaID}`);
    });

    socket.on("disconnect", () => {
      // Socket.IO cleans up room memberships automatically on disconnect —
      // nothing to do here. Hook left in place for future instrumentation.
    });
  });

  return io;
}

/**
 * Return the singleton Socket.IO server, or `undefined` when it has not
 * been initialized yet. Callers (e.g. orderEvents emitters) must handle
 * the undefined case to stay safe during tests and early boot.
 */
export function getIo(): Server | undefined {
  return io;
}
