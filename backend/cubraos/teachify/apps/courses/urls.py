from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    LessonViewSet,
    CategoryViewSet,
    EnrollmentViewSet,
    LessonProgressViewSet,
    WishlistViewSet,
    DashboardViewSet,
    InstructorDashboardViewSet,
    TopStudentsViewSet,
)

router = DefaultRouter()

router.register("courses", CourseViewSet, basename="courses")
router.register("lessons", LessonViewSet, basename="lessons")
router.register("categories", CategoryViewSet, basename="categories")
router.register("enrollments", EnrollmentViewSet, basename="enrollments")
router.register("progress", LessonProgressViewSet, basename="progress")
router.register("wishlist", WishlistViewSet, basename="wishlist")

router.register("dashboard", DashboardViewSet, basename="dashboard")
router.register(
    "instructor/dashboard",
    InstructorDashboardViewSet,
    basename="instructor-dashboard"
)


router.register(
    "top-students",
    TopStudentsViewSet,
    basename="top-students"
)


urlpatterns = router.urls
