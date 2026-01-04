from rest_framework import serializers
from .models import Course, Lesson, Category, Enrollment, LessonProgress, WishlistItem
from django.contrib.auth import get_user_model

User = get_user_model()

# ==========================================
# 01. CATEGORY SERIALIZER (تم حل مشكلة الـ icon)
# ==========================================
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        # تم حذف 'icon' لأنه غير موجود بالموديل ويسبب ImproperlyConfigured
        fields = ["id", "name", "slug"] 
        read_only_fields = ["id", "slug"]


# ==========================================
# 02. LESSON SERIALIZER 
# ==========================================
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "course", "title", "description", "video_url", "order"]
        read_only_fields = ["id"]


# ==========================================
# 03. LESSON PROGRESS SERIALIZER
# ==========================================
class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.ReadOnlyField(source="lesson.title")

    class Meta:
        model = LessonProgress
        fields = [
            "id", "lesson", "lesson_title", "student", 
            "is_completed", "completed_at", "progress_percent"
        ]
        read_only_fields = ["student", "completed_at", "progress_percent"]


# ==========================================
# 04. ENROLLMENT SERIALIZER
# ==========================================
class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")
    student_email = serializers.ReadOnlyField(source="student.email")

    class Meta:
        model = Enrollment
        fields = ["id", "student", "student_email", "course", "course_title", "enrolled_at"]
        read_only_fields = ["id", "student", "enrolled_at"]


# ==========================================
# 05. COURSE SERIALIZER
# ==========================================
class CourseSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    category_details = CategorySerializer(source="category", read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "instructor", "title", "description", 
            "category", "category_details", "price", "thumbnail", 
            "created_at", "lessons", "is_enrolled"
        ]
        read_only_fields = ["id", "instructor", "created_at"]
    # hint ==============
    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.enrollments.filter(student=request.user).exists()


# ==========================================
# 06. WISHLIST SERIALIZER
# ==========================================
class WishlistSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source="course.title")
    course_thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ["id", "student", "course", "course_title", "course_thumbnail", "created_at"]
        read_only_fields = ["id", "student", "created_at"]

    def get_course_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.course.thumbnail:
            try:
                return request.build_absolute_uri(obj.course.thumbnail.url) if request else obj.course.thumbnail.url
            except:
                return None
        return None