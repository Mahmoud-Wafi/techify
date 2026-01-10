
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def admin_dashboard(request):
    # Get statistics
    from apps.courses.models import Course, Enrollment
    from apps.exams.models import Exam, Certificate
    from apps.accounts.models import User
    
    context = {
        'total_users': User.objects.count(),
        'total_students': User.objects.filter(role='student').count(),
        'total_instructors': User.objects.filter(role='instructor').count(),
        'total_courses': Course.objects.count(),
        'total_enrollments': Enrollment.objects.count(),
        'total_exams': Exam.objects.count(),
        'total_certificates': Certificate.objects.count(),
    }
    
    return render(request, 'admin/dashboard.html', context)
