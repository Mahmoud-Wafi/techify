from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    # إظهار اسم المستخدم الموجه إليه الإشعار للقراءة فقط للسهولة
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Notification
        # تأكد من وجود 'user' هنا لكي يظهر للمدرس في القائمة المنسدلة
        fields = [
            'id', 'user', 'user_name', 'title', 
            'message', 'type', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']