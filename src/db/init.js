import log4js from "../logging.js";
const logger = log4js.getLogger()

import { iterateOverSourceVideos, iterateOverDestinationVideos } from "../s3/iteration.js";
import { getVideo, getVideoByPrefix, insertVideo, updateVideoByFileKey } from '../db/videos.js';
import { extractFileName, extractCleanFileName } from '../s3/utils.js';
import { readFileSync } from 'fs';

let includeFilePath = null

export function loadIncludeFiles() {
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

    return includeFiles
}

// check on s3 endpoint for videos to process and videos done
// subtract videos not in the includeFiles
// insert new videos into the database
export async function loadDatabaseAsync() {
    // load include file into a list of file names
    const includeFiles = loadIncludeFiles()

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

export function setIncludeFilePath(_includeFilePath) {
    includeFilePath = _includeFilePath
}