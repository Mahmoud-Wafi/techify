from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """
    نظام إشعارات احترافي:
    **01** منع الطالب من الإرسال (POST).
    **02** السماح للمدرس بتحديد الطالب المستهدف.
    **03** عزل البيانات (علاقة 1:1 في العرض).
    """
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # التأكد من أن كل مستخدم يرى رسائله هو فقط وبترتيب الأحدث
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def get_permissions(self):
        # قفل باب الإرسال (create) في وجه أي شخص ليس "instructor"
        if self.action == 'create':
            class IsInstructorOnly(permissions.BasePermission):
                def has_permission(self, request, view):
                    return request.user.is_authenticated and request.user.role == "instructor"
            return [IsInstructorOnly()]
        
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # 🚀 الاحترافية: حفظ البيانات كما جاءت من المدرس (بما فيها الـ user المختار)
        serializer.save()

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"detail": "تم التحديد كمقروء ✅"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"detail": f"تم تحديد {count} رسائل كمقروءة 🔔"})