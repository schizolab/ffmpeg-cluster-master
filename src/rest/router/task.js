import log4js from "../../logging.js";
const logger = log4js.getLogger('rest')

import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';

import { getTask } from '../../tasking/task.js';

const router = Router()

// request a task
router.post('/', async (req, res) => {
    const { slaveName } = req.body

    logger.info(`/task POST: ${slaveName} requested a task`)

    const task = await getTask()

    if (!task) {
        logger.info(`/task POST: no tasks available for ${slaveName}`)
        res.status(404).json({
            error: 'no tasks available'
        })
        return
    }

    logger.info(`/task POST: ${slaveName} received task ${task.id}`)

    res.json({
        taskId: task.id,
        downloadURL: task.downloadURL,
        uploadURL: task.uploadURL,
        options: task.options
    })
})

// finish a task
router.patch('/:taskId', (req, res) => {
    const { taskId } = req.params
    const { slaveName, status } = req.body

    res.json({
        isUpdated: 'updated task',
    })

    logger.info(`/task PATCH: ${slaveName} finished task ${taskId} with status ${status}`)

})

export { router as taskRouter }
