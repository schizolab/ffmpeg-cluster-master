import { Router } from "express";

const router = Router()

router.get('/', (req, res) => {
    res.json({
        running: true
    })
})

export { router as statusRouter }
