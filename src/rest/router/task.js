import log4js from "../../logging.js";
const logger = log4js.getLogger('rest')

import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';

import { getTask } from '../../tasking/task.js';

import { loadDatabaseAsync } from "../../db/init.js";

const router = Router()

let lastDatabaseUpdateAt = 0
let isDatabaseUpdating = false

// request a task
router.post('/', async (req, res) => {
    const { slaveName } = req.body

    logger.info(`/task POST: ${slaveName} requested a task`)

    const task = await getTask({ slaveName })

    if (!task) {
        logger.info(`/task POST: no tasks available for ${slaveName}`)

        // actively check on the s3 indexes for new videos
        if ((Date.now() - lastDatabaseUpdateAt > 1000) && (isDatabaseUpdating === false)) {
            isDatabaseUpdating = true
            await loadDatabaseAsync()
            lastDatabaseUpdateAt = Date.now()
            isDatabaseUpdating = false
        }

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
