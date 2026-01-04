from django.contrib import admin
from .models import (
    Course,
    Lesson,
    Category,
    Enrollment,
    LessonProgress,
    WishlistItem,
)

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Category)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)
admin.site.register(WishlistItem)

