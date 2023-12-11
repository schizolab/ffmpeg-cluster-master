import express from 'express';
import { statusRouter } from './router/status.js';
import { taskRouter } from './router/task.js';

export function createExpressApp(port) {
    const app = express();

    app.use(express.json())

    app.use('/status', statusRouter)
    app.use('/task', taskRouter)

    return app
}
