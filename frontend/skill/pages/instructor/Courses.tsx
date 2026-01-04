import React, { useState, useEffect } from 'react';
import { Lang, Theme, Course } from '../../types';
import { api } from '../../api/client';
import { Button, Card, Input } from '../../components/UI';
import { Reveal } from '../../components/Reveal';
import { Plus, Search, Filter, MoreVertical, BookOpen, X, CheckCircle, Send, Video, FileText, Upload } from 'lucide-react';

const InstructorCourses: React.FC<{ lang: Lang, theme: Theme }> = ({ lang, theme }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isEn = lang === 'en';

  // State for adding new course
  const [newCourse, setNewCourse] = useState({
      title: '',
      description: '',
      price: '0.00',
      category: 1,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80'
  });

  // State for adding lesson/resource
  const [newContent, setNewContent] = useState<{
      title: string;
      description: string;
      type: 'video' | 'pdf';
      file: File | null;
  }>({
      title: '',
      description: '',
      type: 'video',
      file: null
  });

  const fetchCourses = async () => {
    const data = await api.courses.getInstructorDashboard();
    setCourses(data.my_courses);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      await api.instructor.createCourse(newCourse);
      setIsSubmitting(false);
      setShowSuccess(true);
      fetchCourses();
      setTimeout(() => {
          setShowSuccess(false);
          setShowAddModal(false);
          setNewCourse({ title: '', description: '', price: '0.00', category: 1, thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80' });
      }, 1500);
  };

  const handleAddContent = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedCourse || !newContent.file) return;
      
      setIsSubmitting(true);
      if (newContent.type === 'video') {
          await api.instructor.addLesson(selectedCourse.id, { title: newContent.title, description: newContent.description }, newContent.file);
      } else {
          await api.instructor.addResource(selectedCourse.id, { title: newContent.title }, newContent.file);
      }
      
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
          setShowSuccess(false);
          setShowLessonModal(false);
          setSelectedCourse(null);
          setNewContent({ title: '', description: '', type: 'video', file: null });
      }, 1500);
  };

  return (
    <div className="pt-32 sm:pt-40 pb-10 px-4 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <Reveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{isEn ? "My Courses" : "كورساتي"}</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-1">{isEn ? "Manage and organize your content" : "إدارة وتنظيم المحتوى الخاص بك"}</p>
           </div>
           <Button onClick={() => setShowAddModal(true)}>
             <Plus size={18} /> {isEn ? "Add New Course" : "إضافة كورس جديد"}
           </Button>
        </div>
      </Reveal>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {courses.map((course, i) => (
             <Reveal key={course.id} delay={i * 0.1} width="100%">
                 <Card className="!p-0 overflow-hidden group border-2 border-transparent hover:border-primary/50 transition-colors h-full flex flex-col">
                     <div className="relative h-44 shrink-0">
                         <img src={course.thumbnail} className="w-full h-full object-cover" alt={course.title} />
                         <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-white/10">
                             {course.status === 'published' ? (isEn ? 'Published' : 'منشور') : (isEn ? 'Draft' : 'مسودة')}
                         </div>
                     </div>
                     <div className="p-5 flex-1 flex flex-col">
                         <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 line-clamp-1">{course.title}</h3>
                         
                         <div className="flex flex-col gap-2 mt-auto">
                             <Button 
                                variant="outline" 
                                className="w-full text-xs !py-2 justify-between"
                                onClick={() => { setSelectedCourse(course); setNewContent({...newContent, type: 'video'}); setShowLessonModal(true); }}
                             >
                                <span className="flex items-center gap-2"><Video size={14}/> {isEn ? "Add Video Lesson" : "إضافة درس فيديو"}</span>
                                <Plus size={14}/>
                             </Button>
                             <Button 
                                variant="outline" 
                                className="w-full text-xs !py-2 justify-between border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white"
                                onClick={() => { setSelectedCourse(course); setNewContent({...newContent, type: 'pdf'}); setShowLessonModal(true); }}
                             >
                                <span className="flex items-center gap-2"><FileText size={14}/> {isEn ? "Add PDF Resource" : "إضافة ملف PDF"}</span>
                                <Plus size={14}/>
                             </Button>
                         </div>
                     </div>
                 </Card>
             </Reveal>
         ))}
      </div>

      {/* Modal for Adding Lesson/PDF */}
      {showLessonModal && selectedCourse && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowLessonModal(false)}></div>
              <Card className="w-full max-w-lg relative z-10 !p-0 shadow-2xl animate-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newContent.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-600'}`}>
                            {newContent.type === 'video' ? <Video size={20}/> : <FileText size={20}/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                {newContent.type === 'video' ? (isEn ? "New Video Lesson" : "درس فيديو جديد") : (isEn ? "New PDF Resource" : "ملف PDF جديد")}
                            </h3>
                            <p className="text-[10px] text-slate-500">Course: {selectedCourse.title}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                  </div>
                  <div className="p-6">
                      {showSuccess ? (
                          <div className="flex flex-col items-center justify-center py-8 text-emerald-500">
                              <CheckCircle size={48} className="mb-4 animate-bounce" />
                              <h4 className="font-bold text-lg text-center">{isEn ? "Content Uploaded & Students Notified!" : "تم الرفع وإخطار الطلاب بنجاح!"}</h4>
                          </div>
                      ) : (
                          <form onSubmit={handleAddContent} className="space-y-4">
                              <Input label={isEn ? "Title" : "العنوان"} value={newContent.title} onChange={e => setNewContent({...newContent, title: e.target.value})} required />
                              {newContent.type === 'video' && (
                                <Input label={isEn ? "Description" : "الوصف"} value={newContent.description} onChange={e => setNewContent({...newContent, description: e.target.value})} />
                              )}
                              
                              <div className="relative border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                  <input 
                                      type="file" 
                                      accept={newContent.type === 'video' ? "video/*" : "application/pdf"}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                      onChange={(e) => setNewContent({...newContent, file: e.target.files?.[0] || null})}
                                      required
                                  />
                                  {newContent.file ? (
                                      <div className="text-center z-10">
                                          <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                                          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate max-w-xs">{newContent.file.name}</span>
                                          <span className="text-[10px] text-slate-500 uppercase">{(newContent.file.size / (1024*1024)).toFixed(2)} MB</span>
                                      </div>
                                  ) : (
                                      <div className="text-center text-slate-500 z-10">
                                          <Upload size={32} className="mx-auto mb-2 opacity-50 group-hover:scale-110 transition-transform"/>
                                          <span className="text-xs font-bold block">{isEn ? `Click to upload ${newContent.type.toUpperCase()}` : `اضغط لرفع ملف ${newContent.type.toUpperCase()}`}</span>
                                      </div>
                                  )}
                              </div>
                              <Button type="submit" className="w-full" isLoading={isSubmitting}><Send size={18}/> {isEn ? "Publish Content" : "نشر المحتوى"}</Button>
                          </form>
                      )}
                  </div>
              </Card>
          </div>
      )}

      {/* Modal for Creating New Course */}
      {showAddModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
              <Card className="w-full max-w-lg relative z-10 !p-0 shadow-2xl animate-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">{isEn ? "Create New Course" : "إنشاء كورس جديد"}</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                  </div>
                  <div className="p-6">
                      {showSuccess ? (
                          <div className="flex flex-col items-center justify-center py-8 text-emerald-500">
                              <CheckCircle size={48} className="mb-4 animate-bounce" />
                              <h4 className="font-bold text-lg">{isEn ? "Course Launched!" : "تم إطلاق الكورس!"}</h4>
                          </div>
                      ) : (
                          <form onSubmit={handleCreateCourse} className="space-y-4">
                              <Input label={isEn ? "Course Title" : "عنوان الكورس"} value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                              <Input label={isEn ? "Description" : "الوصف"} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} required />
                              <div className="grid grid-cols-2 gap-4">
                                  <Input label={isEn ? "Price ($)" : "السعر ($)"} value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} required />
                                  <Input label={isEn ? "Category ID" : "التصنيف"} value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: parseInt(e.target.value)})} required />
                              </div>
                              <Input label={isEn ? "Thumbnail URL" : "رابط الصورة"} value={newCourse.thumbnail} onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} required />
                              <Button type="submit" className="w-full" isLoading={isSubmitting}><Send size={18}/> {isEn ? "Create Course" : "إنشاء الكورس"}</Button>
                          </form>
                      )}
                  </div>
              </Card>
          </div>
      )}
    </div>
  );
};

export default InstructorCourses;