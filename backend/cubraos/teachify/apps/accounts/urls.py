from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomTokenObtainPairView, MeView

urlpatterns = [
    # 1. إنشاء حساب جديد    
    path("register/", RegisterView.as_view(), name="register"),

    # 2. تسجيل الدخول (يعود بالتوكن + بيانات المستخدم)
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),

    # 3. تجديد التوكن (مهم جداً للرياكت لكي لا يطلب الباسورد كل شوي)
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 4. جلب بيانات المستخدم الحالي
    path("me/", MeView.as_view(), name="me"),
]