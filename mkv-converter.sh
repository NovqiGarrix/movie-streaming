#!/bin/bash

# Create output directories if they don't exist
mkdir -p public/subtitles

# Loop through all mkv files in the videos directory
for file in videos/*.mkv; do
    if [ -f "$file" ]; then
        # Get filename without path and extension
        filename=$(basename "$file" .mkv)
        filepath="videos/${filename}"
        
        echo "Converting ${filepath}.mkv to MP4..."
        # Convert MKV to MP4
        if ffmpeg -i "$file" -codec copy "${filepath}.mp4"; then
            echo "Extracting subtitles from ${filepath}.mkv..."
            # Extract subtitles (this will extract all subtitle streams)
            if ffmpeg -i "$file" -map 0:s:0 "public/subtitles/${filename}.srt"; then
                echo "Deleting original MKV file..."
                rm "$file"
            fi
        fi
    fi
done

echo "Conversion and subtitle extraction completed!"