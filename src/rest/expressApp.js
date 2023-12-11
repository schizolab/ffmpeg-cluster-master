import express from 'express';
import { statusRouter } from './router/status.js';

export function createExpressApp(port) {
    const app = express();

    app.use(express.json())
    
    app.use('/status', statusRouter)

    return app
}
