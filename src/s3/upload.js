import log4js from "../logging.js";
const logger = log4js.getLogger('s3')

import { readdirSync, createReadStream, statSync } from 'fs'
import { loadIncludeFiles, setIncludeFilePath } from '../db/init.js'
import { sourceS3Client } from './clients.js'
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { extractCleanFileName } from '../s3/utils.js';


export async function batchUpload(path) {
    const files = readdirSync(path)
    const includeFiles = loadIncludeFiles()

    for (const file of files) {
        // skip hidden files
        if (file.startsWith('.')) {
            continue
        }

        // skip if not in the include file
        if (includeFiles.length > 0) {
            const cleanFileName = extractCleanFileName(file)
            if (!includeFiles.includes(cleanFileName)) {
                continue
            }
        }

        // skip if file is already in s3
        const headObjectCommand = new HeadObjectCommand({
            Bucket: process.env.SOURCE_S3_BUCKET,
            Key: `${keyPrefix}${file}`
        })
        try {
            await sourceS3Client.send(headObjectCommand)
            continue // skip
        } catch (error) {
            // if error, file does not exist in s3
            logger.trace(`file ${file} does not exist in s3, uploading...`)
        }

        // upload file to S3 using stream
        const fileFullPath = `${path}${file}`
        const fileStream = createReadStream(fileFullPath)
        const fileStats = statSync(fileFullPath)
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.SOURCE_S3_BUCKET,
            Key: `${keyPrefix}${file}`,
            Body: fileStream,
            ContentLength: fileStats.size
        })
        try {
            await sourceS3Client.send(putObjectCommand)
        } catch (error) {
            logger.error(`failed to upload file ${file} to s3 error: ${error}`)
        } finally {
            fileStream.destroy()
        }
    }
}