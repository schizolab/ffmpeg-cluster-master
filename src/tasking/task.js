import log4js from "../logging.js";
const logger = log4js.getLogger('task')

import * as videosDB from "../db/videos.js";
import * as taskDB from "../db/tasks.js";

import { getSignedSourceURL, getSignedDestinationURL } from '../s3/presignURL.js';

import { v4 as uuidv4 } from 'uuid';

import { destinationS3Client, SOURCE_S3_PREFIX } from "../s3/clients.js";

export async function getTask() {
    // get a video that is unprocessed
    const video = videosDB.getVideoByStatus('unprocessed');

    if (!video) return null;

    // insert a task
    const taskId = uuidv4();
    taskDB.insertTask({
        task_id: taskId,
        video_id: video.id,
        slave_name: 'slave1',
        status: 'processing'
    });

    // update video status
    videosDB.updateVideoByFileKey({
        file_key: video.file_key,
        status: 'processing'
    });

    // get signed urls
    const downloadURL = await getSignedSourceURL(video.file_key);
    // destination url must remove the source prefix
    const destinationKey = video.file_key.slice(SOURCE_S3_PREFIX.length);
    const uploadURL = await getSignedDestinationURL(destinationKey);

    return {
        id: taskId,
        downloadURL,
        uploadURL,
        options: {}
    }
}

export async function finishTask({ taskId }) {
    // get task
    const task = taskDB.getTask({ task_id: taskId });

    if (!task) {
        throw new Error(`task ${taskId} does not exist`)
    }

    // I'm just going to trust the client has uploaded the file to the destination bucket

    // update task
    taskDB.updateTask({
        task_id: taskId,
        status: 'completed',
        progress_percentage: 100
    });

    // update video
    videosDB.updateVideoByFileKey({
        file_key: task.file_key,
        status: 'completed'
    });
}

export async function taskWatchdog() {
    try {
        // get all tasks that are processing
        const tasks = taskDB.getTasksByStatus('processing');

        for (const task of tasks) {
            // if task is processing for more than 5 seconds
            if (Date.now() - task.last_progress_at > 5 * 1000) {
                // set task to failed
                taskDB.updateTask({
                    task_id: task.task_id,
                    status: 'failed',
                    progress_percentage: 0
                });
                logger.info(`task ${task.task_id} failed by ${task.slave_name} due to progress update watchdog`);
                // set video to unprocessed
                videosDB.updateVideoById({
                    id: task.video_id,
                    status: 'unprocessed'
                });

                // check how many this this video have failed to process
                const tasks = taskDB.getTasksByVideoId(task.video_id);

                // if failed more than 3 times, set video status to corrupted
                if (tasks.filter(task => task.status === 'failed').length > 3) {
                    videosDB.updateVideoById({
                        id: task.video_id,
                        status: 'corrupted'
                    });
                }
            }
        }
    } catch (error) {
        logger.error(`taskWatchdog error: ${error}`)
    }
}