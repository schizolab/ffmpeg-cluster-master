import log4js from "../../logging.js";
import clientIdentities from '../identity.js'

const logger = log4js.getLogger('socket')

export default function handleProgress(socket) {
    socket.on('set progress', ({ taskId, action, progressPercentage }) => {
        let name = clientIdentities.get(socket.id)
        if (!name) {
            logger.error(`set progress: socket ${socket.id} did not have a name`)
            return
        }

        logger.trace(`set progress: ${name} is doing ${action} at ${JSON.stringify(progress)}`)

        // pushing progress to UI maybe

    })
}