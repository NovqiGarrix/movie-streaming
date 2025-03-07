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
            if ffmpeg -i "$file" -map 0:s:0 "public/subtitles/${filename}.vtt"; then
                echo "Deleting original MKV file..."
                rm "$file"
            fi
        fi
    fi
done

# Loop through all srt files in the subtitles directory
# and convert them to VTT format
# for file in public/subtitles/*.srt; do
#     if [ -f "$file" ]; then
#         # Get filename without path and extension
#         filename=$(basename "$file" .srt)
#         filepath="public/subtitles/${filename}"
        
#         echo "Converting ${filepath}.srt to VTT..."
#         # Convert SRT to VTT
#         if ffmpeg -i "$file" "${filepath}.vtt"; then
#             echo "Deleting original SRT file..."
#             rm "$file"
#         fi
#     fi
# done

echo "Conversi  on and subtitle extraction completed!"