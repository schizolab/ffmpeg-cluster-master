import log4js from "../../logging.js";
const logger = log4js.getLogger('rest')

import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';

const router = Router()

// request a task
router.post('/', (req, res) => {
    const { slaveName } = req.body

    res.json({
        id: uuidv4(),
        downloadURL: 'https://www.youtube.com/watch?v=-tt2ZmH-3uc',
        uploadURL: 'https://www.youtube.com/watch?v=vNazWYFKRAM',
        options: {

        }
    })

    logger.info(`/task POST: ${slaveName} requested a task`)
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
