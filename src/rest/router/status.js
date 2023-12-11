import { Router } from "express";

const router = Router()

router.get('/', (req, res) => {
    res.json({
        remainingTasks: 123
    })
})

export { router as statusRouter }
