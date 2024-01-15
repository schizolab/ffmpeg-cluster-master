import log4js from "../logging.js";
const logger = log4js.getLogger('s3')

import { readdirSync, createReadStream, statSync } from 'fs'
import { loadIncludeFiles, setIncludeFilePath } from '../db/init.js'
import { sourceS3Client, destinationS3Client } from './clients.js'
import { HeadObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { extractCleanFileName } from '../s3/utils.js';


export async function batchUploadFiles(path) {
    const files = readdirSync(path)
    const includeFiles = loadIncludeFiles()

    for (const file of files) {
        // skip hidden files
        if (file.startsWith('.')) {
            continue
        }

        // skip if not in the include file
        const cleanFileName = extractCleanFileName(file)
        if (includeFiles.length > 0) {
            if (!includeFiles.includes(cleanFileName)) {
                continue
            }
        }

        // skip if the file is already in s3 destination bucket
        {
            const listObjectsCommand = new ListObjectsV2Command({
                Bucket: process.env.DESTINATION_S3_BUCKET,
                Prefix: `${process.env.DESTINATION_S3_PREFIX}${cleanFileName}.`
            })
            try {
                const response = await destinationS3Client.send(listObjectsCommand)
                const fileExists = response.Contents?.length > 0;

                if (fileExists) {
                    continue; // skip
                } else {
                    // if file does not exist in s3
                    logger.trace(`file ${file} does not exist in s3 destination bucket`)
                }
            } catch (error) {
                // if error, file does not exist in s3
                logger.error(`failed to list objects in s3 destination bucket error: ${error}`)
            }
        }

        // skip if file is already in s3 source bucket
        {
            const headObjectCommand = new HeadObjectCommand({
                Bucket: process.env.SOURCE_S3_BUCKET,
                Key: `${process.env.SOURCE_S3_PREFIX}${file}`
            })
            try {
                await sourceS3Client.send(headObjectCommand)
                continue // skip
            } catch (error) {
                // if error, file does not exist in s3
                logger.trace(`file ${file} does not exist in s3 source bucket`)
            }
        }

        logger.info(`uploading file ${file}`)

        // upload file to S3 using stream
        const fileFullPath = `${path}${file}`
        const fileStream = createReadStream(fileFullPath)
        const fileStats = statSync(fileFullPath)
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.SOURCE_S3_BUCKET,
            Key: `${process.env.SOURCE_S3_PREFIX}${file}`,
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