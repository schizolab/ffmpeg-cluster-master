import log4js from "../logging.js";
const logger = log4js.getLogger('task')

import * as videosDB from "../db/videos.js";
import * as taskDB from "../db/tasks.js";

import { getSignedSourceURL, getSignedDestinationURL } from '../s3/presignURL.js';

import { v4 as uuidv4 } from 'uuid';

import { SOURCE_S3_PREFIX, DESTINATION_S3_PREFIX } from "../s3/clients.js";
import { extractCleanFileName } from "../s3/utils.js";

export async function getTask({ slaveName }) {
    // get a video that is unprocessed
    const video = videosDB.getVideoByStatus('unprocessed');

    if (!video) return null;

    // insert a task
    const taskId = uuidv4();
    taskDB.insertTask({
        task_id: taskId,
        video_id: video.id,
        slave_name: slaveName,
        action: 'initializing',
        status: 'processing'
    });

    // update video status
    videosDB.updateVideoByFileKey({
        file_key: video.file_key,
        status: 'processing'
    });

    // get signed urls
    const sourceKey = `${SOURCE_S3_PREFIX}${video.file_key}`;
    const downloadURL = await getSignedSourceURL(sourceKey);
    // destination url must remove the source prefix

    const destinationKey = `${DESTINATION_S3_PREFIX}${extractCleanFileName(video.file_key)}.webm`;
    const uploadURL = await getSignedDestinationURL(destinationKey);

    return {
        id: taskId,
        downloadURL,
        uploadURL,
        options: {}
    }
}

const WATCHDOG_INTERVAL = 60 * 1000;
export async function taskWatchdog() {
    try {
        // get all tasks that are processing
        const tasks = taskDB.getTasksByStatus('processing');

        for (const task of tasks) {
            // if task is processing for more than 5 seconds
            if (Date.now() - task.last_progress_at > WATCHDOG_INTERVAL) {
                // set task to failed
                taskDB.updateTask({
                    task_id: task.task_id,
                    action: task.action,
                    status: 'failed',
                    progress_percentage: 0
                });
                logger.info(`task ${task.task_id} failed by ${task.slave_name} due to progress update watchdog`);

                // restore video to unprocessed state, mark as corrupted if failed too many times
                restoreVideo(task.video_id);
            }
        }
    } catch (error) {
        logger.error(`taskWatchdog error: ${error}`)
    }
}


const TASK_FAILURE_THRESHOLD = 3;
export function restoreVideo(video_id) {
    // check how many times this video have failed to process
    const tasks = taskDB.getTasksByVideoId(video_id);

    // if failed more than 3 times, set video status to corrupted
    if (tasks.filter(task => task.status === 'failed').length > TASK_FAILURE_THRESHOLD) {
        videosDB.updateVideoById({
            id: video_id,
            status: 'corrupted'
        });

        logger.warn(`restoreVideo: video ${video_id} is being marked as corrupted`)
    } else {
        // set video to unprocessed
        videosDB.updateVideoById({
            id: video_id,
            status: 'unprocessed'
        });

        logger.info(`restoreVideo: video ${video_id} is being put back on the shelf as unprocessed`)
    }
}