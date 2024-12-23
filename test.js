import fs from 'fs/promises';
import { exec } from 'child_process';

async function sleep(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

// 3. Cek Kelipatan 3
const isMultipleOf3 = (num) => {
    let sumOfDigits = 0;
    const numStr = String(Math.abs(num)); // Ambil nilai absolut dan ubah ke string
    for (let digit of numStr) {
        sumOfDigits += parseInt(digit);
    }

    return sumOfDigits % 3 === 0;
};

// 4. Cek Kelipatan 5
const isMultipleOf5 = (num) => {
    const numStr = String(Math.abs(num));
    const lastDigit = parseInt(numStr.slice(-1));
    return lastDigit === 0 || lastDigit === 5;
};

function isMultipleOf15(number) {
    // 1. Pastikan Bilangan Adalah Angka
    if (typeof number !== 'number') {
        return false; // Bukan angka, bukan kelipatan
    }

    // 2. Cek Bilangan Bulat
    if (!Number.isInteger(number)) {
        return false; // Bukan bilangan bulat, bukan kelipatan
    }

    // 5. Kembalikan true jika kelipatan 3 dan 5
    return isMultipleOf3(number) && isMultipleOf5(number);
}

async function downloadHLS(m3u8Url, outputFilename = 'output.mp4') {
    try {
        // 1. Fetch the .m3u8 content
        // const m3u8Response = await fetch(m3u8Url);
        // if (!m3u8Response.ok) {
        //     throw new Error(`Failed to fetch m3u8: ${m3u8Response.status} ${m3u8Response.statusText}`);
        // }
        // let m3u8Content = await m3u8Response.text();

        // await fs.writeFile("./public/test.m3u8", base64Encoded ? Buffer.from(m3u8Content, 'base64') : m3u8Content);

        const m3u8Content = await fs.readFile("./public/test.m3u8", "utf-8");

        // 2. Extract the segment URLs
        const segmentUrls = m3u8Content.split('\n')
            .filter(line => line.startsWith('https://'));

        if (segmentUrls.length === 0) {
            throw new Error("No video segment URLs found")
        }

        console.log(`Found ${segmentUrls.length} video segments.`)

        // Create temporary directory
        const tempDir = "./temp_segments";
        await fs.mkdir(tempDir, { recursive: true });

        const downloadedSegments = await fs.readdir(tempDir);

        console.log(`Found ${downloadedSegments.length} previously downloaded segments.`);

        // 3. Download the segments
        // let i = getLatestSegmentNumber(downloadedSegments);

        for (let i = 0; i < segmentUrls.length; i++) {
            const segmentUrl = segmentUrls[i];

            if (downloadedSegments.includes(`segment${String(i).padStart(3, '0')}.ts`)) {
                console.log(`Segment ${i} already downloaded, skipping...`);
                continue;
            }

            let segmentResponse;
            while (true) {
                segmentResponse = await fetch(segmentUrl);
                if (segmentResponse.ok) {
                    break; // Segment download successful
                } else if (segmentResponse.status === 429) {
                    console.log('Rate limited, waiting 1 seconds...');
                    await sleep(1);
                } else {
                    console.error(`Failed to download segment ${segmentUrl}: ${segmentResponse.status} ${segmentResponse.statusText}`)
                    await sleep(5);
                }
            }

            if (!segmentResponse.ok) continue;

            const segmentBuffer = await segmentResponse.arrayBuffer();
            const segmentFilename = `segment${String(i).padStart(3, '0')}.ts`;
            const segmentFullFilepath = `${tempDir}/${segmentFilename}`
            await fs.writeFile(segmentFullFilepath, Buffer.from(segmentBuffer));
            downloadedSegments.push(segmentFullFilepath);

            const iPlus = i + 1;
            if (isMultipleOf15(iPlus)) {
                console.log('Waiting 1 seconds to avoid rate limiting...');
                await sleep(1);
            }

            console.log(`Downloaded segment ${i}/${segmentUrls.length}`);
        }

        console.log('All segments downloaded. Merging...');

        // Combine all segments into a mp4 file
        const segmentConcat = downloadedSegments.map((segment) => `file '${segment.split('/').pop()}'`).join('\n');
        const segmentsListFile = `./temp_segments/segments.txt`;
        await fs.writeFile(segmentsListFile, segmentConcat);

        await executeCommand(`ffmpeg -f concat -safe 0 -i ${segmentsListFile} -c copy "videos/${outputFilename}"`, { shell: true }, async () => {
            for await (const segment of downloadedSegments) {
                await fs.unlink(segment);
            }
        });

        // await executeCommand(`python3 extract.py`, { shell: true });

        // // Combine into a single .h264 file
        // console.log('Combining .h264 files...');
        // await executeCommand(`cat extracted_h264/*.h264 > combined.h264`, { shell: true });

        // // Convert .h264 to .mp4
        // console.log('Converting .h264 to .mp4...');
        // await executeCommand(`ffmpeg -i combined.h264 -c copy "videos/${outputFilename}"`, { shell: true });

    } catch (error) {
        console.error('Error during download and merge:', error);
    }
}

async function executeCommand(command, options = {}, callback) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`, error);
                reject(error);
            } else if (stderr) {
                console.error(`python error:`, stderr)
                reject(stderr)
            }
            else {
                console.log('output:', stdout);
                callback && callback();
                resolve(stdout);
            }
        });
    });
}

// Replace with your actual m3u8 URL
const m3u8Url = "https://droxonwave.site/file2/p6xVjKwL~xYsRx~YZUuCKqtuIIIJwqARkUJb4Ib6Xn8pkD2srCVXRwNNUf29PjCTkLXuZC8bBO2jlHcspqDp0Gu5HQdO83rJzDg+1TtkLINd9S6nsr~E4I4OCp0M1MbzUdzFJjdtyqpAs+meQZmUtyqP0Nm7JtwPlaJomiU5Y3k=/NzIw/aW5kZXgubTN1OA==.m3u8"

await downloadHLS(m3u8Url, 'TheWitcherS1E3.mp4');

// const downloadedSegments = await fs.readdir('./temp_segments');
// // Combine all segments into a mp4 file
// const segmentConcat = downloadedSegments.map((segment) => `file '${segment.split('/').pop()}'`).join('\n');
// const segmentsListFile = `./temp_segments/segments.txt`;
// await fs.writeFile(segmentsListFile, segmentConcat);

// await executeCommand(`ffmpeg -f concat -safe 0 -i ${segmentsListFile} -c copy "videos/TheWitcherS1E2.mp4"`, { shell: true });