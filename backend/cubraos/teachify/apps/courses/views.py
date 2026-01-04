from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Count, Avg, Q
from django.contrib.auth import get_user_model

# استيراد الإشعارات 🔔
from apps.common.models import Notification

from .models import (
    Course, Lesson, Category,
    Enrollment, LessonProgress, WishlistItem
)
from .serializers import (
    CourseSerializer, LessonSerializer, CategorySerializer,
    EnrollmentSerializer, LessonProgressSerializer, WishlistSerializer
)

User = get_user_model()

# ============================
# 🛡️ 01. الأذونات (Permissions)
# ============================
class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "instructor"

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "student"

# ============================
# 📚 02. الكورسات والدروس
# ============================
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsInstructor()]
        return [permissions.AllowAny()]
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsInstructor()]
        return [permissions.AllowAny()]

# ============================
# ❤️ 03. المفضلة والاشتراكات
# ============================
class WishlistViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, 
                      mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    def get_queryset(self):
        return WishlistItem.objects.filter(student=self.request.user)
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

# ============================
# 📊 04. لوحات التحكم
# ============================
class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    def list(self, request):
        enrollments = Enrollment.objects.filter(student=request.user)
        lessons_count = Lesson.objects.filter(course__enrollments__student=request.user).count()
        completed_count = LessonProgress.objects.filter(student=request.user, is_completed=True).count()
        return Response({
            "total_enrolled_courses": enrollments.count(),
            "total_completed_lessons": completed_count,
            "wishlist_count": WishlistItem.objects.filter(student=request.user).count(),
        })

class InstructorDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsInstructor]
    def list(self, request):
        courses = Course.objects.filter(instructor=request.user)
        return Response({
            "total_courses": courses.count(),
            "total_students": Enrollment.objects.filter(course__in=courses).values("student").distinct().count(),
        })

class TopStudentsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsInstructor]
    def list(self, request):
        top = User.objects.filter(role="student").annotate(
            c_count=Count('lesson_progress', filter=Q(lesson_progress__is_completed=True))
        ).order_by('-c_count')[:10]
        return Response([{"username": s.username, "completed": s.c_count} for s in top])

# ============================
# 🏷️ 05. التقدم (المنطق المعدل) 👈
# ============================
class LessonProgressViewSet(viewsets.ModelViewSet):
    queryset = LessonProgress.objects.all()
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def perform_create(self, serializer):
        # حفظ التقدم الدراسي
        progress = serializer.save(student=self.request.user)

        # ⚡ منطق الإشعارات الجديد
        if progress.is_completed:
            completed_count = LessonProgress.objects.filter(
                student=self.request.user, is_completed=True
            ).count()

            # تحفيز الطالب عند الوصول لأرقام معينة
            if completed_count in [1, 3, 5, 10]:
                Notification.objects.create(
                    user=self.request.user,
                    title="إنجاز جديد 🏆",
                    message=f"لقد أكملت {completed_count} دروس حتى الآن. استمر في التألق!",
                    type="success"
                )

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]