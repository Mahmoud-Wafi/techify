# Production Migration Guide - Video Handling

## Phase 1: Immediate (Current Setup Optimization)

### 1. Add Environment Variables

**Create `.env.local` (development)**
```bash
VITE_API_URL=http://127.0.0.1:8000
```

**Create `.env.production`**
```bash
VITE_API_URL=https://api.teachify.com
```

**Update `vite.config.ts`** to load env variables
```typescript
import { defineConfig, loadEnv } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL
    ),
  },
});
```

### 2. Add Video Size Validation

**Backend: `instructor_views.py`**
```python
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB

def create_course_lesson(request, course_id):
    video_file = request.FILES.get('video')
    
    if video_file and video_file.size > MAX_VIDEO_SIZE:
        return Response(
            {'error': f'Video too large. Max {MAX_VIDEO_SIZE/1024/1024}MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    # ... rest of code
```

### 3. Add Video Format Validation

**Backend: `instructor_views.py`**
```python
ALLOWED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime']

def create_course_lesson(request, course_id):
    video_file = request.FILES.get('video')
    
    if video_file and video_file.content_type not in ALLOWED_VIDEO_FORMATS:
        return Response(
            {'error': f'Invalid format. Allowed: MP4, WebM, MOV'},
            status=status.HTTP_400_BAD_REQUEST
        )
    # ... rest of code
```

### 4. Add Download Progress (Frontend)

**`CoursePlayer.tsx`**
```typescript
const [downloadProgress, setDownloadProgress] = useState(0);

const handleDownloadVideo = async () => {
  if (!activeLesson?.video_url) return;
  
  try {
    setDownloadProgress(0);
    const fullUrl = getFullVideoUrl(activeLesson.video_url);
    const response = await fetch(fullUrl);
    const total = parseInt(response.headers.get('content-length'), 10);
    
    let loaded = 0;
    const reader = response.body.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      setDownloadProgress(Math.round((loaded / total) * 100));
    }
    
    // Combine chunks and save
    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeLesson.title || 'lesson'}.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setDownloadProgress(0);
  } catch (error) {
    console.error('Download failed:', error);
    alert(isEn ? 'Failed to download video' : 'فشل تحميل الفيديو');
    setDownloadProgress(0);
  }
};

// Show progress in UI
{downloadProgress > 0 && (
  <div className="mt-2 bg-slate-700 rounded h-2">
    <div 
      className="bg-blue-500 h-full transition-all"
      style={{ width: `${downloadProgress}%` }}
    />
  </div>
)}
```

---

## Phase 2: Growth (AWS S3 Integration)

### Step 1: Create AWS S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://teachify-videos --region us-east-1
aws s3api put-bucket-cors --bucket teachify-videos --cors-configuration file://cors.json
```

**cors.json**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://teachify.com", "https://app.teachify.com"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### Step 2: Install Django Storages

```bash
cd backend/cubraos/teachify
pip install django-storages boto3
```

### Step 3: Configure Django

**`settings.py`**
```python
if ENVIRONMENT == 'production':
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = 'teachify-videos'
    AWS_S3_REGION_NAME = 'us-east-1'
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/'
else:
    # Local development
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### Step 4: Update Video Upload Logic

**`instructor_views.py`**
```python
from django.conf import settings

def create_course_lesson(request, course_id):
    video_file = request.FILES.get('video')
    
    if video_file:
        import uuid, os
        from django.core.files.storage import default_storage
        
        ext = os.path.splitext(video_file.name)[1]
        filename = f"videos/{course_id}/{uuid.uuid4().hex}{ext}"
        
        path = default_storage.save(filename, video_file)
        video_url = f"{settings.MEDIA_URL}{path}"
    else:
        video_url = ''
    
    lesson = Lesson.objects.create(
        course=course,
        title=title,
        description=description,
        video_url=video_url,
        order=next_order
    )
    
    return Response(LessonSerializer(lesson).data)
```

---

## Phase 3: Scale (HLS Streaming)

### Step 1: Install FFmpeg

```bash
# Ubuntu
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg
```

### Step 2: Create HLS Conversion Service

**`apps/courses/hls_service.py`**
```python
import subprocess
import os
from django.conf import settings

class HLSService:
    @staticmethod
    def convert_to_hls(video_path, output_dir):
        """Convert video to HLS format"""
        os.makedirs(output_dir, exist_ok=True)
        
        playlist_path = os.path.join(output_dir, 'playlist.m3u8')
        
        command = [
            'ffmpeg',
            '-i', video_path,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-c:a', 'aac',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-hls_list_size', '0',
            '-f', 'hls',
            playlist_path
        ]
        
        subprocess.run(command, check=True)
        return playlist_path
    
    @staticmethod
    def generate_thumbnails(video_path, output_dir):
        """Generate video thumbnail"""
        os.makedirs(output_dir, exist_ok=True)
        
        thumbnail_path = os.path.join(output_dir, 'thumbnail.jpg')
        
        command = [
            'ffmpeg',
            '-i', video_path,
            '-ss', '00:00:05',  # 5 seconds in
            '-vframes', '1',
            '-vf', 'scale=320:180',
            thumbnail_path
        ]
        
        subprocess.run(command, check=True)
        return thumbnail_path
```

### Step 3: Use Celery for Async Conversion

```python
# Install celery
pip install celery redis

# apps/courses/tasks.py
from celery import shared_task
from .hls_service import HLSService

@shared_task
def convert_video_to_hls(lesson_id):
    """Convert lesson video to HLS format asynchronously"""
    lesson = Lesson.objects.get(id=lesson_id)
    
    # Convert to HLS
    output_dir = f"{settings.MEDIA_ROOT}/hls/{lesson.course.id}/{lesson.id}/"
    HLSService.convert_to_hls(lesson.video_url, output_dir)
    
    # Update lesson with HLS URL
    lesson.video_url = f"{settings.MEDIA_URL}hls/{lesson.course.id}/{lesson.id}/playlist.m3u8"
    lesson.save()
```

---

## Phase 4: Analytics & Tracking

### Add Video View Tracking

**Backend: `models.py`**
```python
class VideoView(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    duration_watched = models.IntegerField(default=0)  # seconds
    progress_percent = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('student', 'lesson')
```

**Backend: `views.py`**
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_video_progress(request, lesson_id):
    lesson = Lesson.objects.get(id=lesson_id)
    video_view, _ = VideoView.objects.get_or_create(
        student=request.user,
        lesson=lesson
    )
    
    video_view.duration_watched = request.data.get('duration', 0)
    video_view.progress_percent = request.data.get('progress', 0)
    video_view.completed = request.data.get('completed', False)
    video_view.save()
    
    return Response({'success': True})
```

**Frontend: `CoursePlayer.tsx`**
```typescript
useEffect(() => {
  const videoElement = document.querySelector('video');
  if (!videoElement) return;
  
  const updateProgress = async () => {
    await api.lessons.updateProgress(activeLesson.id, {
      duration: Math.round(videoElement.currentTime),
      progress: Math.round((videoElement.currentTime / videoElement.duration) * 100),
      completed: videoElement.currentTime >= videoElement.duration * 0.9 // 90% watched
    });
  };
  
  videoElement.addEventListener('timeupdate', updateProgress);
  return () => videoElement.removeEventListener('timeupdate', updateProgress);
}, [activeLesson]);
```

---

## Migration Checklist

### Phase 1 (This Week)
- [ ] Add .env files with VITE_API_URL
- [ ] Add video size validation
- [ ] Add video format validation
- [ ] Add download progress indicator
- [ ] Test locally

### Phase 2 (1-2 Months)
- [ ] Create AWS S3 bucket
- [ ] Install django-storages
- [ ] Configure Django for S3
- [ ] Migrate existing videos to S3
- [ ] Update upload logic
- [ ] Test in staging

### Phase 3 (3-4 Months)
- [ ] Install FFmpeg on server
- [ ] Create HLS conversion service
- [ ] Set up Celery + Redis
- [ ] Implement async video conversion
- [ ] Add quality selector UI

### Phase 4 (Ongoing)
- [ ] Implement video view tracking
- [ ] Create analytics dashboard
- [ ] Monitor video performance
- [ ] Optimize based on user data

---

## Cost Optimization Tips

1. **Video Compression**
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -q:a 5 output.mp4
   # Lower CRF = better quality, larger file
   # CRF 23 (default) vs CRF 28 (50% smaller, minimal quality loss)
   ```

2. **Progressive Upload**
   - Only convert/transcode on demand
   - Cache converted versions

3. **Bandwidth Optimization**
   - Use CloudFront edge caching
   - Implement byte-range requests
   - Serve different qualities based on connection speed

4. **Storage Optimization**
   - Delete old encoding attempts
   - Archive completed courses
   - Use S3 Intelligent Tiering

---

## Security Considerations

1. **Protect Video URLs**
   ```python
   # Use signed URLs that expire
   from boto3 import client
   
   s3 = client('s3')
   url = s3.generate_presigned_url(
       'get_object',
       Params={'Bucket': 'teachify-videos', 'Key': 'video.mp4'},
       ExpiresIn=3600  # 1 hour
   )
   ```

2. **Access Control**
   - Only enrolled students can watch
   - Track WHO watches WHAT
   - Implement rate limiting

3. **DRM (Digital Rights Management)**
   - Consider Widevine for premium courses
   - Watermarking
   - Download restrictions

---

## Resources

- AWS S3: https://aws.amazon.com/s3/
- django-storages: https://django-storages.readthedocs.io/
- FFmpeg: https://ffmpeg.org/
- HLS Spec: https://tools.ietf.org/html/draft-pantos-http-live-streaming
- Celery: https://docs.celeryproject.io/
