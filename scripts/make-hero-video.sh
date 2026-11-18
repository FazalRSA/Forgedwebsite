#!/usr/bin/env bash
# Makes the home page hero film's web files from one source video (run by hand, needs ffmpeg with
# libx264, libsvtav1 and libwebp):
#
#   scripts/make-hero-video.sh path/to/film.mp4
#
# Writes into public/video/:
#   hero-1280-av1.mp4  hero-1280.mp4      1280×720, for screens 768 px and wider
#   hero-854-av1.mp4   hero-854.mp4       854×480, for phones
#   hero-poster-1280.webp  hero-poster-854.webp   the film's first frame
#
# The sound is dropped (the film plays muted). Each size comes as AV1 (about half the bytes) and
# H.264 (plays everywhere); the browser takes the first one it can play. The posters are the first
# frame, so nothing jumps when the film starts. src/utils/heroVideo.ts lists these files with their
# codec strings; if you change the sizes or levels here, change them there too (its test checks the
# files exist and stay under the size budget).
set -euo pipefail

src="${1:?usage: scripts/make-hero-video.sh path/to/film.mp4}"
out="$(cd "$(dirname "$0")/.." && pwd)/public/video"
mkdir -p "$out"
export SVT_LOG=1 # SVT-AV1 logs only errors

# Every 48 frames (2 s at 24 fps) a keyframe, so the loop and any seek restart quickly.
h264=(-an -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -g 48 -movflags +faststart)
av1=(-an -c:v libsvtav1 -preset 5 -pix_fmt yuv420p -g 48 -movflags +faststart)
small=(-vf "scale=854:480:flags=lanczos")

ffmpeg -v error -y -i "$src" "${h264[@]}" -crf 26 -level 4.0 -vf "scale=1280:720:flags=lanczos" "$out/hero-1280.mp4"
ffmpeg -v error -y -i "$src" "${h264[@]}" -crf 27 -level 3.1 "${small[@]}" "$out/hero-854.mp4"
ffmpeg -v error -y -i "$src" "${av1[@]}" -crf 38 -vf "scale=1280:720:flags=lanczos" "$out/hero-1280-av1.mp4"
ffmpeg -v error -y -i "$src" "${av1[@]}" -crf 40 "${small[@]}" "$out/hero-854-av1.mp4"
ffmpeg -v error -y -i "$src" -frames:v 1 -vf "scale=1280:720:flags=lanczos" -c:v libwebp -quality 72 "$out/hero-poster-1280.webp"
ffmpeg -v error -y -i "$src" -frames:v 1 "${small[@]}" -c:v libwebp -quality 72 "$out/hero-poster-854.webp"

ls -l "$out"
