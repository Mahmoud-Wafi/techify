from rest_framework import serializers
from .models import (
    Exam,
    Question,
    StudentExamAttempt,
    StudentAnswer,
    Certificate,
)
Teachify Logo
# =========================
# QUESTIONS
# =========================

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        exclude = ["correct_option"]


# =========================
# EXAMS
# =========================

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = "__all__"


# =========================
# STUDENT ANSWERS
# =========================

class StudentAnswerSerializer(serializers.ModelSerializer):
    is_correct = serializers.ReadOnlyField()

    class Meta:
        model = StudentAnswer
        fields = [
            "id",
            "attempt",
            "question",
            "selected_option",
            "is_correct",
        ]


# =========================
# EXAM ATTEMPTS
# =========================

class StudentExamAttemptSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    student = serializers.ReadOnlyField(source="student.id")
    score = serializers.ReadOnlyField()
    is_passed = serializers.ReadOnlyField()
    started_at = serializers.ReadOnlyField()
    finished_at = serializers.ReadOnlyField()

    class Meta:
        model = StudentExamAttempt
        fields = [
            "id",
            "exam",
            "student",
            "score",
            "started_at",
            "finished_at",
            "is_passed",
            "answers",
        ]


# =========================
# CERTIFICATES
# =========================

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = "__all__"
from rest_framework import serializers
from .models import (
    Exam,
    Question,
    StudentExamAttempt,
    StudentAnswer,
    Certificate,
)

# =========================
# QUESTIONS
# =========================

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        exclude = ["correct_option"]


# =========================
# EXAMS
# =========================

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = "__all__"


# =========================
# STUDENT ANSWERS
# =========================

class StudentAnswerSerializer(serializers.ModelSerializer):
    is_correct = serializers.ReadOnlyField()

    class Meta:
        model = StudentAnswer
        fields = [
            "id",
            "attempt",
            "question",
            "selected_option",
            "is_correct",
        ]


# =========================
# EXAM ATTEMPTS
# =========================

class StudentExamAttemptSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    student = serializers.ReadOnlyField(source="student.id")
    score = serializers.ReadOnlyField()
    is_passed = serializers.ReadOnlyField()
    started_at = serializers.ReadOnlyField()
    finished_at = serializers.ReadOnlyField()

    class Meta:
        model = StudentExamAttempt
        fields = [
            "id",
            "exam",
            "student",
            "score",
            "started_at",
            "finished_at",
            "is_passed",
            "answers",
        ]


# =========================
# CERTIFICATES
# =========================

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = "__all__"
