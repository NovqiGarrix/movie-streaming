const fs = require('fs');
const path = require('path');
const https = require('https');

// Create videos directory if it doesn't exist
const videosDir = path.join(__dirname, 'videos');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}

const fileUrl = 'https://files.obnoxious.lol/tenTBHDD/movies/Terminator%20Genisys%20(2015)/Terminator.Genisys.2015.1080p.BluRay.x264-SPARKS.mkv';
const fileName = 'Terminator.Genisys.2015.1080p.BluRay.x264-SPARKS.mkv';
const filePath = path.join(videosDir, fileName);

console.log(`Starting download of ${fileName}...`);

const file = fs.createWriteStream(filePath);
const startTime = Date.now(); // Add timestamp for download start

https.get(fileUrl, (response) => {
    // Check if response is successful
    if (response.statusCode !== 200) {
        console.error(`Failed to download: Status code ${response.statusCode}`);
        fs.unlinkSync(filePath); // Remove partially downloaded file
        return;
    }

    // Get total file size for progress tracking
    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;

    // Pipe the response to the file
    response.pipe(file);

    // Track download progress
    response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const downloadSpeed = (downloadedSize / elapsedSeconds) / (1024 * 1024); // MB/s
        const downloadedMB = (downloadedSize / (1024 * 1024)).toFixed(2);
        const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
        const progress = (downloadedSize / totalSize * 100).toFixed(2);
        process.stdout.write(`Downloaded ${progress}% (${downloadedMB}/${totalMB} MB) - Speed: ${downloadSpeed.toFixed(2)} MB/s\r`);
    });

    // Handle completion
    file.on('finish', () => {
        file.close();
        console.log(`\nDownload completed: ${fileName}`);
    });
}).on('error', (err) => {
    fs.unlinkSync(filePath); // Remove partially downloaded file
    console.error(`Error during download: ${err.message}`);
});