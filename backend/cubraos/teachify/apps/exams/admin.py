from django.contrib import admin
from .models import (
    Exam,
    Question,
    StudentExamAttempt,
    StudentAnswer,
    Certificate,
)


# -------------------------
# Inline Admins
# -------------------------

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


class StudentAnswerInline(admin.TabularInline):
    model = StudentAnswer
    extra = 0
    readonly_fields = ("is_correct",)


# -------------------------
# Exam Admin
# -------------------------

@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "time_limit",
        "total_marks",
        "publish_date",
    )
    list_filter = ("course", "publish_date")
    search_fields = ("title", "course__title")
    ordering = ("-publish_date",)
    inlines = [QuestionInline]


# -------------------------
# Question Admin
# -------------------------

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        "short_question",
        "exam",
        "correct_option",
        "mark",
    )
    list_filter = ("exam",)
    search_fields = ("question_text",)

    def short_question(self, obj):
        return obj.question_text[:50]

    short_question.short_description = "Question"


# -------------------------
# Student Exam Attempt Admin
# -------------------------

@admin.register(StudentExamAttempt)
class StudentExamAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "exam",
        "score",
        "is_passed",
        "started_at",
        "finished_at",
    )
    list_filter = ("is_passed", "exam")
    search_fields = ("student__username", "exam__title")
    readonly_fields = ("started_at",)
    inlines = [StudentAnswerInline]


# -------------------------
# Student Answer Admin
# -------------------------

@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = (
        "attempt",
        "question",
        "selected_option",
        "is_correct",
    )
    list_filter = ("is_correct",)
    search_fields = ("attempt__student__username",)


# -------------------------
# Certificate Admin
# -------------------------

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = (
        "certificate_code",
        "student",
        "exam",
        "issued_at",
    )
    search_fields = (
        "certificate_code",
        "verification_code",
        "student__username",
        "exam__title",
    )
    readonly_fields = ("issued_at",)
