import log4js from "./src/logging.js";
const logger = log4js.getLogger()

import 'dotenv/config'
import { Command } from "commander";
const program = new Command()

import http from 'http'
import { createExpressApp } from "./src/rest/expressApp.js";
import { attachSocket } from "./src/socket/socket.js";


import { taskWatchdog } from './src/tasking/task.js';

import { setIncludeFilePath, loadDatabaseAsync } from './src/db/init.js'

import { batchUpload } from "./src/s3/upload.js";

program
    .name('ffmpeg cluster master')
    .description('The master node for the ffmpeg cluster')
    .version('0.2.0')

program
    .command('start')
    .description('Start the server')
    .option('-p, --port [port]', 'path to bind, default 50001')
    .option('-i, --include-file [includeFile]', 'specify a file that contains a list of file names to process')
    .action(async ({ port = 50001, includeFile }) => {
        // populate the SQLite database using indexing data from S3
        // knowing which are processed and which are not yet processed
        setIncludeFilePath(includeFile)
        await loadDatabaseAsync()

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

program
    .command('upload')
    .description('Upload files to S3')
    .option('-i, --include-file [includeFile]', 'specify a file that contains a list of file names to upload')
    .argument('<path>', 'folder of the files to upload')
    .action(async (path, { includeFile }) => {
        if (includeFile) {
            setIncludeFilePath(includeFile)
        }

        await batchUpload(path)
    })


await program.parseAsync()