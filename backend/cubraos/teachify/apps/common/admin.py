from django.contrib import admin
from .models import Notification, CertificateRequest


# -------------------------
# Notification Admin
# -------------------------

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "title",
        "type",
        "is_read",
        "created_at",
    )
    list_filter = (
        "type",
        "is_read",
        "created_at",
    )
    search_fields = (
        "user__username",
        "title",
        "message",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)


# -------------------------
# Certificate Request Admin
# -------------------------

@admin.register(CertificateRequest)
class CertificateRequestAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "instructor",
        "course_title",
        "status",
        "created_at",
    )
    list_filter = (
        "status",
        "created_at",
    )
    search_fields = (
        "student__username",
        "instructor__username",
        "course_title",
    )
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
