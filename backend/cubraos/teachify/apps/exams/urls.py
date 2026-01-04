from rest_framework.routers import DefaultRouter
from .views import (
    ExamViewSet,
    QuestionViewSet,
    StudentExamAttemptViewSet,
    StudentAnswerViewSet
)
from .views import CertificateViewSet


router = DefaultRouter()

router.register("exams", ExamViewSet, basename="exams")
router.register("questions", QuestionViewSet, basename="questions")
router.register("attempts", StudentExamAttemptViewSet, basename="attempts")
router.register("answers", StudentAnswerViewSet, basename="answers")
router.register("certificates", CertificateViewSet, basename="certificates")



urlpatterns = router.urls
