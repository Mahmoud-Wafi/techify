from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("warning", "Warning"),
        ("success", "Success"),
        ("info", "Info"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default="info")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at'] # 👈 الترتيب التنازلي (الأحدث فوق)

    def __str__(self):
        return f"{self.user} - {self.title}"