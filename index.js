import 'dotenv/config'
import { Command } from "commander";
const program = new Command()

import http from 'http'
import { createExpressApp } from "./src/rest/expressApp.js";
import { attachSocket } from "./src/socket/socket.js";

import log4js from "./src/logging.js";

import { iterateOverSourceVideos, iterateOverDestinationVideos } from "./src/s3/iteration.js";
import { getVideo, insertVideo, updateVideoByFileKey } from './src/db/videos.js';

import { taskWatchdog } from './src/tasking/task.js';

program
    .name('ffmpeg cluster master')
    .description('The master node for the ffmpeg cluster')
    .version('0.2.0')

program
    .command('start')
    .description('Start the server')
    .option('-p, --port [port]', 'path to bind, default 50001')
    .action(async ({ port = 50001 }) => {
        const logger = log4js.getLogger()

        // init the database
        {
            // iterate over source videos
            logger.info('checking videos in source bucket, inserting if not exists')
            await iterateOverSourceVideos((key) => {
                // check if the video is already in the database
                const video = getVideo({ file_key: key })
                if (!video) { // if not, insert it
                    insertVideo({ file_key: key, status: 'unprocessed' })
                }
            })

            // iterate over destination videos
            logger.info('checking videos in destination bucket, marking as done ifs exists')
            await iterateOverDestinationVideos((key) => {
                // check if the video is already in the database
                const video = getVideo({ file_key: key })
                if (video && video.status !== 'completed') { // if exists, mark it as done
                    updateVideoByFileKey({ file_key: key, status: 'completed' })
                }
            })
        }

        // start the task watchdog
        setInterval(async () => {
            await taskWatchdog()
        }, 1000);

        // start the server
        {
            const app = createExpressApp(port)

            const server = http.createServer(app)

            attachSocket(server)

            server.listen(port, () => {
                logger.info(`master server is listening on port ${port}`)
            })
        }
    })

await program.parseAsync()