from rest_framework import serializers
from .models import Notification, CertificateRequest
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


class CertificateRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    instructor_name = serializers.ReadOnlyField(source='instructor.username')

    class Meta:
        model = CertificateRequest
        fields = [
            'id', 'student', 'student_name', 'instructor', 'instructor_name',
            'course_title', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'student_name', 'instructor_name', 'created_at', 'updated_at']