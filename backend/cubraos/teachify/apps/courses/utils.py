"""
Utility functions for courses app
"""
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile
from django.db.models import Q
import colorsys
import hashlib


def get_color_from_id(course_id):
    """Generate a consistent color based on course ID"""
    hash_obj = hashlib.md5(str(course_id).encode())
    hash_hex = hash_obj.hexdigest()
    
    # Convert hash to HSL
    hue = int(hash_hex[:6], 16) / 0xFFFFFF
    saturation = 0.7
    lightness = 0.5
    
    # Convert HSL to RGB
    r, g, b = colorsys.hls_to_rgb(hue, lightness, saturation)
    return (int(r * 255), int(g * 255), int(b * 255))


def generate_placeholder_thumbnail(course_id, title, width=400, height=300):
    """
    Generate a placeholder thumbnail image for a course
    
    Args:
        course_id: ID of the course
        title: Title of the course
        width: Image width (default: 400)
        height: Image height (default: 300)
    
    Returns:
        ContentFile object with the generated image
    """
    try:
        # Get color based on course ID
        bg_color = get_color_from_id(course_id)
        
        # Create image
        img = Image.new('RGB', (width, height), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fallback to default
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
            small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        except:
            font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        # Add text
        text_color = (255, 255, 255)
        
        # Draw title (wrapped if too long)
        lines = []
        words = title.split()
        current_line = ""
        
        for word in words:
            test_line = current_line + (" " if current_line else "") + word
            if len(test_line) > 30:
                if current_line:
                    lines.append(current_line)
                current_line = word
            else:
                current_line = test_line
        
        if current_line:
            lines.append(current_line)
        
        # Draw wrapped text in center
        total_lines = len(lines)
        line_height = 50
        start_y = (height - (total_lines * line_height)) // 2
        
        for i, line in enumerate(lines[:3]):  # Max 3 lines
            y = start_y + (i * line_height)
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) // 2
            draw.text((x, y), line, fill=text_color, font=font)
        
        # Add "Course" text at bottom
        footer_text = "📚 Course"
        bbox = draw.textbbox((0, 0), footer_text, font=small_font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) // 2
        draw.text((x, height - 50), footer_text, fill=text_color, font=small_font)
        
        # Save to BytesIO
        img_io = BytesIO()
        img.save(img_io, format='JPEG', quality=85)
        img_io.seek(0)
        
        # Return as ContentFile
        return ContentFile(img_io.getvalue(), name=f'placeholder_{course_id}.jpg')
    
    except Exception as e:
        print(f"Error generating placeholder thumbnail: {e}")
        return None


def assign_placeholder_thumbnails_to_courses():
    """
    Assign placeholder thumbnails to all courses that don't have one
    Returns count of courses updated
    """
    from .models import Course
    
    courses_without_thumbnails = Course.objects.filter(
        Q(thumbnail__isnull=True) | Q(thumbnail='')
    )
    
    count = 0
    for course in courses_without_thumbnails:
        try:
            placeholder = generate_placeholder_thumbnail(course.id, course.title)
            if placeholder:
                course.thumbnail.save(f'placeholder_{course.id}.jpg', placeholder, save=True)
                count += 1
                print(f"✓ Generated thumbnail for: {course.title}")
        except Exception as e:
            print(f"✗ Failed to generate thumbnail for {course.title}: {e}")
    
    return count
