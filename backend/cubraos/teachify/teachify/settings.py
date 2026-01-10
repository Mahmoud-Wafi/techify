import os
from decouple import config

from pathlib import Path
from datetime import timedelta

# 1️⃣ المسارات الأساسية
BASE_DIR = Path(__file__).resolve().parent.parent

# 2️⃣ إعدادات الأمان الأساسية
SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', default=True, cast=bool)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

ALLOWED_HOSTS = ['*']

# 3️⃣ التطبيقات المثبتة (مقسمة لسهولة القراءة)
INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # مكتبات الطرف الثالث (Third-party)
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist', # لإبطال التوكنات القديمة عند الخروج

    # تطبيقات المشروع المحلية (Local Apps)
    'apps.accounts',
    'apps.branding',
    'apps.common',
    'apps.courses',
    'apps.exams',
    # UI UX ADMIN PANEL 
    
]

# 4️⃣ الميدل وير (الترتيب هنا جوهري للأمان)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # يجب أن يكون أول سطر لخدمة الـ React
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # New 
]

ROOT_URLCONF = 'teachify.urls'

# 5️⃣ إعدادات الـ CORS (تسمح للفرونت إند بالتحدث مع الباكيند)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# 6️⃣ إعدادات REST Framework و JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 7️⃣ قاعدة البيانات (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'master',
        'USER': 'postgres',
        'PASSWORD': 'cubra2004',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# 8️⃣ إعدادات القوالب واللغة
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# 9️⃣ الملفات الثابتة والميديا (عشان الصور والفيديوهات تظهر)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# 🔟 موديل المستخدم المخصص
AUTH_USER_MODEL = 'accounts.User'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



LANGUAGES = [
    ('en', 'English'),
    ('ar', 'Arabic'),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]


##################################################################################################
# ============================================
# JAZZMIN SETTINGS - TEACHIFY CONFIGURATION
# ============================================

JAZZMIN_SETTINGS = {
    # ===== BRANDING =====
    "site_title": "Teachify Admin",
    "site_header": "Teachify Educational Platform",
    "site_brand": "Teachify",
    "site_logo": "images/logo.png",  # Place your logo in static/images/
    "site_logo_classes": "img-circle",  # Optional: makes logo circular
    "site_icon": "images/favicon.ico",  # Browser tab icon
    
    # Welcome text on the login screen
    "welcome_sign": "Welcome to Teachify Admin Panel",
    
    # Copyright on the footer
    "copyright": "Teachify Educational Platform © 2024",
    
    # ===== SEARCH BAR =====
    "search_model": ["auth.User", "courses.Course", "exams.Exam"],
    
    # ===== USER MENU =====
    "user_avatar": None,  # Field name for user avatar (e.g., "avatar")
    
    # ===== TOP MENU =====
    "topmenu_links": [
        # Custom links in top menu
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site", "url": "/", "new_window": True},
        {"name": "Support", "url": "https://github.com/yourusername/teachify/issues", "new_window": True},
        
        # Model shortcuts
        {"model": "auth.User"},
        {"model": "courses.Course"},
        
        # App with dropdown
        {"app": "courses"},
    ],
    
    # ===== USER MENU LINKS =====
    "usermenu_links": [
        {"name": "View Site", "url": "/", "new_window": True},
        {"model": "auth.user"},
    ],
    
    # ===== SIDE MENU =====
    "show_sidebar": True,
    "navigation_expanded": True,  # Expand navigation by default
    "hide_apps": [],  # List of apps to hide
    "hide_models": [],  # List of models to hide
    
    # Custom ordering and icons for apps and models
    "order_with_respect_to": [
        "auth",
        "accounts",
        "courses",
        "exams",
        "common",
    ],
    
    # Custom app and model icons (Font Awesome 5)
    "icons": {
        # Auth app
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        
        # Accounts app
        "accounts.User": "fas fa-user-graduate",
        "accounts.Profile": "fas fa-id-card",
        
        # Courses app
        "courses": "fas fa-book-open",
        "courses.Course": "fas fa-book",
        "courses.Category": "fas fa-folder",
        "courses.Enrollment": "fas fa-user-check",
        "courses.Lesson": "fas fa-chalkboard-teacher",
        "courses.Material": "fas fa-file-pdf",
        
        # Exams app
        "exams": "fas fa-clipboard-list",
        "exams.Exam": "fas fa-file-alt",
        "exams.Question": "fas fa-question-circle",
        "exams.StudentExamAttempt": "fas fa-tasks",
        "exams.StudentAnswer": "fas fa-check-circle",
        "exams.Certificate": "fas fa-certificate",
        
        # Common app
        "common": "fas fa-cog",
        "common.Notification": "fas fa-bell",
        "common.Settings": "fas fa-sliders-h",
    },
    
    # Custom app labels (optional)
    "custom_links": {
        "courses": [{
            "name": "Import Courses",
            "url": "/admin/courses/import/",
            "icon": "fas fa-file-import",
            "permissions": ["courses.add_course"]
        }],
        "exams": [{
            "name": "Export Results",
            "url": "/admin/exams/export/",
            "icon": "fas fa-file-export",
            "permissions": ["exams.view_studentexamattempt"]
        }]
    },
    
    # ===== UI TWEAKS =====
    "show_ui_builder": False,  # Hide UI builder button (set True for customization)
    
    "changeform_format": "horizontal_tabs",  # or "vertical_tabs", "collapsible", "carousel"
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
    
    # Related modal (for ForeignKey fields)
    "related_modal_active": True,
    
    # ===== LANGUAGE =====
    "language_chooser": True,  # Show language switcher
}

# ============================================
# JAZZMIN UI TWEAKS (Colors, Fonts, etc.)
# ============================================

JAZZMIN_UI_TWEAKS = {
    # ===== THEME =====
    "navbar": "navbar-dark",  # navbar-dark or navbar-light
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",  # Color scheme
    
    # Sidebar colors: 
    # sidebar-dark-{primary|secondary|info|warning|danger|success}
    # sidebar-light-{primary|secondary|info|warning|danger|success}
    
    # ===== BRAND COLORS =====
    # Primary brand color (used for links, buttons, etc.)
    "brand_color": "navbar-primary",  # primary, secondary, info, warning, danger, success
    "brand_small_text": False,
    
    # Accent color (used for active items)
    "accent": "accent-primary",  # accent-{primary|secondary|info|warning|danger|success}
    
    # ===== BUTTONS =====
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    
    # ===== CUSTOM CSS =====
    "custom_css": "css/custom_admin.css",  # Path to custom CSS file
    "custom_js": "js/custom_admin.js",  # Path to custom JS file
    
    # ===== DARK MODE =====
    "theme": "default",  # default, darkly, solar, superhero, slate, etc.
    # Available themes: cerulean, cosmo, cyborg, darkly, flatly, journal, 
    # litera, lumen, lux, materia, minty, pulse, sandstone, simplex, slate, 
    # solar, spacelab, superhero, united, yeti
    
    # ===== ACTIONS =====
    "actions_sticky_top": True,  # Keep action dropdown visible when scrolling
}

# ============================================
# OPTIONAL: CUSTOM ADMIN STYLING
# ============================================

# Create: static/css/custom_admin.css
"""
/* Custom Teachify Admin Styles */

/* Logo styling */
.brand-link .brand-image {
    max-height: 40px;
    width: auto;
}

/* Custom primary color (Educational Purple/Blue) */
:root {
    --primary-color: #6366f1;  /* Indigo */
    --secondary-color: #8b5cf6;  /* Purple */
    --success-color: #10b981;  /* Green */
    --info-color: #3b82f6;  /* Blue */
    --warning-color: #f59e0b;  /* Amber */
    --danger-color: #ef4444;  /* Red */
}

/* Sidebar customization */
.sidebar-dark-primary .nav-sidebar>.nav-item>.nav-link.active {
    background-color: var(--primary-color);
    color: #fff;
}

/* Cards styling */
.card {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Button enhancements */
.btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

.btn-primary:hover {
    background-color: #4f46e5;
    border-color: #4f46e5;
}

/* Dashboard stats cards */
.small-box {
    border-radius: 8px;
    transition: transform 0.2s;
}

.small-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Table improvements */
.table thead th {
    background-color: #f9fafb;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
}

/* Login page customization */
.login-page {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
}

/* Form improvements */
.form-control:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

/* Breadcrumb styling */
.breadcrumb {
    background-color: transparent;
    padding: 0;
}

/* Status badges */
.badge {
    padding: 0.35em 0.65em;
    font-size: 0.875rem;
    font-weight: 500;
}
"""


