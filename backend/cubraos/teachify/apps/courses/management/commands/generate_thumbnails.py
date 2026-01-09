"""
Django management command to generate placeholder thumbnails for courses without images
Usage: python manage.py generate_thumbnails
"""
from django.core.management.base import BaseCommand
from django.db.models import Q
from courses.models import Course
from courses.utils import generate_placeholder_thumbnail


class Command(BaseCommand):
    help = 'Generate placeholder thumbnails for courses without images'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Regenerate thumbnails even for courses that already have them',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        if force:
            courses = Course.objects.all()
            self.stdout.write(self.style.WARNING('Regenerating thumbnails for ALL courses...'))
        else:
            courses = Course.objects.filter(
                Q(thumbnail__isnull=True) | Q(thumbnail='')
            )
            self.stdout.write(f'Found {courses.count()} courses without thumbnails')
        
        if not courses.exists():
            self.stdout.write(self.style.SUCCESS('✓ All courses already have thumbnails!'))
            return
        
        count = 0
        for course in courses:
            try:
                placeholder = generate_placeholder_thumbnail(course.id, course.title)
                if placeholder:
                    course.thumbnail.save(f'placeholder_{course.id}.jpg', placeholder, save=True)
                    count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ {course.title}')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ {course.title}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✓ Successfully generated {count} thumbnails!')
        )
