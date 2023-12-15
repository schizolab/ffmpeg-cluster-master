import log4js from "../logging.js";
const logger = log4js.getLogger('socket')

import { Server } from "socket.io"
import handleProgress from "./handler/progress.js";

export function attachSocket(server) {
    const io = new Server(server, {
        pingTimeout: process.env.PING_TIMEOUT || 1000
    });

    io.on('connection', (socket) => {
        logger.info(`${socket.id} connected from ${socket.handshake.address}`)

        // handle progress
        handleProgress(socket)

        // handle disconnect
        socket.on('disconnect', (reason) => {
            // report to the tasking that this client is dead
            logger.info(`${socket.id} disconnected from ${socket.handshake.address} because ${reason}`)
        })
    })
}