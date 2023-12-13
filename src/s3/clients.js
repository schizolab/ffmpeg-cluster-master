import { S3Client } from "@aws-sdk/client-s3";

export const sourceS3Client = new S3Client({
    endpoint: process.env.SOURCE_S3_ENDPOINT,
    region: process.env.S3_REGION || 'default',
    credentials: {
        accessKeyId: process.env.SOURCE_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.SOURCE_S3_SECRET_ACCESS_KEY,
    },
});

export const destinationS3Client = new S3Client({
    endpoint: process.env.DESTINATION_S3_ENDPOINT,
    region: process.env.S3_REGION || 'default',
    credentials: {
        accessKeyId: process.env.DESTINATION_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.DESTINATION_S3_SECRET_ACCESS_KEY,
    },
});

export const SOURCE_S3_PREFIX = '' || process.env.SOURCE_S3_PREFIX
export const DESTINATION_S3_PREFIX = '' || process.env.DESTINATION_S3_PREFIX