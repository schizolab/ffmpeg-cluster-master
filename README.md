# Purpose

This was initially for transcoding the thousands of videos of `Terry Davis Search Engine`.

# How it works

- The slave node get tasks via REST API.
- The master provides slave with `downloadURL` and `uploadURL`. The URLs are generated by S3 presigned URL.
- The slave downloads it from `downloadURL` to temp storage.
- The slave transcodes it with ffmpeg, reporting to master via websocket frequently, so there would be many satisfying progress bars.
- The slave uploads it to the `uploadURL`.

The process repeats, many tasks are run async to utilize all the cores of CPU or GPU.