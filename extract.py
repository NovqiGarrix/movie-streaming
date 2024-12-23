import os
import re

def extract_video_from_ts(ts_file, output_dir):
    with open(ts_file, 'rb') as f:
        content = f.read()

    # Identify IEND marker
    iend_marker = b'\x00\x00\x00\x00IEND\xaeB`\x82' # The IEND marker in hex
    end_of_header = content.find(iend_marker)

    if end_of_header == -1:
        print(f'Error: not able to find iend marker for file: {ts_file}')
        return

    start_of_video = end_of_header + len(iend_marker) # Add the length of the marker
    video_data = content[start_of_video:]
    output_file = os.path.join(output_dir, os.path.basename(ts_file).replace('.ts', '.h264'))

    with open(output_file, 'wb') as output:
        output.write(video_data)
    print(f"Extracted video data from: {ts_file} to: {output_file}")

def extract_all(input_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for filename in os.listdir(input_dir):
        if filename.endswith('.ts'):
           file_path = os.path.join(input_dir, filename)
           extract_video_from_ts(file_path, output_dir)

if __name__ == '__main__':
    input_dir = 'temp_segments' # Replace this with the path of your temp_segments
    output_dir = 'extracted_h264'  # Replace this with your output dir
    extract_all(input_dir, output_dir)
    
    # 