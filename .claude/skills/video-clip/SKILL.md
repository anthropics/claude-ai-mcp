---
name: video-clip
description: Make short MP4 video clips (Reels, Shorts, Stories, TikTok, animated posts) with free tools: an animated HTML page recorded by Playwright and encoded with ffmpeg. Use for any short video, reel, animated text clip or motion graphic request.
---

# Short video clips (free tools: HTML, Motion, Playwright, ffmpeg)

1. Write one HTML page that is the whole clip, animated with Motion (see the `framer-motion` skill).
2. Render it:

```
node .claude/skills/video-clip/render-video.mjs clip.html media-out/<name>.mp4 --w 1080 --h 1920 --s 12
```

`--s` is the clip length in seconds. Sizes: Reel/Short/Story/TikTok 1080x1920 (default), feed post 1080x1350, YouTube 1920x1080.
Output is H.264 MP4 at 30 fps, ready to upload. Keep clips 6 to 30 seconds; recording runs in real time.

## The page

- Fixed size: `html,body{margin:0;width:<w>px;height:<h>px;overflow:hidden}` with an explicit background.
- Start every element in its "before" state (for example `opacity:0`) in CSS.
- Put all animation inside `window.__start = () => { ... }`. The script calls it after fonts and scripts load, so the video starts on the first frame of the animation. Do not start animations on load.
- Load Motion with `<script src="https://cdn.jsdelivr.net/npm/motion@12/dist/motion.js"></script>` and fonts with the normal Google Fonts link; the script serves both locally.
- Brand colours and fonts: see the `slides` skill. Keep text inside the middle 80% of the frame, because Instagram and TikTok cover the top and bottom.
- Pace: about one text beat every 1.5 to 2.5 seconds, hold the last frame (site or handle) for at least 2 seconds.

## Audio

The clip is silent. To add a free music or voice track the user supplies:
`ffmpeg -i clip.mp4 -i audio.mp3 -c:v copy -c:a aac -shortest out.mp4`.
Never download music the user has not given or that is not clearly free to use.

## Check before sending

Grab frames and look at them with Read, for example
`ffmpeg -ss 3 -i clip.mp4 -frames:v 1 -vf scale=360:-1 frame.png`, at the start, middle and end.
Then send the MP4 with SendUserFile. Put outputs in `media-out/` (git-ignored).
