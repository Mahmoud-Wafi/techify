# Video Playback Troubleshooting Guide

## Problem: Videos Not Playing

If videos still don't play after the fix, follow these steps:

### Step 1: Check Browser Console for Errors
1. Open browser DevTools (F12 or right-click → Inspect)
2. Go to "Console" tab
3. Look for red error messages
4. Report any CORS, 404, or permission errors

### Step 2: Verify Video File Exists

**On the server**:
```bash
# Check if media directory exists
ls -la /home/mahmoud/teachify_Master/backend/cubraos/teachify/media/videos/

# Check specific video file
ls -lh /home/mahmoud/teachify_Master/backend/cubraos/teachify/media/videos/*/
```

**Expected directory structure**:
```
media/
└── videos/
    └── {course_id}/
        ├── {uuid}.mp4
        ├── {uuid}.mov
        └── {uuid}.avi
```

### Step 3: Check Video URL in Database

```bash
# Connect to Django shell
cd /home/mahmoud/teachify_Master/backend/cubraos/teachify

# Python shell
python manage.py shell

# Inside shell:
from apps.courses.models import Lesson
lesson = Lesson.objects.first()
print(f"Video URL: {lesson.video_url}")
```

**Expected output**: `/media/videos/1/abc123xyz.mp4`

If empty or wrong:
- Re-upload the video through instructor panel
- Or manually update: `lesson.video_url = '/media/videos/1/abc123.mp4'; lesson.save()`

### Step 4: Test Direct URL Access

1. Get the video URL from database (see Step 3)
2. Open browser and visit: `http://localhost:8000/media/videos/1/abc123.mp4`
3. Should either play or download the video

**If 404 error**:
- Video file doesn't exist in media folder
- Check Step 2 again
- Re-upload video from instructor panel

**If permission error**:
- Check file permissions: `chmod 644 /path/to/video.mp4`
- Check Django settings (see Configuration section below)

### Step 5: Check API Response

```bash
# Test API endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/courses/dashboard/
```

Look for `lessons` array and verify each lesson has `video_url` populated:
```json
{
  "active_courses": [
    {
      "id": 1,
      "title": "Course Name",
      "lessons": [
        {
          "id": 1,
          "title": "Lesson 1",
          "video_url": "/media/videos/1/abc123.mp4"  // Should not be empty!
        }
      ]
    }
  ]
}
```

### Step 6: Check Frontend React Component

In browser DevTools → React DevTools:
1. Find `<CoursePlayer>` component
2. Check `activeLesson` prop
3. Verify `video_url` is not empty
4. Verify URL format: `/media/videos/{course_id}/{filename}`

---

## Configuration Checklist

### Backend (Django)

✅ **settings.py should have**:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

✅ **urls.py should have**:
```python
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

✅ **instructor_views.py video saving logic** (already implemented):
```python
ext = os.path.splitext(video_file.name)[1]
filename = f"videos/{course.id}/{uuid.uuid4().hex}{ext}"
path = default_storage.save(filename, video_file)
video_url = f"/media/{path}"
```

### Frontend (React)

✅ **CoursePlayer.tsx should render**:
```jsx
<video 
  src={activeLesson.video_url} 
  className="w-full h-full object-contain" 
  controls
>
  Your browser does not support the video tag.
</video>
```

---

## Common Issues & Fixes

### Issue 1: "404 Not Found" Error
**Cause**: Video file doesn't exist in media folder

**Solutions**:
1. Re-upload the video from instructor course creation page
2. Verify Django is running in development mode (DEBUG=True)
3. Check file permissions: `chmod 755 /path/to/media/`

### Issue 2: CORS Error
**Cause**: Browser security restricting video access

**Solution** (shouldn't happen with local files, but if using remote CDN):
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

### Issue 3: "Video Not Found" in Player
**Cause**: `activeLesson.video_url` is null/undefined

**Check**:
- Is lesson selected in sidebar?
- Does the API response include video_url?
- Is the lesson properly linked to the course?

### Issue 4: Video Plays but Audio Missing
**Cause**: Video codec issue

**Solution**: Ensure videos are MP4 format with:
- Video codec: H.264
- Audio codec: AAC
- Container: MP4

**Convert with ffmpeg**:
```bash
ffmpeg -i input.avi -c:v libx264 -preset medium -c:a aac -q:a 5 output.mp4
```

### Issue 5: Video Slow to Load
**Cause**: Large file size or slow connection

**Solutions**:
1. Compress video with ffmpeg:
```bash
ffmpeg -i input.mp4 -crf 23 -c:v libx264 -c:a aac output.mp4
```

2. Implement HLS streaming (advanced)
3. Use CDN like Cloudinary or AWS CloudFront

---

## Testing Steps

### 1. Basic Playback Test
```bash
# Start backend
cd backend/cubraos/teachify
python manage.py runserver

# In another terminal, start frontend
cd frontend/skill
npm run dev
```

1. Login as instructor
2. Create a course
3. Add a lesson with a test video
4. Login as student
5. Enroll in course
6. Click course → Click lesson in sidebar
7. Video should play

### 2. Download Test
1. Click "Download" button above video
2. Check browser download folder
3. File should be named: `{lesson_title}.mp4`

### 3. Mobile Test
1. Open on phone/tablet
2. Video should be responsive
3. Download should work
4. Portrait/landscape orientation changes

### 4. Browser Compatibility Test
Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Debug Mode

### Enable Verbose Logging

**Backend**:
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Frontend** (React console):
```javascript
// In CoursePlayer.tsx
console.log("Active lesson:", activeLesson);
console.log("Video URL:", activeLesson?.video_url);
```

### Check Django Media Serving

```bash
# Test direct file serving
curl -v http://localhost:8000/media/videos/1/test.mp4
```

Should return:
- Status 200 OK
- Content-Type: video/mp4
- Content-Length: {file_size}

---

## Production Considerations

For production (not local development):

### Option 1: AWS S3
```python
import boto3
s3 = boto3.client('s3')
s3.upload_file(video_file, 'bucket-name', f'videos/{course_id}/{filename}')
video_url = f"https://bucket-name.s3.amazonaws.com/videos/{course_id}/{filename}"
```

### Option 2: Cloudinary
```python
import cloudinary.uploader
result = cloudinary.uploader.upload(video_file, resource_type="video")
video_url = result['secure_url']
```

### Option 3: HLS Streaming
```python
# Convert to HLS format with ffmpeg
import subprocess
subprocess.run([
    'ffmpeg', '-i', input_file,
    '-hls_time', '10',
    '-hls_list_size', '0',
    output_file
])
```

---

## Performance Tips

1. **Compress videos before upload**:
   - Use MP4 format
   - Resolution: 720p-1080p
   - Bitrate: 2-5 Mbps

2. **Lazy load videos**:
   - Don't autoplay
   - Use poster (thumbnail)

3. **Cache considerations**:
   - Add cache headers to media files
   - Use CDN for distribution

4. **Monitor file sizes**:
   - Set max upload limit
   - Warn users about data usage

---

## Support

If you still have issues after following this guide:

1. **Check browser console** for specific error messages
2. **Check Django server logs** for backend errors
3. **Verify file permissions** on media folder
4. **Test with sample video** (confirm setup works)
5. **Check network tab** in DevTools (is request being sent?)

Most video issues are caused by:
- Missing/wrong file path
- File permissions
- CORS settings (if using remote CDN)
- Browser cache (try incognito mode)
