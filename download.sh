#!/bin/bash

# Loop from 1 to 48
for i in $(seq 1 48); do
  # Format the number with leading zeros if necessary (e.g., 01, 02, ..., 09, 10, etc.)
  padded_i=$(printf "%02d" "$i")

  # Construct the URL
  url="https://archive.org/download/supersentaijw41/Uchu%20Sentai%20Kyuranger%20${padded_i}.ia.mp4"

  # Construct the filename (you can customize this)
  filename="Uchu_Sentai_Kyuranger_${padded_i}.ia.mp4"

  # Download the file using wget (you can use curl as well)
  wget -c -O "videos/$filename" "$url"

  # Check the download status (optional but recommended)
  if [[ $? -eq 0 ]]; then
    echo "Downloaded: $filename"
  else
    echo "Failed to download: $filename"
  fi

done

echo "Download process complete."