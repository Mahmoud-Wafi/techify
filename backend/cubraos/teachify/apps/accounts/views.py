from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

# استيراد السيريالايزر الموحد والمحدث
from .serializers import (
    RegisterSerializer, 
    CustomTokenObtainPairSerializer, 
    UserSerializer
)

User = get_user_model()

# ==========================================
# 01. AUTHENTICATION (التوثيق)
# ==========================================

class RegisterView(generics.CreateAPIView):
    """إنشاء حساب جديد لجميع الأدوار"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    """تسجيل الدخول والحصول على JWT Token"""
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    """جلب بيانات المستخدم المسجل حالياً بالكامل"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================================
# 02. USER MANAGEMENT (إدارة المستخدمين)
# ==========================================

class InstructorListView(generics.ListAPIView):
    """قائمة المدرسين فقط"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='instructor').order_by('-date_joined')


class StudentListView(generics.ListAPIView):
    """قائمة الطلاب فقط"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='student').order_by('-date_joined')