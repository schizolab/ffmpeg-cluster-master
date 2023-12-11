import log4js from "../logging.js";
const logger = log4js.getLogger('s3')

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const sourceS3Client = new S3Client({
    endpoint: process.env.SOURCE_S3_ENDPOINT,
    region: process.env.S3_REGION || 'default',
    credentials: {
        accessKeyId: process.env.SOURCE_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.SOURCE_S3_SECRET_ACCESS_KEY,
    },
});

const destinationS3Client = new S3Client({
    endpoint: process.env.DESTINATION_S3_ENDPOINT,
    region: process.env.S3_REGION || 'default',
    credentials: {
        accessKeyId: process.env.DESTINATION_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.DESTINATION_S3_SECRET_ACCESS_KEY,
    },
});

async function iterateOverPrefix(
    s3Client,
    bucketName,
    prefix,
    batch = 100,
    max = 0,// 0 means no limit,
    callback
) {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: batch,
    });

    try {
        let isTruncated = true;

        let counter = 0
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);

            logger.trace(`retrieved ${Contents.length} keys from s3 bucket ${bucketName}`)

            for (const content of Contents) {
                if (max > 0 && counter >= max) {
                    return
                }
                callback(content.Key)
                counter++
            }

            isTruncated = IsTruncated;
            command.input.ContinuationToken = NextContinuationToken;
        }
    } catch (err) {
        logger.error(err);
    }
}


export async function iterateOverSourceVideos(
    {
        prefix,
        batch = 100,
        max = 0 // 0 means no limit
    },
    callback
) {
    await iterateOverPrefix(sourceS3Client, process.env.SOURCE_S3_BUCKET, prefix, batch, max, callback);
}

export async function iterateOverDestinationVideos(
    {
        prefix,
        batch = 100,
        max = 0 // 0 means no limit
    },
    callback
) {
    await iterateOverPrefix(destinationS3Client, process.env.DESTINATION_S3_BUCKET, prefix, batch, max, callback);
}