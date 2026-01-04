
import axios from 'axios';
import { 
  User, Course, Lesson, Resource, DashboardData, ExamResult, 
  InstructorDashboardData, Notification, PendingQuiz, ExamAttempt, 
  PublicInstructor, ExamSubmission, Certificate, Assignment, 
  InstructorStudent, PlatformStats, Question 
} from '../types';

const BASE_URL = 'http://127.0.0.1:8000'; 

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for consistent error handling
httpClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // If the error is 401 Unauthorized, we might want to trigger a logout
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
    }
    return Promise.reject(err);
  }
);

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      const response = await httpClient.post('/api/token/', { email, password });
      const { access, user } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('user_data', JSON.stringify({ ...user, token: access }));
      return user;
    },
    register: async (data: any) => (await httpClient.post('/api/accounts/register/', data)).data,
    updateProfile: async (data: any) => (await httpClient.patch('/api/accounts/profile/', data)).data
  },
  courses: {
    list: async (): Promise<Course[]> => (await httpClient.get('/api/courses/courses/')).data,
    getDetail: async (id: number): Promise<Course> => (await httpClient.get(`/api/courses/courses/${id}/`)).data,
    getDashboard: async (): Promise<DashboardData> => (await httpClient.get('/api/courses/dashboard/')).data,
    enroll: async (id: number) => (await httpClient.post(`/api/courses/courses/${id}/enroll/`)).data,
    getInstructorDashboard: async (): Promise<InstructorDashboardData> => (await httpClient.get('/api/courses/instructor-dashboard/')).data,
    getStudents: async (): Promise<InstructorStudent[]> => (await httpClient.get('/api/courses/students/')).data
  },
  wishlist: {
    list: async () => (await httpClient.get('/api/courses/wishlist/')).data,
    add: async (courseId: number) => (await httpClient.post('/api/courses/wishlist/', { course: courseId })).data,
    remove: async (courseId: number) => (await httpClient.delete(`/api/courses/wishlist/${courseId}/`)).data,
  },
  notifications: {
    list: async (userId: number): Promise<Notification[]> => (await httpClient.get(`/api/notifications/notifications/?user=${userId}`)).data,
    markRead: async (id: number) => (await httpClient.patch(`/api/notifications/notifications/${id}/`, { is_read: true })).data,
    send: async (studentId: number, message: string) => (await httpClient.post('/api/notifications/notifications/', { user: studentId, message, type: 'message' })).data,
    requestCertificate: async (courseTitle: string, user: User, instructorId: number) => (await httpClient.post('/api/notifications/notifications/', { user: instructorId, title: 'Certificate Request', message: `${user.username} requested a certificate for ${courseTitle}`, type: 'certificate_request', student_id: user.id })).data,
  },
  // Added Question to fix the missing type error
  exams: {
    list: async () => (await httpClient.get('/api/exams/exams/')).data,
    getQuestions: async (examId: number): Promise<Question[]> => (await httpClient.get(`/api/exams/exams/${examId}/questions/`)).data,
    submit: async (examId: number, data: any): Promise<ExamResult> => (await httpClient.post(`/api/exams/exams/${examId}/submit/`, data)).data,
  },
  instructor: {
    getWalletData: async () => (await httpClient.get('/api/instructor/wallet/')).data,
    createCourse: async (data: any) => (await httpClient.post('/api/courses/courses/', data)).data,
    addLesson: async (courseId: number, data: any, file: File) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('video', file);
        return (await httpClient.post(`/api/courses/courses/${courseId}/lessons/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })).data;
    },
    addResource: async (courseId: number, data: any, file: File) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('file', file);
        return (await httpClient.post(`/api/courses/courses/${courseId}/resources/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })).data;
    },
    sendCertificate: async (studentId: number, courseTitle: string, file: File) => {
        const formData = new FormData();
        formData.append('student', studentId.toString());
        formData.append('course_title', courseTitle);
        formData.append('image', file);
        return (await httpClient.post('/api/instructor/certificates/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })).data;
    },
    getExamSubmissions: async (examId: number): Promise<ExamSubmission[]> => (await httpClient.get(`/api/exams/exams/${examId}/submissions/`)).data,
    createExam: async (data: any) => (await httpClient.post('/api/exams/exams/', data)).data,
  },
  public: {
      getStats: async (): Promise<PlatformStats> => (await httpClient.get('/api/public/stats/')).data,
      getInstructors: async (): Promise<PublicInstructor[]> => (await httpClient.get('/api/public/instructors/')).data,
  }
};
