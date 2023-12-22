import log4js from "../../logging.js";
const logger = log4js.getLogger('socket')

import * as taskDB from '../../db/tasks.js'

export default function handleResult(socket) {
    socket.on('set result', ({ slaveName, taskId, status, message }, callback) => {
        const task = taskDB.getTaskById(taskId)

        // check if task exists
        if (!task) {
            logger.warn(`set progress: slave ${slaveName} tried to set result for non-existent task ${taskId}`)
            callback({
                success: false,
                error: `task ${taskId} does not exist`
            })
            return
        }

        switch (status) {
            case 'completed':
                taskDB.updateTask({
                    task_id: taskId,
                    action: task.action,
                    status: 'completed',
                    progress_percentage: task.progress_percentage
                });
                logger.info(`set result: slave ${slaveName} completed task ${taskId}`)
                break;
            case 'failed':
                taskDB.updateTask({
                    task_id: taskId,
                    action: task.action,
                    status: 'failed',
                    progress_percentage: task.progress_percentage
                });
                logger.warn(`set result: slave ${slaveName} failed task ${taskId}`)
                break;
            default:
                break;
        }

        callback({
            success: true
        })

        logger.info(`set result: ${slaveName} ${status} ${taskId} with message ${message}`)
    })
}