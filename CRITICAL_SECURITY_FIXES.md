# CRITICAL: Security Fixes Required Before Production

## 🔴 RISK LEVEL: HIGH

Your current implementation allows **anyone to watch videos without paying/enrolling**.

---

## Issue #1: No Access Control

### The Problem
```
User A (not enrolled):
1. Gets video URL from browser (DevTools → Network)
2. Shares URL with friends
3. Friends can watch for free

What should happen:
Only enrolled students should be able to watch
```

### Current Code (UNSAFE)
```typescript
<video src={getFullVideoUrl(activeLesson.video_url)} />
// Anyone with URL can watch!
```

### Solution: Create Protected Video Endpoint

**Backend: `apps/courses/views.py`**
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import FileResponse
import os

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stream_video(request, lesson_id):
    """
    Protected video streaming endpoint
    Only enrolled students can watch
    """
    try:
        # Get lesson
        lesson = Lesson.objects.get(id=lesson_id)
        
        # Check if user is enrolled
        is_enrolled = Enrollment.objects.filter(
            student=request.user,
            course=lesson.course
        ).exists()
        
        # Check if instructor
        is_instructor = lesson.course.instructor == request.user
        
        # Allow only enrolled students or instructor
        if not (is_enrolled or is_instructor):
            return Response(
                {'error': 'You are not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Log video view for analytics
        VideoView.objects.update_or_create(
            student=request.user,
            lesson=lesson,
            defaults={'last_viewed': timezone.now()}
        )
        
        # Stream video file
        video_path = lesson.video_url
        if settings.DEBUG:
            # Local file
            file_path = os.path.join(settings.MEDIA_ROOT, video_path)
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Type'] = 'video/mp4'
            return response
        else:
            # Cloud storage (S3) - return signed URL
            return Response({
                'video_url': generate_signed_s3_url(video_path)
            })
            
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Lesson not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

**Backend: `apps/courses/urls.py`**
```python
from django.urls import path
from . import views

urlpatterns = [
    # ... existing URLs ...
    
    # Protected video endpoint
    path('lessons/<int:lesson_id>/stream/', 
         views.stream_video, 
         name='stream-video'),
]
```

**Frontend: `CoursePlayer.tsx`**
```typescript
// Instead of direct video URL, use protected endpoint
const getVideoStreamUrl = (lessonId: number) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${baseUrl}/api/courses/lessons/${lessonId}/stream/`;
};

// Update video element
<video
  src={getVideoStreamUrl(activeLesson.id)}
  controls
/>
```

---

## Issue #2: No Upload Validation

### The Problem
```
User uploads:
- 10GB files → Server storage fills up → System crashes
- .exe files → Security risk
- Corrupted files → Application errors
```

### Solution: Add Backend Validation

**Backend: `instructor_views.py`**
```python
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

# Constants
ALLOWED_VIDEO_TYPES = {
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'video/quicktime': ['.mov'],
    'video/x-msvideo': ['.avi'],
}

MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB
MIN_DURATION = 5  # seconds
MAX_DURATION = 3600 * 4  # 4 hours

def validate_video_file(video_file):
    """Validate uploaded video file"""
    
    # Check file size
    if video_file.size > MAX_VIDEO_SIZE:
        raise ValidationError(
            f'Video too large. Maximum size is {MAX_VIDEO_SIZE/1024/1024:.0f}MB'
        )
    
    # Check file type
    if video_file.content_type not in ALLOWED_VIDEO_TYPES:
        raise ValidationError(
            f'Invalid video format. Allowed: MP4, WebM, MOV, AVI'
        )
    
    # Check file extension
    import os
    ext = os.path.splitext(video_file.name)[1].lower()
    if ext not in [e for exts in ALLOWED_VIDEO_TYPES.values() for e in exts]:
        raise ValidationError(
            f'Invalid file extension: {ext}'
        )
    
    # Verify video integrity (check magic bytes)
    file_header = video_file.read(12)
    video_file.seek(0)  # Reset file pointer
    
    # MP4 signature: 'ftyp' at byte 4
    if video_file.content_type == 'video/mp4':
        if file_header[4:8] != b'ftyp':
            raise ValidationError('Invalid MP4 file')
    
    # WebM signature: 'WEBM'
    elif video_file.content_type == 'video/webm':
        if not file_header.startswith(b'\x1a\x45\xdf\xa3'):
            raise ValidationError('Invalid WebM file')

@api_view(['POST'])
@permission_classes([IsInstructor])
def create_course_lesson(request, course_id):
    """Create lesson with validated video"""
    
    try:
        # Get course
        course = Course.objects.get(id=course_id, instructor=request.user)
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get data
    title = request.data.get('title')
    description = request.data.get('description', '')
    video_file = request.FILES.get('video')
    
    # Validate inputs
    if not title:
        return Response(
            {'error': 'Title is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not video_file:
        return Response(
            {'error': 'Video file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate video
    try:
        validate_video_file(video_file)
    except ValidationError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Save video
    try:
        import os, uuid
        from django.core.files.storage import default_storage
        
        ext = os.path.splitext(video_file.name)[1]
        filename = f"videos/{course.id}/{uuid.uuid4().hex}{ext}"
        path = default_storage.save(filename, video_file)
        video_url = f"/media/{path}"
        
        # Create lesson
        lesson = Lesson.objects.create(
            course=course,
            title=title,
            description=description,
            video_url=video_url
        )
        
        # Return success
        from .serializers import LessonSerializer
        return Response(
            LessonSerializer(lesson).data,
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': f'Failed to save video: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

---

## Issue #3: Poor Error Handling

### The Problem
```
Video fails silently → User confused → No idea what's wrong
```

### Solution: Better Error Messages

**Frontend: `CoursePlayer.tsx`**
```typescript
const [videoError, setVideoError] = useState<string | null>(null);

const handleVideoError = (error: any) => {
  console.error('Video error:', error);
  
  const errorMap: { [key: number]: string } = {
    1: 'Video loading was aborted',
    2: 'Network error while loading video',
    3: 'Video decoding failed',
    4: 'Video format not supported',
  };
  
  const errorCode = error.target?.error?.code;
  const errorMessage = errorMap[errorCode] || 'Unknown video error';
  
  setVideoError(
    isEn 
      ? errorMessage 
      : 'حدث خطأ في تحميل الفيديو'
  );
};

return (
  <div className="w-full mb-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {isEn ? "Video Lesson" : "درس الفيديو"}
      </h3>
      {activeLesson?.video_url && !videoError && (
        <button
          onClick={handleDownloadVideo}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors text-sm font-medium"
        >
          <Download size={16} />
          {isEn ? "Download" : "تحميل"}
        </button>
      )}
    </div>
    
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
      {videoError ? (
        <div className="h-full flex flex-col items-center justify-center text-red-400">
          <AlertCircle size={48} className="mb-4" />
          <p className="text-sm font-medium text-center px-4">{videoError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-sm"
          >
            {isEn ? "Reload" : "أعد التحميل"}
          </button>
        </div>
      ) : activeLesson?.video_url ? (
        <video
          src={getVideoStreamUrl(activeLesson.id)}
          className="w-full h-full object-contain"
          controls
          key={activeLesson.id}
          onError={(e) => handleVideoError(e)}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500">
          {isEn ? "Select a Lesson" : "اختر درسًا"}
        </div>
      )}
    </div>
  </div>
);
```

---

## Issue #4: No Rate Limiting

### The Problem
```
User makes 1000 requests/second → Server overloaded → DoS attack
```

### Solution: Add Rate Limiting

**Backend: `settings.py`**
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # Unauthenticated users
        'user': '1000/hour', # Authenticated users
        'video_stream': '50/minute',  # Video streaming
    }
}
```

**Backend: `views.py`**
```python
from rest_framework.throttling import UserRateThrottle

class VideoStreamThrottle(UserRateThrottle):
    scope = 'video_stream'
    THROTTLE_RATES = {
        'video_stream': '50/minute'  # Max 50 requests per minute
    }

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@throttle_classes([VideoStreamThrottle])
def stream_video(request, lesson_id):
    # ... video streaming code ...
```

---

## Implementation Checklist

### Priority 1: CRITICAL (Do This Week)
- [ ] Implement protected video endpoint
- [ ] Add video access control (enrollment check)
- [ ] Add upload validation (size, format)
- [ ] Test thoroughly

### Priority 2: IMPORTANT (Do This Month)
- [ ] Add error handling/messages
- [ ] Add rate limiting
- [ ] Add logging for debugging
- [ ] Security audit

### Priority 3: NICE TO HAVE (Do Next Quarter)
- [ ] Add video logging/analytics
- [ ] Implement S3 signed URLs
- [ ] Add virus scanning
- [ ] Add content moderation

---

## Testing Checklist

```bash
# Test unauthorized access
curl http://localhost:8000/api/courses/lessons/1/stream/ -H "Authorization: Bearer INVALID_TOKEN"
# Should return 401 Unauthorized

# Test non-enrolled student
curl http://localhost:8000/api/courses/lessons/1/stream/ -H "Authorization: Bearer VALID_TOKEN_OF_NON_ENROLLED_USER"
# Should return 403 Forbidden

# Test enrolled student
curl http://localhost:8000/api/courses/lessons/1/stream/ -H "Authorization: Bearer VALID_TOKEN_OF_ENROLLED_USER"
# Should return 200 OK with video file

# Test invalid video format
curl -X POST http://localhost:8000/api/courses/1/lessons/ \
  -H "Authorization: Bearer TOKEN" \
  -F "title=Test" \
  -F "video=@image.jpg"
# Should return 400 Bad Request with error message

# Test oversized video
curl -X POST http://localhost:8000/api/courses/1/lessons/ \
  -H "Authorization: Bearer TOKEN" \
  -F "title=Test" \
  -F "video=@huge_file_10gb.mp4"
# Should return 400 Bad Request with size error
```

---

## Security Impact

| Issue | Risk Level | Impact | Fix Time |
|-------|-----------|--------|----------|
| No Access Control | 🔴 CRITICAL | Anyone can watch | 2-3 hours |
| No Upload Validation | 🔴 CRITICAL | System crash, malware | 1-2 hours |
| Poor Error Handling | 🟡 HIGH | User confusion, support burden | 1 hour |
| No Rate Limiting | 🟡 HIGH | DoS vulnerability | 30 minutes |

**Total Time to Fix All:** ~5-6 hours

**Before Launch:** MUST fix all CRITICAL items
**First Update:** Should fix HIGH items

---

## Recommendations

1. **This Week**: Implement access control + validation
2. **Next Week**: Add error handling + logging
3. **Before Launch**: Complete security audit
4. **Ongoing**: Monitor logs for suspicious activity

Your current implementation is GOOD functionally, but **MUST have security hardening before production**.
