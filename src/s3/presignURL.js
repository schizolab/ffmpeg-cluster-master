import log4js from "../logging.js";
const logger = log4js.getLogger('s3')

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { sourceS3Client, destinationS3Client } from "./clients.js";

export async function getSignedSourceURL(key) {
    const command = new GetObjectCommand({
        Bucket: process.env.SOURCE_S3_BUCKET,
        Key: key,
    });

    const signedUrl = await getSignedUrl(sourceS3Client, command, { expiresIn: 3600 });

    logger.debug(`generated signed download url for ${key} : ${signedUrl}`)

    return signedUrl;
}

export async function getSignedDestinationURL(key) {
    const command = new PutObjectCommand({
        Bucket: process.env.DESTINATION_S3_BUCKET,
        Key: key,
    });

    const signedUrl = await getSignedUrl(destinationS3Client, command, { expiresIn: 3600 * 10 });

    logger.debug(`generated signed upload url for ${key} : ${signedUrl}`)

    return signedUrl;
}
