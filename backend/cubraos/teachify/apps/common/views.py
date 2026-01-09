from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Notification, CertificateRequest
from .serializers import NotificationSerializer, CertificateRequestSerializer

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


class CertificateRequestViewSet(viewsets.ModelViewSet):
    """
    Certificate request system for students
    Students can request certificates, instructors can approve/reject
    """
    serializer_class = CertificateRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "instructor":
            # Instructors see requests sent to them
            return CertificateRequest.objects.filter(instructor=user).order_by("-created_at")
        else:
            # Students see their own requests
            return CertificateRequest.objects.filter(student=user).order_by("-created_at")

    def perform_create(self, serializer):
        # Set the current user as the student making the request
        # Instructor will be extracted from request data
        cert_request = serializer.save(student=self.request.user)
        
        # Create notification for instructor
        if cert_request.instructor:
            Notification.objects.create(
                user=cert_request.instructor,
                title="Certificate Request Received",
                message=f"{cert_request.student.username} requested a certificate for {cert_request.course_title}",
                type="info"
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Instructor approves a certificate request"""
        cert_request = self.get_object()
        
        if cert_request.instructor != request.user:
            return Response(
                {"error": "You can only approve requests sent to you"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cert_request.status = "approved"
        cert_request.save()
        
        # Create notification for student
        Notification.objects.create(
            user=cert_request.student,
            title="Certificate Approved ✅",
            message=f"Your certificate request for {cert_request.course_title} has been approved!",
            type="success"
        )
        
        return Response({"detail": "Certificate request approved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Instructor rejects a certificate request"""
        cert_request = self.get_object()
        
        if cert_request.instructor != request.user:
            return Response(
                {"error": "You can only reject requests sent to you"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        cert_request.status = "rejected"
        cert_request.save()
        
        # Create notification for student
        Notification.objects.create(
            user=cert_request.student,
            title="Certificate Request Rejected",
            message=f"Your certificate request for {cert_request.course_title} was not approved.",
            type="warning"
        )
        
        return Response({"detail": "Certificate request rejected"}, status=status.HTTP_200_OK)