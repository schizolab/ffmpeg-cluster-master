import log4js from "../../logging.js";
const logger = log4js.getLogger('socket')

import clientIdentities from '../identity.js'

export default function handleProgress(socket) {
    socket.on('set progress', ({ taskId, action, progressPercentage }, callback) => {
        let name = clientIdentities.get(socket.id)
        if (!name) {
            logger.error(`set progress: socket ${socket.id} did not have a name`)
            callback({
                success: false,
                message: 'socket did not have a name'
            })
            return
        }

        callback({
            success: true
        })

        logger.trace(`set progress: ${name} is doing ${action} for ${taskId} at ${progressPercentage}%`)

        // pushing progress to UI maybe

    })
}