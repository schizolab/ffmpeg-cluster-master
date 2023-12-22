import log4js from "../../logging.js";
const logger = log4js.getLogger('socket')

import * as taskDB from '../../db/tasks.js'

export default function handleProgress(socket) {
    socket.on('set progress', ({ slaveName, taskId, action, progressPercentage }, callback) => {
        const task = taskDB.getTaskById(taskId)

        // check if task exists
        if (!task) {
            logger.warn(`set progress: slave ${slaveName} tried to set progress for non-existent task ${taskId}`)
            callback({
                success: false,
                error: `task ${taskId} does not exist`
            })
            return
        }

        // check if task is processing
        if (task.status !== 'processing') {
            logger.warn(`set progress: slave ${slaveName} tried to set progress for task ${taskId} with status ${task.status} `)
            callback({
                success: false,
                error: `task ${taskId} has been marked ${task.status} and cannot be updated}`
            })
            return
        }

        taskDB.updateTask({
            task_id: taskId,
            action,
            status: 'processing',
            progress_percentage: progressPercentage
        });

        callback({
            success: true
        })

        logger.trace(`set progress: ${slaveName} is doing ${action} for ${taskId} at ${progressPercentage}%`)

        // pushing progress to UI maybe

    })
}