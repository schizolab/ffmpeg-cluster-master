import 'dotenv/config'
import { Command } from "commander";
const program = new Command()
import { readFileSync } from 'fs';

import http from 'http'
import { createExpressApp } from "./src/rest/expressApp.js";
import { attachSocket } from "./src/socket/socket.js";

import log4js from "./src/logging.js";

import { iterateOverSourceVideos, iterateOverDestinationVideos } from "./src/s3/iteration.js";
import { getVideo, getVideoByPrefix, insertVideo, updateVideoByFileKey } from './src/db/videos.js';

import { taskWatchdog } from './src/tasking/task.js';

import { extractFileName, extractCleanFileName } from './src/s3/utils.js';

program
    .name('ffmpeg cluster master')
    .description('The master node for the ffmpeg cluster')
    .version('0.2.0')

program
    .command('start')
    .description('Start the server')
    .option('-p, --port [port]', 'path to bind, default 50001')
    .option('-i, --include-file [includeFile]', 'specify a file that contains a list of file names to process')
    .action(async ({ port = 50001, includeFile: includeFilePath }) => {
        const logger = log4js.getLogger()

        // init the database
        {
            // load include file into a list of file names
            let includeFiles = []
            if (includeFilePath) {
                try {
                    includeFiles = readFileSync(includeFilePath)
                        .toString('utf-8')
                        .split('\n')
                        .map((line) => line.trim())
                } catch (error) {
                    logger.error(`failed to load include file ${includeFilePath}`)
                }
            }

            // iterate over source videos
            logger.info('checking videos in source bucket, inserting if not exists')
            await iterateOverSourceVideos((key) => {
                // include file check
                if (includeFiles.length > 0) {
                    const cleanFileName = extractCleanFileName(key)
                    if (!includeFiles.includes(cleanFileName)) { // if not in the include file, skip
                        return
                    }
                }

                const fileName = extractFileName(key)

                // check if the video is already in the database
                const video = getVideo({ file_key: fileName })
                if (!video) { // if not, insert it
                    insertVideo({ file_key: fileName, status: 'unprocessed' })
                }
            })

            // iterate over destination videos
            logger.info('checking videos in destination bucket, marking as done ifs exists')
            await iterateOverDestinationVideos((key) => {
                const fileName = extractCleanFileName(key)

                // check if the video is already in the database
                const video = getVideoByPrefix(fileName)
                if (video && video.status !== 'completed') { // if exists, mark it as done
                    updateVideoByFileKey({ file_key: video.file_key, status: 'completed' })
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