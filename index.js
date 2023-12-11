import 'dotenv/config'
import { Command } from "commander";

import http from 'http'
import { createExpressApp } from "./src/rest/expressApp.js";
import { attachSocket } from "./src/socket/socket.js";

import log4js from "./src/logging.js";

const program = new Command()

import { iterateOverSourceVideos } from "./src/s3/s3.js";

(async () => {
    await iterateOverSourceVideos({
        prefix: 'numbered/video/1', // temporarily set to 1 because my hard drive is copying them right now
    }, (key) => {
        console.log(key)
    })
})()

program
    .name('ffmpeg cluster master')
    .description('The master node for the ffmpeg cluster')
    .version('0.2.0')

program
    .command('start')
    .description('Start the server')
    .option('-p, --port [port]', 'path to bind, default 50001')
    .action(({ port = 50001 }) => {
        const app = createExpressApp(port)

        const server = http.createServer(app)

        attachSocket(server)

        server.listen(port, () => {
            const logger = log4js.getLogger('rest')
            logger.info(`master server is listening on port ${port}`)
        })
    })

program.parse()