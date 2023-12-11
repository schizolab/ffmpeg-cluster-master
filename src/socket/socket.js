import log4js from "../logging.js";
const logger = log4js.getLogger('socket')

import clientIdentities from './identity.js'

import { Server } from "socket.io"
import handleProgress from "./handler/progress.js";
import handleName from "./handler/name.js";


export function attachSocket(server) {
    const io = new Server(server, {
        pingTimeout: process.env.PING_TIMEOUT || 1000
    });

    io.on('connection', (socket) => {
        logger.info(`${socket.id} connected from ${socket.handshake.address}`)

        // handle name
        handleName(socket)

        // handle progress
        handleProgress(socket)

        // handle disconnect
        socket.on('disconnect', (reason) => {
            // remove the name from identities
            clientIdentities.delete(socket.id)

            // report to the tasking that this client is dead

        })
    })
}