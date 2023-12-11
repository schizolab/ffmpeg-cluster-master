import log4js from "../../logging.js";
const logger = log4js.getLogger('socket')

export default function handleProgress(socket) {
    socket.on('set progress', ({ slaveName, taskId, action, progressPercentage }, callback) => {
        callback({
            success: true
        })

        logger.trace(`set progress: ${slaveName} is doing ${action} for ${taskId} at ${progressPercentage}%`)

        // pushing progress to UI maybe

    })
}