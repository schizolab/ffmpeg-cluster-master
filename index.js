import 'dotenv/config'
import { Command } from "commander";
const program = new Command()

import http from 'http'
import { createExpressApp } from "./src/rest/expressApp.js";
import { attachSocket } from "./src/socket/socket.js";

import log4js from "./src/logging.js";

import { iterateOverSourceVideos, iterateOverDestinationVideos } from "./src/s3/iteration.js";
import { getVideo, insertVideo, markVideoStatus } from './src/tasking/db.js';

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
            await iterateOverSourceVideos({
                prefix: 'numbered/video/'
            }, (key) => {
                // check if the video is already in the database
                const video = getVideo({ file_key: key })
                if (!video) { // if not, insert it
                    insertVideo({ file_key: key })
                }
            })

            // iterate over destination videos
            logger.info('checking videos in destination bucket, marking as done ifs exists')
            await iterateOverDestinationVideos({
                prefix: 'video/'
            }, (key) => {
                // check if the video is already in the database
                const video = getVideo({ file_key: key })
                if (video && video.status !== 'done') { // if exists, mark it as done
                    markVideoStatus({ file_key: key, status: 'done' })
                }
            })
        }

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