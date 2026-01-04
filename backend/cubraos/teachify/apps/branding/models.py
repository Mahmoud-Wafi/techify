from django.db import models

class SiteSettings(models.Model):
    # نستخدم Singleton Pattern (صف واحد فقط في الداتابيز لكل موقع)
    site_name = models.CharField(max_length=100, default="Teachify")
    logo = models.ImageField(upload_to="branding/", null=True, blank=True)
    favicon = models.ImageField(upload_to="branding/", null=True, blank=True)
    
    # ألوان الموقع (عشان الفرونت يلون نفسه أوتوماتيك)
    primary_color = models.CharField(max_length=7, default="#007bff", help_text="Hex Code like #000000")
    secondary_color = models.CharField(max_length=7, default="#6c757d")
    
    # روابط السوشيال
    facebook_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.site_name

    def save(self, *args, **kwargs):
        # نضمن أنه لا يوجد سوى إعدادات واحدة فقط
        if not self.pk and SiteSettings.objects.exists():
            return SiteSettings.objects.first()
        return super().save(*args, **kwargs)