import log4js from "../../logging.js";
import clientIdentities from '../identity.js'

const logger = log4js.getLogger('socket')

export default function handleProgress(socket) {
    socket.on('set progress', (progress) => {
        let name = clientIdentities.get(socket.id)
        if (!name) {
            logger.error(`set progress: socket ${socket.id} did not have a name`)
            return
        }

        logger.trace(`set progress: ${name} reported progress of ${progress}`)

        // pushing progress to UI maybe

    })
}