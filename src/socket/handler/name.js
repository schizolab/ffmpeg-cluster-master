import log4js from "../../logging.js";
import clientIdentities from '../identity.js'

const logger = log4js.getLogger('socket')

export default function handleProgress(socket) {
    socket.on('set name', (name) => {
        logger.trace(`set name: ${socket.id} reported name of ${name}`)

        clientIdentities.set(socket.id, name)
    })
}