export function extractCleanFileName(path) {
    return extractFileName(path)
        .split('.')
        .slice(0, -1)
        .join('.');
}

export function extractFileName(path) {
    let fileName = path.split('/');
    fileName = fileName[fileName.length - 1];

    return fileName
}