from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# ==========================================
# 01. USER DATA SERIALIZER (عرض البيانات)
# ==========================================
class UserSerializer(serializers.ModelSerializer):
    """مخصص لعرض بيانات المستخدم في أي مكان في النظام"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone_number', 'avatar', 'is_verified']
        read_only_fields = ['is_verified']


# ==========================================
# 02. REGISTER SERIALIZER (إنشاء حساب)
# ==========================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ["email", "username", "password", "role", "phone_number", "avatar"]
        extra_kwargs = {
            'username': {'required': False}, # اختياري لأننا نولده في الـ save() داخل الموديل
        }

    def create(self, validated_data):
        # إنشاء المستخدم باستخدام الميثود المخصصة لضمان تشفير الباسورد
        user = User.objects.create_user(**validated_data)
        return user


# ==========================================
# 03. LOGIN SERIALIZER (تخصيص الـ JWT)
# ==========================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # بيانات مشفرة داخل الـ Payload (لا تظهر إلا بفك التشفير)
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # بيانات واضحة للفرونت إند (React) في الرد المباشر
        # نستخدم UserSerializer لضمان توحيد شكل البيانات
        data['user'] = UserSerializer(self.user, context=self.context).data
        return data