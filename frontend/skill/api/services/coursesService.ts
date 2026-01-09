// File: frontend/skill/api/services/coursesService.ts
/**
 * Courses Service
 * Handles all course-related API calls
 */
import apiClient, { handleApiError } from "../config";
import {
  Course,
  Lesson,
  Category,
  Enrollment,
  LessonProgress,
  WishlistItem,
  StudentDashboard,
  InstructorDashboard,
  CreateCourseRequest,
  CreateLessonProgressRequest,
  AddToWishlistRequest,
  PaginatedResponse,
  InstructorWallet,
  InstructorStudent,
} from "../types";

class CoursesService {
  // ==========================================
  // Course Operations
  // ==========================================

  /**
   * Get all courses
   * GET /api/courses/courses/
   */
  async listCourses(params?: {
    page?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<Course>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Course>>(
        "/api/courses/courses/",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get course details
   * GET /api/courses/courses/{id}/
   */
  async getCourseDetail(id: number): Promise<Course> {
    try {
      const response = await apiClient.get<Course>(
        `/api/courses/courses/${id}/`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new course (Instructor only)
   * POST /api/courses/courses/
   */
  async createCourse(data: CreateCourseRequest | any): Promise<Course> {
    try {
      // Check if thumbnail is a File object
      if (data.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("price", data.price.toString());
        formData.append("category", data.category.toString());
        formData.append("thumbnail", data.thumbnail);

        const response = await apiClient.post<Course>(
          "/api/courses/courses/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } else {
        // Fallback for URL-based thumbnails (if still needed)
        const response = await apiClient.post<Course>(
          "/api/courses/courses/",
          data
        );
        return response.data;
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update course (Instructor only)
   * PATCH /api/courses/courses/{id}/
   */
  async updateCourse(
    id: number,
    data: Partial<CreateCourseRequest> | any
  ): Promise<Course> {
    try {
      // Check if thumbnail is a File object
      if (data.thumbnail instanceof File) {
        const formData = new FormData();
        if (data.title) formData.append("title", data.title);
        if (data.description) formData.append("description", data.description);
        if (data.price) formData.append("price", data.price.toString());
        if (data.category)
          formData.append("category", data.category.toString());
        formData.append("thumbnail", data.thumbnail);

        const response = await apiClient.patch<Course>(
          `/api/courses/courses/${id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } else {
        // Standard JSON update without file
        const response = await apiClient.patch<Course>(
          `/api/courses/courses/${id}/`,
          data
        );
        return response.data;
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete course (Instructor only)
   * DELETE /api/courses/courses/{id}/
   */
  async deleteCourse(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/courses/courses/${id}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Lesson Operations
  // ==========================================

  /**
   * Get all lessons
   * GET /api/courses/lessons/
   */
  async listLessons(): Promise<PaginatedResponse<Lesson>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Lesson>>(
        "/api/courses/lessons/"
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create lesson (Instructor only)
   * POST /api/courses/lessons/
   */
  async createLesson(data: {
    course: number;
    title: string;
    description: string;
    video_url: string;
    order: number;
  }): Promise<Lesson> {
    try {
      const response = await apiClient.post<Lesson>(
        "/api/courses/lessons/",
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add lesson with video file (Instructor only)
   * POST /api/courses/courses/{courseId}/lessons/
   */
  async addLessonWithVideo(
    courseId: number,
    data: { title: string; description: string },
    videoFile: File
  ): Promise<Lesson> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("video", videoFile);

      const response = await apiClient.post<Lesson>(
        `/api/courses/courses/${courseId}/lessons/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update lesson (Instructor only)
   * PATCH /api/courses/lessons/{id}/
   */
  async updateLesson(
    lessonId: number,
    data: Partial<{
      title: string;
      description: string;
      video_url: string;
      order: number;
    }>
  ): Promise<Lesson> {
    try {
      const response = await apiClient.patch<Lesson>(
        `/api/courses/lessons/${lessonId}/`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete lesson (Instructor only)
   * DELETE /api/courses/lessons/{id}/
   */
  async deleteLesson(lessonId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/courses/lessons/${lessonId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Category Operations
  // ==========================================

  /**
   * Get all categories
   * GET /api/courses/categories/
   */
  async listCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Category>>(
        "/api/courses/categories/"
      );
      console.log("listCategories response:", response);
      console.log("response.data:", response.data);

      // Handle both paginated and direct array responses
      if (Array.isArray(response.data)) {
        console.log("Response is array");
        return response.data;
      } else if (response.data && response.data.results) {
        console.log("Response has results property");
        return response.data.results;
      } else {
        console.warn("Unexpected response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error in listCategories:", error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new category
   * POST /api/courses/categories/
   */
  async createCategory(data: { name: string }): Promise<Category> {
    try {
      const response = await apiClient.post<Category>(
        "/api/courses/categories/",
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Enrollment Operations
  // ==========================================

  /**
   * Enroll in a course
   * POST /api/courses/enrollments/
   */
  async enrollInCourse(courseId: number): Promise<Enrollment> {
    try {
      const response = await apiClient.post<Enrollment>(
        "/api/courses/enrollments/",
        { course: courseId }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's enrollments
   * GET /api/courses/enrollments/
   */
  async listEnrollments(): Promise<Enrollment[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Enrollment>>(
        "/api/courses/enrollments/"
      );
      return response.data.results;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Progress Operations
  // ==========================================

  /**
   * Get lesson progress
   * GET /api/courses/progress/
   */
  async listProgress(): Promise<LessonProgress[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<LessonProgress>>(
        "/api/courses/progress/"
      );
      return response.data.results;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update lesson progress
   * POST /api/courses/progress/
   */
  async updateProgress(
    data: CreateLessonProgressRequest
  ): Promise<LessonProgress> {
    try {
      const response = await apiClient.post<LessonProgress>(
        "/api/courses/progress/",
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Wishlist Operations
  // ==========================================

  /**
   * Get user's wishlist
   * GET /api/courses/wishlist/
   */
  async listWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<WishlistItem>>(
        "/api/courses/wishlist/"
      );
      return response.data.results;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add course to wishlist
   * POST /api/courses/wishlist/
   */
  async addToWishlist(courseId: number): Promise<WishlistItem> {
    try {
      const response = await apiClient.post<WishlistItem>(
        "/api/courses/wishlist/",
        { course: courseId }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove from wishlist
   * DELETE /api/courses/wishlist/{id}/
   */
  async removeFromWishlist(courseId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/courses/wishlist/${courseId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Dashboard Operations
  // ==========================================

  /**
   * Get student dashboard
   * GET /api/courses/dashboard/
   */
  async getStudentDashboard(): Promise<StudentDashboard> {
    try {
      const response = await apiClient.get<StudentDashboard>(
        "/api/courses/dashboard/"
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get instructor dashboard
   * GET /api/courses/instructor/dashboard/
   */
  async getInstructorDashboard(): Promise<InstructorDashboard> {
    try {
      const response = await apiClient.get<InstructorDashboard>(
        "/api/courses/instructor/dashboard/"
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // ==========================================
  // Instructor-Specific Operations
  // ==========================================

  /**
   * Get instructor wallet data
   * GET /api/courses/instructor/wallet/
   */
  async getInstructorWallet(): Promise<InstructorWallet> {
    try {
      const response = await apiClient.get<InstructorWallet>(
        "/api/courses/instructor/wallet/"
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get instructor's students
   * GET /api/courses/instructor/students/
   */
  async getInstructorStudents(): Promise<InstructorStudent[]> {
    try {
      const response = await apiClient.get<InstructorStudent[]>(
        "/api/courses/instructor/students/"
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add resource to course
   * POST /api/courses/courses/{courseId}/resources/
   */
  async addResource(
    courseId: number,
    data: { title: string },
    file: File
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("file", file);

      const response = await apiClient.post(
        `/api/courses/courses/${courseId}/resources/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new CoursesService();
