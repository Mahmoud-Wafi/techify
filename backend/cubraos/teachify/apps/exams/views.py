from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.shortcuts import get_object_or_404
import uuid

from .models import (
    Exam,
    Question,
    StudentExamAttempt,
    StudentAnswer,
    Certificate,
)
from .serializers import (
    ExamSerializer,
    QuestionSerializer,
    StudentExamAttemptSerializer,
    StudentAnswerSerializer,
    CertificateSerializer,
)

# =====================================================
# PERMISSIONS
# =====================================================

class IsInstructor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "instructor"

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "student"

# =====================================================
# QUESTIONS
# =====================================================

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsInstructor()]
        return [permissions.IsAuthenticated()]

# =====================================================
# EXAMS
# =====================================================

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsInstructor()]
        return [permissions.IsAuthenticated()]

    # -----------------------------------------
    # STUDENT SUBMIT EXAM
    # POST /api/exams/{id}/submit/
    # -----------------------------------------
    @action(detail=True, methods=["post"], permission_classes=[IsStudent])
    def submit(self, request, pk=None):
        exam = self.get_object()
        student = request.user
        answers = request.data.get("answers", [])

        # 🔹 الحصول على attempt مفتوح أو جديد
        attempt, _ = StudentExamAttempt.objects.get_or_create(
            student=student,
            exam=exam,
            finished_at__isnull=True,
            defaults={"started_at": timezone.now()},
        )

        # 🔹 حساب total_marks لكل الأسئلة
        questions = Question.objects.filter(exam=exam)
        total_marks = sum(q.mark for q in questions)
        obtained_marks = 0

        # 🔹 معالجة إجابات الطالب
        for ans in answers:
            question = get_object_or_404(
                Question,
                id=ans["question"],
                exam=exam
            )

            selected = ans["selected_option"].upper()
            is_correct = selected == question.correct_option.upper()

            StudentAnswer.objects.update_or_create(
                attempt=attempt,
                question=question,
                defaults={
                    "selected_option": selected,
                    "is_correct": is_correct
                }
            )

            if is_correct:
                obtained_marks += question.mark

        # 🔹 حساب الدرجة النهائية
        score = (obtained_marks / total_marks) * 100 if total_marks else 0
        attempt.score = score
        attempt.is_passed = score >= 50
        attempt.finished_at = timezone.now()
        attempt.save()

        # 🔹 إنشاء الشهادة لو ناجح
        if attempt.is_passed:
            Certificate.objects.get_or_create(
                attempt=attempt,
                student=student,
                exam=exam,
                defaults={
                    "certificate_code": uuid.uuid4().hex[:10].upper(),
                    "verification_code": uuid.uuid4().hex[:10].upper(),
                }
            )

        return Response({
            "attempt_id": attempt.id,
            "score": score,
            "is_passed": attempt.is_passed,
        })

# =====================================================
# STUDENT EXAM ATTEMPTS
# =====================================================

class StudentExamAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    - الطالب يشوف محاولاته فقط
    - الإنستراكتور يشوف الكل
    """
    queryset = StudentExamAttempt.objects.all()
    serializer_class = StudentExamAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return StudentExamAttempt.objects.filter(student=user)
        return StudentExamAttempt.objects.all()

# =====================================================
# STUDENT ANSWERS
# =====================================================

class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update"]:
            return [IsStudent()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return StudentAnswer.objects.filter(attempt__student=user)
        return StudentAnswer.objects.all()

    def perform_create(self, serializer):
        attempt = serializer.validated_data["attempt"]
        if attempt.student != self.request.user:
            raise permissions.PermissionDenied(
                "You cannot submit answers for another student."
            )
        serializer.save()

# =====================================================
# CERTIFICATES
# =====================================================

class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Certificate.objects.filter(student=user)
        return Certificate.objects.all()
